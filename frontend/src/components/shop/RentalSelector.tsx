"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency, cn } from "@/lib/utils";
import type { Product, Variant } from "@/types";
import { rentalApi } from "@/lib/api";
import { Button } from "../ui/Button";
import {
  Calendar,
  Clock,
  ShieldCheck,
  MapPin,
  Truck,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

interface RentalSelectorProps {
  product: Product;
  selectedVariant: Variant | undefined;
}

export const RentalSelector: React.FC<RentalSelectorProps> = ({
  product,
  selectedVariant,
}) => {
  const router = useRouter();

  // Selected period
  const periods = product.rentalPeriods?.filter((p) => p.isActive) || [];
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>(
    periods[0]?.id || ""
  );

  // Dates
  const getTomorrowString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  };

  const [startDate, setStartDate] = useState<string>(getTomorrowString());
  const [fulfillment, setFulfillment] = useState<"DELIVERY" | "STORE_PICKUP">(
    "DELIVERY"
  );
  const [salonLocation, setSalonLocation] = useState<string>(
    "Cairo Flagship Salon (Zamalek)"
  );
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  const selectedPeriod = periods.find((p) => p.id === selectedPeriodId);
  const rentalDays = selectedPeriod
    ? selectedPeriod.days
    : product.maxRentalDays || 3;

  // Compute calculated end date
  const computeEndDate = (start: string, days: number) => {
    if (!start) return "";
    const d = new Date(start);
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  };

  const endDate = computeEndDate(startDate, rentalDays);

  // Price calculations
  const rentalPrice = selectedPeriod
    ? selectedPeriod.price
    : (product.rentalPrice || 0) * rentalDays;
  const securityDeposit = product.securityDeposit || 0;
  const totalAmount = rentalPrice + securityDeposit;

  // Check availability on date or variant change
  useEffect(() => {
    if (!selectedVariant?.id || !startDate || !endDate) return;

    let isMounted = true;

    // Asynchronously verify schedule availability without synchronous cascading renders
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
      toast.error("This item is not available for the selected dates");
      return;
    }

    const params = new URLSearchParams({
      productId: product.id,
      variantId: selectedVariant.id,
      startDate,
      endDate,
      fulfillment,
      ...(selectedPeriodId ? { rentalPeriodId: selectedPeriodId } : {}),
      ...(fulfillment === "STORE_PICKUP"
        ? { pickupLocation: salonLocation }
        : {}),
    });

    router.push(`/rental/checkout?${params.toString()}`);
  };

  return (
    <div className="space-y-6 rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/40">
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-amber-600 dark:text-amber-500" />
          <h3 className="font-serif text-base font-semibold tracking-wide text-zinc-900 dark:text-zinc-100">
            Exclusive Rental Booking
          </h3>
        </div>
        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
          Luxury Wear
        </span>
      </div>

      {/* Select Rental Period */}
      {periods.length > 0 && (
        <div className="space-y-2">
          <label className="block text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
            1. Select Rental Duration
          </label>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {periods.map((period) => {
              const isSelected = selectedPeriodId === period.id;
              return (
                <button
                  type="button"
                  key={period.id}
                  onClick={() => setSelectedPeriodId(period.id)}
                  className={cn(
                    "relative flex flex-col items-center justify-center rounded-lg border p-3 text-center transition-all",
                    isSelected
                      ? "border-zinc-900 bg-white shadow-xs dark:border-zinc-100 dark:bg-zinc-800"
                      : "border-zinc-200 bg-zinc-100/50 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/60"
                  )}
                >
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {period.label}
                  </span>
                  <span className="mt-1 font-serif text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {formatCurrency(period.price)}
                  </span>
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Dates Selection */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
          2. Reserve Booking Dates
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-zinc-500">
              Start Date (Delivery/Pickup)
            </span>
            <div className="relative">
              <input
                type="date"
                min={getTomorrowString()}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 pl-9 text-xs text-zinc-900 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
              <Calendar className="absolute top-2.5 left-2.5 h-4 w-4 text-zinc-400" />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-medium text-zinc-500">
              Return Date ({rentalDays} Days)
            </span>
            <div className="relative">
              <input
                type="date"
                disabled
                value={endDate}
                className="w-full cursor-not-allowed rounded-md border border-zinc-200 bg-zinc-100 px-3 py-2 pl-9 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
              />
              <Calendar className="absolute top-2.5 left-2.5 h-4 w-4 text-zinc-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Fulfillment Options */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
          3. Fulfillment Method
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setFulfillment("DELIVERY")}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg border py-2.5 text-xs font-medium transition-all",
              fulfillment === "DELIVERY"
                ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-950"
                : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            )}
          >
            <Truck className="h-4 w-4" />
            Courier Delivery
          </button>
          <button
            type="button"
            onClick={() => setFulfillment("STORE_PICKUP")}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg border py-2.5 text-xs font-medium transition-all",
              fulfillment === "STORE_PICKUP"
                ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-950"
                : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            )}
          >
            <MapPin className="h-4 w-4" />
            Salon Pickup
          </button>
        </div>

        {fulfillment === "STORE_PICKUP" && (
          <div className="mt-2">
            <select
              value={salonLocation}
              onChange={(e) => setSalonLocation(e.target.value)}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              <option value="Cairo Flagship Salon (Zamalek)">
                Cairo Flagship Salon — 15 Brazil St, Zamalek
              </option>
              <option value="Alexandria Boutique (Glim Bay)">
                Alexandria Boutique — Glim Bay Plaza
              </option>
            </select>
          </div>
        )}
      </div>

      {/* Availability Status */}
      <div className="flex items-center gap-2 text-xs">
        {isChecking ? (
          <span className="text-zinc-500">
            Checking schedule availability...
          </span>
        ) : isAvailable === true ? (
          <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" /> Available for booking on
            selected dates
          </span>
        ) : isAvailable === false ? (
          <span className="flex items-center gap-1.5 font-medium text-rose-600 dark:text-rose-400">
            <AlertCircle className="h-4 w-4" /> Unavailable for these dates.
            Please try another period.
          </span>
        ) : null}
      </div>

      {/* Pricing Breakdown */}
      <div className="space-y-1.5 rounded-lg bg-zinc-100/70 p-3.5 text-xs dark:bg-zinc-800/60">
        <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
          <span>Rental Fee ({rentalDays} Days)</span>
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            {formatCurrency(rentalPrice)}
          </span>
        </div>
        {securityDeposit > 0 && (
          <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Refundable Security Deposit
            </span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {formatCurrency(securityDeposit)}
            </span>
          </div>
        )}
        <div className="border-t border-zinc-200/80 pt-2 text-xs text-zinc-500 dark:border-zinc-700/80 dark:text-zinc-400">
          Deposit is automatically released back to your card once the item is
          inspected and returned.
        </div>
        <div className="flex justify-between border-t border-zinc-300/80 pt-2 font-serif text-sm font-bold text-zinc-900 dark:border-zinc-700 dark:text-zinc-100">
          <span>Total Today</span>
          <span>{formatCurrency(totalAmount)}</span>
        </div>
      </div>

      {/* Reserve CTA */}
      <Button
        onClick={handleProceedToRentalCheckout}
        disabled={isAvailable === false || isChecking || !selectedVariant}
        className="w-full bg-amber-600 py-3.5 text-sm font-medium text-white shadow-md hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700"
      >
        Reserve & Rent Now
      </Button>
    </div>
  );
};
