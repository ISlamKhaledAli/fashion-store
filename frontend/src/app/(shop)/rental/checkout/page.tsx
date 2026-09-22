"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { productApi, rentalApi, addressApi } from "@/lib/api";
import type { Product, Variant, Address, RentalPeriod } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  Clock,
  ShieldCheck,
  MapPin,
  Truck,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
} from "lucide-react";
import { toast } from "sonner";

function RentalCheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const productId = searchParams.get("productId") || "";
  const variantId = searchParams.get("variantId") || "";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";
  const rentalPeriodId = searchParams.get("rentalPeriodId") || "";
  const fulfillment = (searchParams.get("fulfillment") || "DELIVERY") as
    "DELIVERY" | "STORE_PICKUP";
  const pickupLocation =
    searchParams.get("pickupLocation") || "Cairo Flagship Salon (Zamalek)";

  const [product, setProduct] = useState<Product | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successRentalId, setSuccessRentalId] = useState<string | null>(null);

  // Inline Address Form State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    firstName: "",
    lastName: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    country: "EG",
  });

  useEffect(() => {
    let active = true;

    async function fetchData() {
      try {
        if (!productId) {
          router.push("/products");
          return;
        }

        const [prodRes, addrRes] = await Promise.allSettled([
          productApi.getByIdentifier(productId),
          addressApi.getAll(),
        ]);

        if (!active) return;

        if (prodRes.status === "fulfilled" && prodRes.value.data?.data) {
          setProduct(prodRes.value.data.data);
        }

        if (addrRes.status === "fulfilled" && addrRes.value.data?.data) {
          const addrList = addrRes.value.data.data;
          setAddresses(addrList);
          const defaultAddr = addrList.find((a) => a.isDefault) || addrList[0];
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
          } else {
            // No address exists, open address form immediately
            setShowAddressForm(true);
          }
        }
      } catch (err) {
        console.error("Failed to load rental checkout data", err);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void fetchData();

    return () => {
      active = false;
    };
  }, [productId, router]);

  const selectedVariant: Variant | undefined = product?.variants.find(
    (v) => v.id === variantId
  );

  const selectedPeriod: RentalPeriod | undefined = product?.rentalPeriods?.find(
    (p) => p.id === rentalPeriodId
  );

  const durationDays = selectedPeriod
    ? selectedPeriod.days
    : startDate && endDate
      ? Math.max(
          1,
          Math.ceil(
            (new Date(endDate).getTime() - new Date(startDate).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 3;

  const rentalFee = selectedPeriod
    ? selectedPeriod.price
    : (product?.rentalPrice || 0) * durationDays;

  const securityDeposit = product?.securityDeposit || 0;
  const totalCost = rentalFee + securityDeposit;

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !addressForm.firstName.trim() ||
      !addressForm.lastName.trim() ||
      !addressForm.street.trim() ||
      !addressForm.city.trim()
    ) {
      toast.error("Please fill in first name, last name, street, and city");
      return;
    }

    setIsSavingAddress(true);
    try {
      const res = await addressApi.create({
        firstName: addressForm.firstName.trim(),
        lastName: addressForm.lastName.trim(),
        street: addressForm.street.trim(),
        city: addressForm.city.trim(),
        state: addressForm.state.trim() || addressForm.city.trim(),
        zip: addressForm.zip.trim() || "11511",
        country: addressForm.country || "EG",
        phone: addressForm.phone.trim() || undefined,
        isDefault: addresses.length === 0,
      });

      if (res.data?.success && res.data?.data) {
        const created = res.data.data as Address;
        setAddresses((prev) => [created, ...prev]);
        setSelectedAddressId(created.id);
        setShowAddressForm(false);
        toast.success("Delivery address saved successfully");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save address";
      toast.error(msg);
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleConfirmReservation = async () => {
    if (!product || !selectedVariant) return;

    if (fulfillment === "DELIVERY" && !selectedAddressId) {
      toast.error("Please provide a delivery address before confirming");
      setShowAddressForm(true);
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await rentalApi.create({
        productId: product.id,
        variantId: selectedVariant.id,
        rentalPeriodId: selectedPeriod?.id,
        startDate,
        endDate,
        fulfillment,
        pickupLocation:
          fulfillment === "STORE_PICKUP" ? pickupLocation : undefined,
        addressId: fulfillment === "DELIVERY" ? selectedAddressId : undefined,
        notes: notes || undefined,
      });

      if (res.data?.success && res.data?.data?.rental) {
        const rental = res.data.data.rental;
        const clientSecret = res.data.data.clientSecret;

        if (clientSecret) {
          try {
            await rentalApi.confirmPayment(rental.id, {});
          } catch {
            // Soft fallback: booking remains in RESERVED state
          }
        }

        setSuccessRentalId(rental.id);
        toast.success("Rental reservation booked successfully!");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to create rental reservation";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (successRentalId) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="font-headline text-3xl font-normal text-on-surface">
          Reservation Confirmed
        </h1>
        <p className="mt-2 font-sans text-xs leading-relaxed text-on-surface-variant">
          Your luxury wear booking has been reserved in our atelier schedule.
          You can track dates, collection status, and return arrangements in
          your account.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Link href="/account/rentals">
            <Button className="border-none bg-primary px-6 py-3 font-label text-xs tracking-widest text-on-primary uppercase hover:opacity-90">
              View My Rentals
            </Button>
          </Link>
          <Link href="/products">
            <Button
              variant="outline"
              className="border-outline-variant px-6 py-3 font-label text-xs tracking-widest uppercase"
            >
              Continue Browsing
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const mainImage =
    product?.images.find((img) => img.isMain)?.url ||
    product?.images[0]?.url ||
    "/placeholder-fashion.jpg";

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Back Link */}
      <Link
        href={`/products/${product?.slug || ""}`}
        className="mb-8 inline-flex items-center gap-2 font-label text-xs tracking-widest text-on-surface-variant uppercase transition-colors hover:text-on-surface"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Garment
      </Link>

      <div className="border-b border-outline-variant/60 pb-6">
        <h1 className="font-headline text-2xl font-normal tracking-tight text-on-surface sm:text-3xl">
          Review &amp; Reserve Rental
        </h1>
        <p className="mt-1 font-sans text-xs text-on-surface-variant">
          Finalize your booking details and confirm delivery or salon
          collection.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Garment info & fulfillment */}
        <div className="space-y-6 lg:col-span-7">
          {/* Item details card */}
          <div className="flex gap-4 border border-outline-variant bg-surface-container-lowest p-5">
            <div className="relative h-28 w-24 shrink-0 overflow-hidden bg-surface-container-low">
              <Image
                src={mainImage}
                alt={product?.name || "Product"}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col justify-between">
              <div>
                <span className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase">
                  {product?.brand?.name || "The Curator Atelier"}
                </span>
                <h3 className="font-headline text-base font-normal text-on-surface">
                  {product?.name}
                </h3>
                <div className="mt-1 flex flex-wrap gap-2 text-xs text-on-surface-variant">
                  {selectedVariant && (
                    <>
                      <span>Size: {selectedVariant.size}</span>
                      <span>&bull;</span>
                      <span>Color: {selectedVariant.color}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-medium text-on-surface">
                <Clock className="h-4 w-4 text-on-surface-variant" />
                <span>
                  {durationDays} Days (
                  {new Date(startDate).toLocaleDateString()} &mdash;{" "}
                  {new Date(endDate).toLocaleDateString()})
                </span>
              </div>
            </div>
          </div>

          {/* Fulfillment details */}
          <div className="border border-outline-variant bg-surface-container-lowest p-5">
            <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3">
              <h3 className="flex items-center gap-2 font-headline text-base font-normal text-on-surface">
                {fulfillment === "DELIVERY" ? (
                  <>
                    <Truck className="h-4 w-4 text-primary" />
                    Delivery Destination
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4 text-primary" />
                    Boutique Salon Pickup
                  </>
                )}
              </h3>

              {fulfillment === "DELIVERY" && !showAddressForm && (
                <button
                  type="button"
                  onClick={() => setShowAddressForm(true)}
                  className="flex items-center gap-1 font-label text-xs tracking-wider text-primary uppercase underline hover:opacity-80"
                >
                  <Plus className="h-3 w-3" /> Add Address
                </button>
              )}
            </div>

            {fulfillment === "DELIVERY" ? (
              <div className="mt-4 space-y-4">
                {/* Inline Address Creation Form */}
                {showAddressForm ? (
                  <form
                    onSubmit={handleCreateAddress}
                    className="space-y-3 border border-outline-variant bg-surface p-4"
                  >
                    <div className="flex items-center justify-between border-b border-outline-variant/60 pb-2">
                      <span className="font-label text-xs font-semibold tracking-wider text-on-surface uppercase">
                        Enter Delivery Address
                      </span>
                      {addresses.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowAddressForm(false)}
                          className="text-on-surface-variant hover:text-on-surface"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Input
                        label="First Name"
                        placeholder="e.g. Layla"
                        value={addressForm.firstName}
                        onChange={(e) =>
                          setAddressForm((p) => ({
                            ...p,
                            firstName: e.target.value,
                          }))
                        }
                        required
                      />
                      <Input
                        label="Last Name"
                        placeholder="e.g. Mansour"
                        value={addressForm.lastName}
                        onChange={(e) =>
                          setAddressForm((p) => ({
                            ...p,
                            lastName: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>

                    <Input
                      label="Street Address / Building"
                      placeholder="e.g. 24 Gezira St, Apt 4B"
                      value={addressForm.street}
                      onChange={(e) =>
                        setAddressForm((p) => ({
                          ...p,
                          street: e.target.value,
                        }))
                      }
                      required
                    />

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <Input
                        label="City"
                        placeholder="e.g. Cairo"
                        value={addressForm.city}
                        onChange={(e) =>
                          setAddressForm((p) => ({
                            ...p,
                            city: e.target.value,
                          }))
                        }
                        required
                      />
                      <Input
                        label="District / State"
                        placeholder="e.g. Zamalek"
                        value={addressForm.state}
                        onChange={(e) =>
                          setAddressForm((p) => ({
                            ...p,
                            state: e.target.value,
                          }))
                        }
                      />
                      <Input
                        label="Phone Number"
                        placeholder="e.g. +2010..."
                        value={addressForm.phone}
                        onChange={(e) =>
                          setAddressForm((p) => ({
                            ...p,
                            phone: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      {addresses.length > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowAddressForm(false)}
                          className="font-label text-xs uppercase"
                        >
                          Cancel
                        </Button>
                      )}
                      <Button
                        type="submit"
                        disabled={isSavingAddress}
                        className="border-none bg-primary font-label text-xs tracking-wider text-on-primary uppercase"
                      >
                        {isSavingAddress ? "Saving..." : "Save & Use Address"}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {addresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;
                      return (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={cn(
                            "cursor-pointer border p-3.5 text-left transition-all",
                            isSelected
                              ? "border-primary bg-surface-container shadow-xs"
                              : "border-outline-variant bg-surface hover:border-primary/60"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-label text-xs font-semibold text-on-surface uppercase">
                              {addr.firstName} {addr.lastName}
                            </span>
                            {isSelected && (
                              <span className="h-2 w-2 rounded-full bg-primary" />
                            )}
                          </div>
                          <div className="mt-1 font-sans text-xs text-on-surface-variant">
                            {addr.street}
                          </div>
                          <div className="text-[11px] text-on-surface-variant/80">
                            {addr.city}, {addr.state || addr.country}
                          </div>
                          {addr.phone && (
                            <div className="mt-1 text-[10px] text-on-surface-variant">
                              Tel: {addr.phone}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-4 border border-outline-variant bg-surface p-4 text-xs text-on-surface-variant">
                <div className="flex items-center gap-2 font-medium text-on-surface">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{pickupLocation}</span>
                </div>
                <p className="mt-1 text-[11px]">
                  Operating Hours: Daily 11:00 AM &ndash; 10:00 PM
                </p>
                <p className="mt-2 text-[11px] leading-relaxed">
                  Please bring your booking reservation email and official photo
                  ID upon pickup and return.
                </p>
              </div>
            )}
          </div>

          {/* Notes textarea */}
          <div className="border border-outline-variant bg-surface-container-lowest p-5">
            <label className="block font-label text-xs tracking-widest text-on-surface uppercase">
              Special Handling Instructions (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Leave with building reception, or specific delivery timing..."
              className="mt-2 w-full border border-outline-variant bg-surface p-3 text-xs text-on-surface transition-colors outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Right Column: Cost summary & confirmation */}
        <div className="lg:col-span-5">
          <div className="sticky top-28 space-y-5 border border-outline-variant bg-surface-container-lowest p-6 shadow-xs">
            <h3 className="border-b border-outline-variant/60 pb-3 font-headline text-lg font-normal text-on-surface">
              Reservation Summary
            </h3>

            <div className="space-y-3 border-b border-outline-variant/60 pb-4 text-xs">
              <div className="flex justify-between text-on-surface-variant">
                <span>Rental Duration</span>
                <span className="font-medium text-on-surface">
                  {durationDays} {durationDays === 1 ? "Day" : "Days"}
                </span>
              </div>

              <div className="flex justify-between text-on-surface-variant">
                <span>Rental Fee</span>
                <span className="font-medium text-on-surface">
                  {formatCurrency(rentalFee)}
                </span>
              </div>

              {securityDeposit > 0 && (
                <div className="flex justify-between text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    Refundable Deposit
                  </span>
                  <span className="font-medium text-on-surface">
                    {formatCurrency(securityDeposit)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-on-surface-variant">
                <span>Fulfillment Dispatch</span>
                <span className="font-medium text-emerald-700 dark:text-emerald-400">
                  {fulfillment === "DELIVERY"
                    ? "Complimentary Courier"
                    : "Boutique Pickup"}
                </span>
              </div>
            </div>

            <div className="flex justify-between font-headline text-lg font-normal text-on-surface">
              <span>Total Payment Today</span>
              <span>{formatCurrency(totalCost)}</span>
            </div>

            <div className="border border-outline-variant/60 bg-surface-container-low p-3.5 text-[11px] leading-relaxed text-on-surface-variant">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-on-surface" />
                <p>
                  Security deposit ({formatCurrency(securityDeposit)}) is held
                  securely and refunded directly to your card upon prompt return
                  in inspected condition.
                </p>
              </div>
            </div>

            <Button
              onClick={handleConfirmReservation}
              disabled={
                isSubmitting ||
                (fulfillment === "DELIVERY" && !selectedAddressId)
              }
              className="w-full border-none bg-primary py-4 font-label text-xs tracking-widest text-on-primary uppercase hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting
                ? "Processing Reservation..."
                : "Confirm & Reserve Booking"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RentalCheckoutPage() {
  return (
    <ProtectedRoute>
      <Suspense
        fallback={
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        }
      >
        <RentalCheckoutContent />
      </Suspense>
    </ProtectedRoute>
  );
}
