"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { productApi, rentalApi, addressApi } from "@/lib/api";
import type { Product, Variant, Address, RentalPeriod } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  Clock,
  ShieldCheck,
  MapPin,
  Truck,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
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

  const handleConfirmReservation = async () => {
    if (!product || !selectedVariant) return;

    if (fulfillment === "DELIVERY" && !selectedAddressId) {
      toast.error("Please choose or add a delivery address");
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
        setSuccessRentalId(res.data.data.rental.id);
        toast.success("Rental reserved successfully!");
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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
      </div>
    );
  }

  if (successRentalId) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          Booking Confirmed!
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Your luxury wear rental reservation has been successfully booked. You
          can track your dates, fulfillment, and return schedule in your
          account.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Link href="/account/rentals">
            <Button className="bg-amber-600 px-6 py-2.5 text-white hover:bg-amber-700">
              View My Rentals
            </Button>
          </Link>
          <Link href="/products">
            <Button variant="outline" className="px-6 py-2.5">
              Continue Shopping
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
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Back Link */}
      <Link
        href={`/products/${product?.slug || ""}`}
        className="mb-6 inline-flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Product
      </Link>

      <h1 className="font-serif text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100">
        Review &amp; Reserve Rental
      </h1>
      <p className="mt-1 text-xs text-zinc-500">
        Complete your booking details and confirm dates for delivery or pickup.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Booking details & fulfillment */}
        <div className="space-y-6 lg:col-span-7">
          {/* Item details card */}
          <div className="flex gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
              <Image
                src={mainImage}
                alt={product?.name || "Product"}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col justify-between">
              <div>
                <span className="text-[11px] font-semibold tracking-wider text-amber-600 uppercase dark:text-amber-500">
                  {product?.brand?.name || "The Curator Rental"}
                </span>
                <h3 className="font-serif text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {product?.name}
                </h3>
                <div className="mt-1 flex flex-wrap gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  {selectedVariant && (
                    <>
                      <span>Size: {selectedVariant.size}</span>
                      <span>&bull;</span>
                      <span>Color: {selectedVariant.color}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                <Clock className="h-4 w-4 text-amber-600" />
                <span>
                  {durationDays} Days (
                  {new Date(startDate).toLocaleDateString()} &mdash;{" "}
                  {new Date(endDate).toLocaleDateString()})
                </span>
              </div>
            </div>
          </div>

          {/* Fulfillment details */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="flex items-center gap-2 font-serif text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {fulfillment === "DELIVERY" ? (
                <>
                  <Truck className="h-5 w-5 text-amber-600" />
                  Delivery Destination
                </>
              ) : (
                <>
                  <MapPin className="h-5 w-5 text-amber-600" />
                  Store / Salon Pickup
                </>
              )}
            </h3>

            {fulfillment === "DELIVERY" ? (
              <div className="mt-4 space-y-3">
                {addresses.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-zinc-300 p-4 text-center dark:border-zinc-700">
                    <p className="text-xs text-zinc-500">
                      No saved addresses found. Please add an address in your
                      account settings before continuing.
                    </p>
                    <Link
                      href="/account/addresses"
                      className="mt-2 inline-block text-xs font-semibold text-amber-600 underline"
                    >
                      Manage Addresses
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {addresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;
                      return (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`rounded-lg border p-3 text-left transition-all ${
                            isSelected
                              ? "border-amber-600 bg-amber-50/40 dark:border-amber-500 dark:bg-amber-950/20"
                              : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-800"
                          }`}
                        >
                          <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                            {addr.firstName} {addr.lastName}
                          </div>
                          <div className="mt-1 text-xs text-zinc-500">
                            {addr.street}, {addr.city}
                          </div>
                          <div className="text-xs text-zinc-400">
                            {addr.country} {addr.zip}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-4 rounded-lg bg-zinc-50 p-4 text-xs text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-300">
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {pickupLocation}
                </p>
                <p className="mt-1">
                  Operating Hours: Daily 11:00 AM &ndash; 10:00 PM
                </p>
                <p className="mt-2 text-zinc-500">
                  Bring your booking confirmation email and national ID when
                  picking up and returning.
                </p>
              </div>
            )}
          </div>

          {/* Notes textarea */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <label className="block font-serif text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Special Instructions or Requests (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Please leave package with doorman, or specific tailoring notes..."
              className="mt-2 w-full rounded-md border border-zinc-300 p-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>
        </div>

        {/* Right Column: Cost summary & confirmation */}
        <div className="lg:col-span-5">
          <div className="sticky top-28 space-y-5 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="font-serif text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Pricing Summary
            </h3>

            <div className="space-y-3 border-b border-zinc-200 pb-4 text-xs dark:border-zinc-800">
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Rental Cost ({durationDays} Days)</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {formatCurrency(rentalFee)}
                </span>
              </div>

              {securityDeposit > 0 && (
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    Refundable Deposit
                  </span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {formatCurrency(securityDeposit)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Fulfillment Fee</span>
                <span className="font-medium text-emerald-600">
                  {fulfillment === "DELIVERY" ? "Complimentary" : "Free Pickup"}
                </span>
              </div>
            </div>

            <div className="flex justify-between font-serif text-base font-bold text-zinc-900 dark:text-zinc-100">
              <span>Total Payment Today</span>
              <span>{formatCurrency(totalCost)}</span>
            </div>

            <div className="rounded-lg bg-amber-50/60 p-3 text-[11px] text-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <p>
                  The deposit amount ({formatCurrency(securityDeposit)}) is held
                  safely and automatically refunded upon successful return of
                  the piece in pristine condition.
                </p>
              </div>
            </div>

            <Button
              onClick={handleConfirmReservation}
              disabled={
                isSubmitting ||
                (fulfillment === "DELIVERY" && !selectedAddressId)
              }
              className="w-full bg-amber-600 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-amber-700 disabled:opacity-60 dark:bg-amber-600 dark:hover:bg-amber-700"
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
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
          </div>
        }
      >
        <RentalCheckoutContent />
      </Suspense>
    </ProtectedRoute>
  );
}
