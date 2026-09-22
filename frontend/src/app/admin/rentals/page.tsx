"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { adminRentalApi } from "@/lib/api";
import type { Rental, RentalStatus } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Search, MapPin, Truck } from "lucide-react";
import { toast } from "sonner";
import { Select } from "@/components/ui/Select";

interface RentalAnalytics {
  totalRentals: number;
  activeRentals: number;
  overdueRentals: number;
  returnedRentals: number;
  totalRentalRevenue: number;
  depositsHeld: number;
}

const statusFilters: { label: string; value: string }[] = [
  { label: "All Rentals", value: "ALL" },
  { label: "Reserved", value: "RESERVED" },
  { label: "Active", value: "ACTIVE" },
  { label: "Return Pending", value: "RETURN_PENDING" },
  { label: "Overdue", value: "OVERDUE" },
  { label: "Returned", value: "RETURNED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export default function AdminRentalsPage() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [analytics, setAnalytics] = useState<RentalAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [lateFeeModalRental, setLateFeeModalRental] = useState<Rental | null>(
    null
  );
  const [lateFeeAmount, setLateFeeAmount] = useState("15");
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rentalsRes, analyticsRes] = await Promise.allSettled([
        adminRentalApi.getAll({
          status: selectedStatus !== "ALL" ? selectedStatus : undefined,
          search: searchQuery || undefined,
        }),
        adminRentalApi.getAnalytics(),
      ]);

      if (rentalsRes.status === "fulfilled" && rentalsRes.value.data?.data) {
        setRentals(rentalsRes.value.data.data);
      }
      if (
        analyticsRes.status === "fulfilled" &&
        analyticsRes.value.data?.data
      ) {
        setAnalytics(analyticsRes.value.data.data);
      }
    } catch {
      toast.error("Failed to load rental data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, [selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void fetchData();
  };

  const handleUpdateStatus = async (id: string, newStatus: RentalStatus) => {
    try {
      setIsUpdating(true);
      const res = await adminRentalApi.updateStatus(id, { status: newStatus });
      if (res.data?.success) {
        toast.success(`Rental marked as ${newStatus}`);
        void fetchData();
      }
    } catch {
      toast.error("Failed to update rental status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRefundDeposit = async (id: string) => {
    try {
      const res = await adminRentalApi.refundDeposit(id);
      if (res.data?.success) {
        toast.success("Deposit marked as refunded");
        void fetchData();
      }
    } catch {
      toast.error("Failed to refund deposit");
    }
  };

  const handleAddLateFee = async () => {
    if (!lateFeeModalRental) return;
    const fee = parseFloat(lateFeeAmount);
    if (isNaN(fee) || fee < 0) {
      toast.error("Please enter a valid positive number");
      return;
    }

    try {
      const res = await adminRentalApi.addLateFee(lateFeeModalRental.id, fee);
      if (res.data?.success) {
        toast.success("Late fee applied");
        setLateFeeModalRental(null);
        void fetchData();
      }
    } catch {
      toast.error("Failed to apply late fee");
    }
  };

  return (
    <div className="space-y-8 p-6 lg:p-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100">
          Rental &amp; Reservation Management
        </h1>
        <p className="mt-1 text-xs text-zinc-500">
          Oversee booked luxury couture, monitor returns schedule, handle
          security deposits and late fees.
        </p>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase">
              Total Bookings
            </span>
            <div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {analytics.totalRentals}
            </div>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
            <span className="text-[11px] font-semibold text-emerald-600 uppercase">
              Active Wears
            </span>
            <div className="mt-2 text-2xl font-bold text-emerald-600">
              {analytics.activeRentals}
            </div>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
            <span className="text-[11px] font-semibold text-rose-600 uppercase">
              Overdue
            </span>
            <div className="mt-2 text-2xl font-bold text-rose-600">
              {analytics.overdueRentals}
            </div>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase">
              Completed
            </span>
            <div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {analytics.returnedRentals}
            </div>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
            <span className="text-[11px] font-semibold text-amber-600 uppercase">
              Rental Revenue
            </span>
            <div className="mt-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {formatCurrency(analytics.totalRentalRevenue)}
            </div>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
            <span className="text-[11px] font-semibold text-blue-600 uppercase">
              Deposits Held
            </span>
            <div className="mt-2 text-xl font-bold text-blue-600">
              {formatCurrency(analytics.depositsHeld)}
            </div>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Status Tabs */}
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1">
          {statusFilters.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setSelectedStatus(tab.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                selectedStatus === tab.value
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative min-w-[240px]">
          <input
            type="text"
            placeholder="Search customer or item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white py-1.5 pr-8 pl-8 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <Search className="absolute top-2 left-2.5 h-3.5 w-3.5 text-zinc-400" />
        </form>
      </div>

      {/* Rentals Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-200 bg-zinc-50 font-semibold tracking-wider text-zinc-600 uppercase dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-3.5">Booking</th>
                <th className="px-4 py-3.5">Customer</th>
                <th className="px-4 py-3.5">Product &amp; Variant</th>
                <th className="px-4 py-3.5">Dates</th>
                <th className="px-4 py-3.5">Fulfillment</th>
                <th className="px-4 py-3.5">Financials</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-400">
                    Loading rentals data...
                  </td>
                </tr>
              ) : rentals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-400">
                    No rental reservations matching criteria.
                  </td>
                </tr>
              ) : (
                rentals.map((r) => {
                  const mainImage =
                    r.product?.images?.find((img) => img.isMain)?.url ||
                    r.product?.images?.[0]?.url ||
                    "/placeholder-fashion.jpg";

                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40"
                    >
                      {/* ID */}
                      <td className="px-4 py-3.5 font-mono font-medium text-zinc-500">
                        #{r.id.slice(-6).toUpperCase()}
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {r.user?.name}
                        </div>
                        <div className="text-[11px] text-zinc-500">
                          {r.user?.email}
                        </div>
                      </td>

                      {/* Product */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="relative h-10 w-8 shrink-0 overflow-hidden rounded bg-zinc-100">
                            <Image
                              src={mainImage}
                              alt={r.product?.name || ""}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-medium text-zinc-900 dark:text-zinc-100">
                              {r.product?.name}
                            </div>
                            <div className="text-[11px] text-zinc-500">
                              {r.variant?.color} &bull; {r.variant?.size}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Dates */}
                      <td className="px-4 py-3.5">
                        <div className="text-zinc-900 dark:text-zinc-100">
                          {new Date(r.startDate).toLocaleDateString()}
                        </div>
                        <div className="text-[11px] text-zinc-500">
                          to {new Date(r.endDate).toLocaleDateString()}
                        </div>
                      </td>

                      {/* Fulfillment */}
                      <td className="px-4 py-3.5">
                        {r.fulfillment === "DELIVERY" ? (
                          <span className="flex items-center gap-1 text-zinc-600 dark:text-zinc-300">
                            <Truck className="h-3.5 w-3.5 text-zinc-400" />{" "}
                            Delivery
                          </span>
                        ) : (
                          <span
                            className="flex items-center gap-1 text-zinc-600 dark:text-zinc-300"
                            title={r.pickupLocation || ""}
                          >
                            <MapPin className="h-3.5 w-3.5 text-zinc-400" />{" "}
                            Salon Pickup
                          </span>
                        )}
                      </td>

                      {/* Financials */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {formatCurrency(r.rentalPrice)}
                        </div>
                        {r.securityDeposit > 0 && (
                          <div className="text-[10px] text-zinc-500">
                            Deposit: {formatCurrency(r.securityDeposit)}{" "}
                            {r.depositReturned ? "(Refunded)" : "(Held)"}
                          </div>
                        )}
                        {r.lateFee > 0 && (
                          <div className="text-[10px] font-bold text-rose-600">
                            +Late Fee: {formatCurrency(r.lateFee)}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <Select
                          variant="filter"
                          disabled={isUpdating}
                          value={r.status}
                          onChange={(val) =>
                            handleUpdateStatus(r.id, val as RentalStatus)
                          }
                          options={[
                            { value: "RESERVED", label: "Reserved" },
                            {
                              value: "ACTIVE",
                              label: "Active (Picked Up/Delivered)",
                            },
                            {
                              value: "RETURN_PENDING",
                              label: "Return Pending",
                            },
                            { value: "RETURNED", label: "Returned (Complete)" },
                            { value: "OVERDUE", label: "Overdue" },
                            { value: "CANCELLED", label: "Cancelled" },
                          ]}
                          className="min-w-[140px]"
                        />
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {r.securityDeposit > 0 && !r.depositReturned && (
                            <button
                              type="button"
                              onClick={() => handleRefundDeposit(r.id)}
                              className="rounded border border-emerald-300 bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                              title="Refund security deposit back to customer"
                            >
                              Refund Deposit
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setLateFeeModalRental(r);
                              setLateFeeAmount(
                                r.lateFee > 0 ? String(r.lateFee) : "15"
                              );
                            }}
                            className="rounded border border-zinc-200 bg-zinc-50 px-2 py-1 text-[11px] font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                          >
                            Late Fee
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Late Fee Modal */}
      {lateFeeModalRental && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Apply Late Fee
            </h3>
            <p className="mt-1 text-xs text-zinc-500">
              Rental #{lateFeeModalRental.id.slice(-6).toUpperCase()} &mdash;{" "}
              {lateFeeModalRental.user?.name}
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Late Fee Amount ($)
              </label>
              <input
                type="number"
                min="0"
                step="5"
                value={lateFeeAmount}
                onChange={(e) => setLateFeeAmount(e.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-300 p-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setLateFeeModalRental(null)}
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddLateFee}
                className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950"
              >
                Save Late Fee
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
