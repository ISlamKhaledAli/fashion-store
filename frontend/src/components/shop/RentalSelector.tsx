"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency, cn } from "@/lib/utils";
import type { Product, Variant } from "@/types";
import { rentalApi } from "@/lib/api";
import { Button } from "../ui/Button";
import { Select } from "../ui/Select";
import {
  Calendar as CalendarIcon,
  ShieldCheck,
  MapPin,
  Truck,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

interface RentalSelectorProps {
  product: Product;
  selectedVariant: Variant | undefined;
}

interface StoreSalon {
  name: string;
  address: string;
}

const DEFAULT_SALONS: StoreSalon[] = [
  { name: "Cairo Flagship Salon", address: "15 Brazil St, Zamalek, Cairo" },
  { name: "Alexandria Boutique", address: "Glim Bay, Alexandria" },
];

export const RentalSelector: React.FC<RentalSelectorProps> = ({
  product,
  selectedVariant,
}) => {
  const router = useRouter();

  // Admin max rental duration limit (defaults to 14 if not set)
  const maxAllowedDays = Math.max(1, product.maxRentalDays || 14);
  const baseDailyRate =
    product.rentalPrice || Math.round(product.price * 0.15) || 25;

  // Dates helpers
  const formatDateToISO = (d: Date) => d.toISOString().split("T")[0];

  const getTomorrowString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return formatDateToISO(d);
  };

  const [startDate, setStartDate] = useState<string>(getTomorrowString());
  // Default customer selected days to 3 (or max if max < 3)
  const [selectedDays, setSelectedDays] = useState<number>(
    Math.min(3, maxAllowedDays)
  );

  const [fulfillment, setFulfillment] = useState<"DELIVERY" | "STORE_PICKUP">(
    "DELIVERY"
  );
  const [salons, setSalons] = useState<StoreSalon[]>(DEFAULT_SALONS);
  const [selectedSalon, setSelectedSalon] = useState<string>(
    DEFAULT_SALONS[0].name
  );

  // Filter salons if admin has configured specific pickupLocations for this product
  const availableSalons = useMemo(() => {
    if (
      product.pickupLocations &&
      Array.isArray(product.pickupLocations) &&
      product.pickupLocations.length > 0
    ) {
      const filtered = salons.filter((s) =>
        product.pickupLocations!.includes(s.name)
      );
      return filtered.length > 0 ? filtered : salons;
    }
    return salons;
  }, [salons, product.pickupLocations]);

  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  // Fetch dynamic salons configured by admin
  useEffect(() => {
    let isMounted = true;
    rentalApi
      .getSalons()
      .then((res) => {
        if (isMounted && res.data?.data && res.data.data.length > 0) {
          const list = res.data.data;
          setSalons(list);
          const validSalons =
            product.pickupLocations && product.pickupLocations.length > 0
              ? list.filter((s: StoreSalon) =>
                  product.pickupLocations!.includes(s.name)
                )
              : list;
          if (validSalons.length > 0) {
            setSelectedSalon(validSalons[0].name);
          }
        }
      })
      .catch(() => {
        // Fallback to defaults
      });

    return () => {
      isMounted = false;
    };
  }, [product.pickupLocations]);

  // Compute calculated end date from start date + selectedDays
  const endDate = useMemo(() => {
    if (!startDate) return "";
    const d = new Date(startDate);
    d.setDate(d.getDate() + selectedDays);
    return formatDateToISO(d);
  }, [startDate, selectedDays]);

  // Compute maximum return date string for datepicker constraint
  const maxReturnDateStr = useMemo(() => {
    if (!startDate) return "";
    const d = new Date(startDate);
    d.setDate(d.getDate() + maxAllowedDays);
    return formatDateToISO(d);
  }, [startDate, maxAllowedDays]);

  // Handle return date change directly from date input
  const handleReturnDateChange = (newReturnDate: string) => {
    if (!startDate || !newReturnDate) return;
    const start = new Date(startDate);
    const end = new Date(newReturnDate);
    const diffTime = end.getTime() - start.getTime();
    const days = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (days < 1) {
      toast.error("Return date must be at least 1 day after pickup");
      return;
    }

    if (days > maxAllowedDays) {
      toast.error(
        `Atelier policy permits a maximum of ${maxAllowedDays} days for this garment`
      );
      setSelectedDays(maxAllowedDays);
      return;
    }

    setSelectedDays(days);
  };

  // Price calculations
  const rentalFee = baseDailyRate * selectedDays;
  const securityDeposit = product.securityDeposit || 0;
  const totalAmount = rentalFee + securityDeposit;

  // Check schedule availability whenever dates or variant change
  useEffect(() => {
    if (!selectedVariant?.id || !startDate || !endDate) return;

    let isMounted = true;
    setIsChecking(true);

    void (async () => {
      try {
        const res = await rentalApi.checkAvailability(selectedVariant.id, {
          startDate,
          endDate,
        });
        if (isMounted) {
          setIsAvailable(res.data?.data?.available ?? true);
        }
      } catch {
        if (isMounted) {
          setIsAvailable(selectedVariant.stock > 0);
        }
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [selectedVariant?.id, selectedVariant?.stock, startDate, endDate]);

  const handleProceedToRentalCheckout = () => {
    if (!selectedVariant) {
      toast.error("Please select a size and color first");
      return;
    }

    if (isAvailable === false) {
      toast.error("This item is unavailable for the selected dates");
      return;
    }

    const params = new URLSearchParams({
      productId: product.id,
      variantId: selectedVariant.id,
      startDate,
      endDate,
      fulfillment,
      ...(fulfillment === "STORE_PICKUP"
        ? { pickupLocation: selectedSalon }
        : {}),
    });

    router.push(`/rental/checkout?${params.toString()}`);
  };

  // Generate quick days options (e.g. 1, 2, 3, 4, 7... up to maxAllowedDays)
  const quickDayOptions = useMemo(() => {
    const defaultOptions = [1, 2, 3, 4, 7, 10, 14];
    const available = defaultOptions.filter((d) => d <= maxAllowedDays);
    if (!available.includes(maxAllowedDays) && maxAllowedDays > 1) {
      available.push(maxAllowedDays);
    }
    return available.sort((a, b) => a - b);
  }, [maxAllowedDays]);

  return (
    <div className="space-y-6 rounded-none border border-outline-variant bg-surface-container-lowest p-6 shadow-xs transition-all">
      {/* Luxury Editorial Header */}
      <div className="flex items-center justify-between border-b border-outline-variant/60 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-headline text-lg font-normal tracking-wide text-on-surface">
              Archival Rental Reservation
            </span>
            <span className="rounded-full bg-surface-container-high px-2.5 py-0.5 font-label text-[10px] font-semibold tracking-widest text-on-surface-variant uppercase">
              Haute Atelier
            </span>
          </div>
          <p className="font-sans text-xs text-on-surface-variant">
            Reserve this collector piece for your upcoming private event
          </p>
        </div>
      </div>

      {/* 1. Flexible Duration Selection */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="font-label text-xs tracking-widest text-on-surface uppercase">
            1. Select Rental Duration
          </label>
          <span className="text-[11px] font-medium text-on-surface-variant">
            Atelier limit: Max {maxAllowedDays} days
          </span>
        </div>

        {/* Quick Days Selector Pills */}
        <div className="flex flex-wrap gap-2">
          {quickDayOptions.map((days) => {
            const isSelected = selectedDays === days;
            return (
              <button
                key={days}
                type="button"
                onClick={() => setSelectedDays(days)}
                className={cn(
                  "cursor-pointer border px-3.5 py-2 text-xs font-medium tracking-wider uppercase transition-all",
                  isSelected
                    ? "border-primary bg-primary text-on-primary shadow-xs"
                    : "border-outline-variant bg-surface text-on-surface hover:border-primary"
                )}
              >
                {days} {days === 1 ? "Day" : "Days"}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-1 text-[11px] text-on-surface-variant">
          <span>
            Current selection:{" "}
            <strong className="font-semibold text-on-surface">
              {selectedDays} {selectedDays === 1 ? "Day" : "Days"}
            </strong>{" "}
            (@ {formatCurrency(baseDailyRate)}/day)
          </span>
          {selectedDays === maxAllowedDays && (
            <span className="font-medium text-amber-700 dark:text-amber-400">
              Maximum allowed booking
            </span>
          )}
        </div>
      </div>

      {/* 2. Date Selection (Start Date & Return Date) */}
      <div className="space-y-2.5">
        <label className="font-label text-xs tracking-widest text-on-surface uppercase">
          2. Reserve Booking Dates
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Start Date */}
          <div className="space-y-1">
            <span className="font-label text-[10px] tracking-wider text-on-surface-variant uppercase">
              Delivery / Pickup Date
            </span>
            <div className="relative">
              <input
                type="date"
                min={getTomorrowString()}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-outline-variant bg-surface px-3 py-2.5 pl-9 text-xs text-on-surface transition-colors outline-none focus:border-primary"
              />
              <CalendarIcon className="pointer-events-none absolute top-3 left-3 h-3.5 w-3.5 text-on-surface-variant" />
            </div>
          </div>

          {/* Return Date (Customer can adjust or read dynamic end date) */}
          <div className="space-y-1">
            <span className="font-label text-[10px] tracking-wider text-on-surface-variant uppercase">
              Return Date ({selectedDays} Days)
            </span>
            <div className="relative">
              <input
                type="date"
                min={startDate}
                max={maxReturnDateStr}
                value={endDate}
                onChange={(e) => handleReturnDateChange(e.target.value)}
                className="w-full border border-outline-variant bg-surface px-3 py-2.5 pl-9 text-xs text-on-surface transition-colors outline-none focus:border-primary"
              />
              <CalendarIcon className="pointer-events-none absolute top-3 left-3 h-3.5 w-3.5 text-on-surface-variant" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Fulfillment Method */}
      <div className="space-y-2.5">
        <label className="font-label text-xs tracking-widest text-on-surface uppercase">
          3. Fulfillment Method
        </label>
        <div className="grid grid-cols-2 gap-2">
          {/* Courier Delivery */}
          <button
            type="button"
            onClick={() => setFulfillment("DELIVERY")}
            className={cn(
              "flex items-center justify-center gap-2 border py-2.5 text-xs font-medium tracking-wide uppercase transition-all",
              fulfillment === "DELIVERY"
                ? "border-primary bg-primary text-on-primary"
                : "border-outline-variant bg-surface text-on-surface hover:border-primary"
            )}
          >
            <Truck className="h-3.5 w-3.5" />
            Courier Delivery
          </button>

          {/* Salon Pickup */}
          <button
            type="button"
            onClick={() => setFulfillment("STORE_PICKUP")}
            className={cn(
              "flex items-center justify-center gap-2 border py-2.5 text-xs font-medium tracking-wide uppercase transition-all",
              fulfillment === "STORE_PICKUP"
                ? "border-primary bg-primary text-on-primary"
                : "border-outline-variant bg-surface text-on-surface hover:border-primary"
            )}
          >
            <MapPin className="h-3.5 w-3.5" />
            Salon Pickup
          </button>
        </div>

        {/* Courier Delivery Notice */}
        {fulfillment === "DELIVERY" && (
          <div className="mt-2 rounded-none border border-outline-variant/60 bg-surface-container-low p-3 text-xs text-on-surface-variant">
            <div className="flex items-center gap-2 font-medium text-on-surface">
              <Truck className="h-4 w-4 text-primary" />
              <span>White-Glove Doorstep Delivery</span>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed">
              Your piece will be securely dispatched to your address. You can
              enter or select your shipping address at the next checkout
              confirmation step.
            </p>
          </div>
        )}

        {/* Salon Pickup Location Selector (Dynamically configured by Admin) */}
        {fulfillment === "STORE_PICKUP" && (
          <div className="mt-2">
            <Select
              label="Select Salon Flagship"
              value={selectedSalon}
              onChange={setSelectedSalon}
              options={availableSalons.map((salon) => ({
                value: salon.name,
                label: `${salon.name} — ${salon.address}`,
              }))}
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* Schedule Availability Notice */}
      <div className="flex items-center gap-2 text-xs">
        {isChecking ? (
          <span className="font-sans text-[11px] text-on-surface-variant">
            Verifying atelier archive schedule...
          </span>
        ) : isAvailable === true ? (
          <span className="flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" /> Available for reservation on
            selected dates
          </span>
        ) : isAvailable === false ? (
          <span className="flex items-center gap-1.5 font-medium text-rose-700 dark:text-rose-400">
            <AlertCircle className="h-4 w-4" /> Currently booked for these
            dates. Please try another range.
          </span>
        ) : null}
      </div>

      {/* Pricing Breakdown Card */}
      <div className="space-y-2 border border-outline-variant/60 bg-surface-container-low p-4 text-xs">
        <div className="flex justify-between text-on-surface-variant">
          <span>
            Rental Fee ({selectedDays} {selectedDays === 1 ? "Day" : "Days"})
          </span>
          <span className="font-medium text-on-surface">
            {formatCurrency(rentalFee)}
          </span>
        </div>

        {securityDeposit > 0 && (
          <div className="flex justify-between text-on-surface-variant">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Refundable Security Deposit
            </span>
            <span className="font-medium text-on-surface">
              {formatCurrency(securityDeposit)}
            </span>
          </div>
        )}

        <div className="border-t border-outline-variant/60 pt-2 text-[11px] leading-relaxed text-on-surface-variant">
          The security deposit is securely held and automatically released back
          to your card once the item is inspected upon return.
        </div>

        <div className="flex justify-between border-t border-outline-variant pt-2 font-headline text-base font-semibold text-on-surface">
          <span>Total Today</span>
          <span>{formatCurrency(totalAmount)}</span>
        </div>
      </div>

      {/* Reserve CTA */}
      <Button
        onClick={handleProceedToRentalCheckout}
        disabled={isAvailable === false || isChecking || !selectedVariant}
        className="w-full border-none bg-primary py-4 font-label text-xs tracking-widest text-on-primary uppercase transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        <span>Reserve &amp; Rent Now</span>
        <ChevronRight className="ml-1 h-3.5 w-3.5" />
      </Button>
    </div>
  );
};
