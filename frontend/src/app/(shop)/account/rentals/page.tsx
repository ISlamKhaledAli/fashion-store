"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { rentalApi } from "@/lib/api";
import type { Rental, RentalStatus } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  Calendar,
  Clock,
  ShieldCheck,
  MapPin,
  Truck,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function UserRentalsPage() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [returnRentalId, setReturnRentalId] = useState<string | null>(null);
  const [returnNotes, setReturnNotes] = useState("");
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  const fetchRentals = async () => {
    try {
      setLoading(true);
      const res = await rentalApi.getMyRentals();
      if (res.data?.success && res.data?.data) {
        setRentals(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch rentals", err);
      toast.error("Failed to load your rentals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchRentals();
  }, []);

  const handleCancelRental = async (id: string) => {
    try {
      const res = await rentalApi.cancel(id);
      if (res.data?.success) {
        toast.success("Reservation cancelled successfully");
        void fetchRentals();
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to cancel reservation";
      toast.error(msg);
    }
  };

  const handleConfirmReturn = async () => {
    if (!returnRentalId) return;

    try {
      setIsSubmittingReturn(true);
      const res = await rentalApi.requestReturn(returnRentalId, {
        notes: returnNotes || undefined,
      });

      if (res.data?.success) {
        toast.success(
          "Return request submitted! Our concierge will contact you."
        );
        setReturnRentalId(null);
        setReturnNotes("");
        void fetchRentals();
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to submit return request";
      toast.error(msg);
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  const getStatusBadge = (status: RentalStatus) => {
    switch (status) {
      case "RESERVED":
        return (
          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
            Reserved
          </span>
        );
      case "ACTIVE":
        return (
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            Active Rental
          </span>
        );
      case "RETURN_PENDING":
        return (
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            Return Pending
          </span>
        );
      case "RETURNED":
        return (
          <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
            Returned
          </span>
        );
      case "OVERDUE":
        return (
          <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
            Overdue
          </span>
        );
      case "CANCELLED":
        return (
          <span className="rounded-full bg-zinc-200 px-2.5 py-0.5 text-xs font-semibold text-zinc-500 line-through dark:bg-zinc-800 dark:text-zinc-400">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const calculateDaysRemaining = (endDateStr: string) => {
    const end = new Date(endDateStr);
    const now = new Date();
    const diff = Math.ceil(
      (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff < 0) return `${Math.abs(diff)} days overdue`;
    if (diff === 0) return "Due today";
    return `${diff} days remaining`;
  };

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-surface">
        <AccountSidebar />

        <main className="flex-1 p-8 lg:p-12">
          <div className="mb-8">
            <h1 className="font-serif text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100">
              My Rentals &amp; Bookings
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Manage your current wear schedule, initiate returns, and view past
              luxury reservations.
            </p>
          </div>

          {loading ? (
            <div className="flex min-h-[40vh] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
            </div>
          ) : rentals.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-800">
              <Clock className="mx-auto h-12 w-12 text-zinc-400" />
              <h3 className="mt-4 font-serif text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                No Rentals Yet
              </h3>
              <p className="mt-1 text-sm text-zinc-500">
                Explore our rentable couture collections for upcoming galas,
                weddings, and special events.
              </p>
              <Link href="/products" className="mt-6 inline-block">
                <Button className="bg-amber-600 px-6 text-white hover:bg-amber-700">
                  Explore Collection
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {rentals.map((rental) => {
                const mainImage =
                  rental.product?.images?.find((img) => img.isMain)?.url ||
                  rental.product?.images?.[0]?.url ||
                  "/placeholder-fashion.jpg";

                const isOverdue =
                  rental.status === "OVERDUE" ||
                  (rental.status === "ACTIVE" &&
                    new Date(rental.endDate) < new Date());

                return (
                  <div
                    key={rental.id}
                    className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xs transition-all dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
                      {/* Product Image */}
                      <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                        <Image
                          src={mainImage}
                          alt={rental.product?.name || "Rental Piece"}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-1.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-mono text-xs font-semibold text-zinc-400">
                            #{rental.id.slice(-8).toUpperCase()}
                          </span>
                          {getStatusBadge(rental.status)}
                        </div>

                        <h3 className="font-serif text-base font-semibold text-zinc-900 dark:text-zinc-100">
                          {rental.product?.name}
                        </h3>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                          {rental.variant && (
                            <span>
                              {rental.variant.color} / Size{" "}
                              {rental.variant.size}
                            </span>
                          )}
                          <span>&bull;</span>
                          <span className="flex items-center gap-1">
                            {rental.fulfillment === "DELIVERY" ? (
                              <>
                                <Truck className="h-3.5 w-3.5" /> Delivery
                              </>
                            ) : (
                              <>
                                <MapPin className="h-3.5 w-3.5" />{" "}
                                {rental.pickupLocation || "Salon Pickup"}
                              </>
                            )}
                          </span>
                        </div>

                        {/* Dates row */}
                        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-medium">
                          <span className="flex items-center gap-1 text-zinc-700 dark:text-zinc-300">
                            <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                            {new Date(
                              rental.startDate
                            ).toLocaleDateString()}{" "}
                            &mdash;{" "}
                            {new Date(rental.endDate).toLocaleDateString()}
                          </span>

                          {rental.status === "ACTIVE" && (
                            <span
                              className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${
                                isOverdue
                                  ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                                  : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                              }`}
                            >
                              {calculateDaysRemaining(rental.endDate)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Price & Actions */}
                      <div className="flex flex-col items-start justify-between border-t border-zinc-100 pt-3 sm:items-end sm:border-t-0 sm:pt-0 dark:border-zinc-800">
                        <div className="text-left sm:text-right">
                          <div className="font-serif text-base font-bold text-zinc-900 dark:text-zinc-100">
                            {formatCurrency(rental.rentalPrice)}
                          </div>
                          {rental.securityDeposit > 0 && (
                            <div className="flex items-center gap-1 text-[11px] text-zinc-500">
                              <ShieldCheck className="h-3 w-3 text-emerald-600" />
                              Deposit: {formatCurrency(rental.securityDeposit)}
                              {rental.depositReturned
                                ? " (Refunded)"
                                : " (Held)"}
                            </div>
                          )}
                          {rental.lateFee > 0 && (
                            <div className="text-[11px] font-semibold text-rose-600">
                              Late fee: {formatCurrency(rental.lateFee)}
                            </div>
                          )}
                        </div>

                        <div className="mt-3 flex gap-2 sm:mt-4">
                          {rental.status === "RESERVED" && (
                            <button
                              type="button"
                              onClick={() => handleCancelRental(rental.id)}
                              className="inline-flex items-center gap-1 rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300"
                            >
                              <XCircle className="h-3.5 w-3.5 text-rose-500" />
                              Cancel
                            </button>
                          )}

                          {(rental.status === "ACTIVE" ||
                            rental.status === "OVERDUE") && (
                            <button
                              type="button"
                              onClick={() => setReturnRentalId(rental.id)}
                              className="inline-flex items-center gap-1 rounded-md bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                              Initiate Return
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Return Modal */}
          {returnRentalId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
              <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-5 w-5 text-amber-600" />
                  <h3 className="font-serif text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    Request Rental Return
                  </h3>
                </div>
                <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                  Please confirm you are ready to return the piece. Our team
                  will schedule courier pickup or prepare check-in at the salon.
                </p>

                <div className="mt-4">
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Return Notes or Condition Remarks (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={returnNotes}
                    onChange={(e) => setReturnNotes(e.target.value)}
                    placeholder="e.g. Dry-cleaned, ready for pickup at reception..."
                    className="mt-1 w-full rounded-md border border-zinc-300 p-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setReturnRentalId(null);
                      setReturnNotes("");
                    }}
                    className="rounded-md border border-zinc-300 px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isSubmittingReturn}
                    onClick={handleConfirmReturn}
                    className="rounded-md bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
                  >
                    {isSubmittingReturn
                      ? "Submitting..."
                      : "Confirm Return Request"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
