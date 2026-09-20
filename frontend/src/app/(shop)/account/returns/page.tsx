"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCcw,
  CheckCircle2,
  Clock,
  XCircle,
  Package,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  Truck,
} from "lucide-react";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { returnApi } from "@/lib/api";
import type { ReturnRequest } from "@/types";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";

const STATUS_FILTERS = [
  "ALL",
  "PENDING",
  "APPROVED",
  "RECEIVED",
  "REFUNDED",
  "REJECTED",
] as const;

export default function CustomerReturnsPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");

  const fetchReturns = useCallback(async () => {
    try {
      const res = await returnApi.getMyReturns();
      if (res.data.success) {
        setReturns(res.data.data);
      }
    } catch (error) {
      console.error("Failed to load customer returns:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  const filteredReturns =
    activeFilter === "ALL"
      ? returns
      : returns.filter((r) => r.status === activeFilter);

  const getStatusBadge = (status: ReturnRequest["status"]) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
            <Clock size={13} />
            Pending Review
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
            <Truck size={13} />
            Approved &bull; Awaiting Collection
          </span>
        );
      case "RECEIVED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700 dark:bg-purple-950/50 dark:text-purple-300">
            <Package size={13} />
            Parcel Received at Atelier
          </span>
        );
      case "REFUNDED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
            <CheckCircle2 size={13} />
            Refund Issued
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
            <XCircle size={13} />
            Declined
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-surface">
        <AccountSidebar />

        <main className="flex-1 px-8 py-12 lg:px-16">
          <div className="mx-auto max-w-5xl space-y-10">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 border-b border-outline-variant/15 pb-8 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-3xl font-medium tracking-tight text-on-surface">
                  Order Returns &amp; Exchanges
                </h1>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Track the status of your atelier returns, courier pickups, and
                  refund disbursements.
                </p>
              </div>

              <Link href="/account/orders">
                <Button variant="outline" className="gap-2">
                  <Package size={16} />
                  <span>View Delivered Orders</span>
                </Button>
              </Link>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {STATUS_FILTERS.map((filter) => {
                const count =
                  filter === "ALL"
                    ? returns.length
                    : returns.filter((r) => r.status === filter).length;

                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveFilter(filter)}
                    className={cn(
                      "flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-all",
                      activeFilter === filter
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                        : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                    )}
                  >
                    <span>{filter.toLowerCase()}</span>
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[10px]",
                        activeFilter === filter
                          ? "bg-white/20 text-white dark:bg-black/20 dark:text-zinc-900"
                          : "bg-surface-container-high text-on-surface-variant"
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Content List */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-36 w-full rounded-xl" />
                ))}
              </div>
            ) : filteredReturns.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-outline-variant/30 bg-surface-container-lowest py-20 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant">
                  <RotateCcw size={28} strokeWidth={1.5} />
                </div>
                <h3 className="mt-4 text-base font-semibold text-on-surface">
                  No return requests found
                </h3>
                <p className="mt-1 max-w-sm text-xs text-on-surface-variant">
                  You do not have any active or historical return requests in
                  this view.
                </p>
                <Link href="/account/orders" className="mt-6">
                  <Button className="gap-2">
                    <span>Explore My Orders</span>
                    <ArrowRight size={16} />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {filteredReturns.map((ret) => (
                    <motion.div
                      key={ret.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="rounded-2xl border border-outline-variant/15 bg-surface p-6 shadow-xs transition-shadow hover:shadow-md sm:p-8"
                    >
                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="font-mono text-xs tracking-wider text-on-surface-variant uppercase">
                              Return #{ret.id.slice(-6).toUpperCase()}
                            </span>
                            {getStatusBadge(ret.status)}
                          </div>

                          <h4 className="text-lg font-medium text-on-surface">
                            Reason: {ret.reason.replace(/_/g, " ")}
                          </h4>

                          <p className="text-xs text-on-surface-variant">
                            Associated Order:{" "}
                            <Link
                              href={`/account/orders?id=${ret.orderId}`}
                              className="font-mono font-semibold text-primary underline hover:opacity-80"
                            >
                              #{ret.orderId.slice(-6).toUpperCase()}
                            </Link>{" "}
                            &bull; Submitted on {formatDate(ret.createdAt)}
                          </p>
                        </div>

                        {ret.refundAmount != null && ret.refundAmount > 0 && (
                          <div className="rounded-xl bg-emerald-500/10 p-3 text-right sm:self-start">
                            <span className="text-[10px] tracking-widest text-emerald-800 uppercase dark:text-emerald-300">
                              Refund Amount
                            </span>
                            <p className="font-serif text-lg font-bold text-emerald-700 dark:text-emerald-400">
                              {formatCurrency(ret.refundAmount)}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Customer Note */}
                      {ret.description && (
                        <div className="mt-4 rounded-xl border border-outline-variant/10 bg-surface-container-low p-4 text-xs text-on-surface-variant">
                          <span className="font-semibold text-on-surface">
                            Your Notes:{" "}
                          </span>
                          <span>{ret.description}</span>
                        </div>
                      )}

                      {/* Admin/Atelier Resolution Notes */}
                      {ret.adminNotes && (
                        <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-50/50 p-4 text-xs text-amber-900 dark:bg-amber-950/20 dark:text-amber-200">
                          <AlertCircle
                            size={16}
                            className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
                          />
                          <div>
                            <span className="font-semibold">
                              Atelier Concierge Note:{" "}
                            </span>
                            <span>{ret.adminNotes}</span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Assistance Section */}
            <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-outline-variant/15 bg-surface-container-low p-6 sm:flex-row">
              <div className="flex items-center gap-3">
                <HelpCircle className="h-6 w-6 text-on-surface-variant" />
                <div>
                  <h4 className="text-sm font-semibold text-on-surface">
                    Questions about your return or exchange?
                  </h4>
                  <p className="text-xs text-on-surface-variant">
                    Review our comprehensive 14-day policy or reach out to our
                    style concierge.
                  </p>
                </div>
              </div>

              <Link href="/returns">
                <Button variant="outline" size="sm">
                  View Return Policy
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
