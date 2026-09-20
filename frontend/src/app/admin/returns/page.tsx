"use client";

import React, { useState, useEffect } from "react";
import { returnApi } from "@/lib/api";
import type { ReturnRequest, ReturnStatus } from "@/types";
import { formatCurrency } from "@/lib/utils";

import { toast } from "sonner";

const returnStatuses: { label: string; value: string }[] = [
  { label: "All Requests", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Received", value: "RECEIVED" },
  { label: "Refunded", value: "REFUNDED" },
  { label: "Rejected", value: "REJECTED" },
];

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [activeRefundReturn, setActiveRefundReturn] =
    useState<ReturnRequest | null>(null);
  const [refundAmountInput, setRefundAmountInput] = useState("");
  const [isProcessingRefund, setIsProcessingRefund] = useState(false);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const res = await returnApi.getAdminReturns({
        status: selectedStatus !== "ALL" ? selectedStatus : undefined,
      });
      if (res.data?.success && res.data?.data) {
        setReturns(res.data.data);
      }
    } catch {
      toast.error("Failed to load return requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchReturns();
  }, [selectedStatus]);

  const handleUpdateStatus = async (id: string, status: ReturnStatus) => {
    try {
      const res = await returnApi.updateAdminStatus(id, { status });
      if (res.data?.success) {
        toast.success(`Return marked as ${status}`);
        void fetchReturns();
      }
    } catch {
      toast.error("Failed to update return status");
    }
  };

  const handleConfirmRefund = async () => {
    if (!activeRefundReturn) return;
    const amount = parseFloat(refundAmountInput);

    try {
      setIsProcessingRefund(true);
      const res = await returnApi.processAdminRefund(activeRefundReturn.id, {
        amount: !isNaN(amount) && amount > 0 ? amount : undefined,
      });

      if (res.data?.success) {
        toast.success("Refund successfully initiated through Stripe");
        setActiveRefundReturn(null);
        void fetchReturns();
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to execute refund";
      toast.error(msg);
    } finally {
      setIsProcessingRefund(false);
    }
  };

  const getStatusBadge = (status: ReturnStatus) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            Pending Review
          </span>
        );
      case "APPROVED":
        return (
          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
            Approved (Awaiting Item)
          </span>
        );
      case "RECEIVED":
        return (
          <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-800 dark:bg-purple-950 dark:text-purple-300">
            Item Received
          </span>
        );
      case "REFUNDED":
        return (
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            Refunded
          </span>
        );
      case "REJECTED":
        return (
          <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 p-6 lg:p-10">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100">
          Order Returns &amp; Refunds
        </h1>
        <p className="mt-1 text-xs text-zinc-500">
          Review customer returns requests, approve return shipments, and
          process automatic Stripe refunds.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1">
        {returnStatuses.map((tab) => (
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

      {/* Returns Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-200 bg-zinc-50 font-semibold tracking-wider text-zinc-600 uppercase dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-3.5">Request</th>
                <th className="px-4 py-3.5">Customer</th>
                <th className="px-4 py-3.5">Order Details</th>
                <th className="px-4 py-3.5">Reason &amp; Description</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-400">
                    Loading returns data...
                  </td>
                </tr>
              ) : returns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-400">
                    No return requests matching criteria.
                  </td>
                </tr>
              ) : (
                returns.map((ret) => (
                  <tr
                    key={ret.id}
                    className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40"
                  >
                    <td className="px-4 py-3.5 font-mono font-medium text-zinc-500">
                      #{ret.id.slice(-6).toUpperCase()}
                      <div className="text-[10px] text-zinc-400">
                        {new Date(ret.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {ret.user?.name}
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        {ret.user?.email}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-medium text-zinc-900 dark:text-zinc-100">
                        Order #{ret.orderId.slice(-6).toUpperCase()}
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        Total: {formatCurrency(ret.order?.total || 0)}
                      </div>
                    </td>

                    <td className="max-w-xs px-4 py-3.5">
                      <div className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {ret.reason}
                      </div>
                      {ret.description && (
                        <div className="mt-0.5 line-clamp-2 text-[11px] text-zinc-500">
                          {ret.description}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      {getStatusBadge(ret.status)}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {ret.status === "PENDING" && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateStatus(ret.id, "APPROVED")
                              }
                              className="rounded border border-blue-300 bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-800 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateStatus(ret.id, "REJECTED")
                              }
                              className="rounded border border-rose-300 bg-rose-50 px-2 py-1 text-[11px] font-medium text-rose-800 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {ret.status === "APPROVED" && (
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateStatus(ret.id, "RECEIVED")
                            }
                            className="rounded border border-purple-300 bg-purple-50 px-2 py-1 text-[11px] font-medium text-purple-800 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300"
                          >
                            Mark Received
                          </button>
                        )}

                        {(ret.status === "RECEIVED" ||
                          ret.status === "APPROVED") && (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveRefundReturn(ret);
                              setRefundAmountInput(
                                String(ret.order?.total || 0)
                              );
                            }}
                            className="rounded bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700"
                          >
                            Execute Refund
                          </button>
                        )}

                        {ret.status === "REFUNDED" && ret.refundAmount && (
                          <span className="text-[11px] font-semibold text-emerald-600">
                            Refunded {formatCurrency(ret.refundAmount)}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Refund Modal */}
      {activeRefundReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="font-serif text-base font-bold text-zinc-900 dark:text-zinc-100">
              Confirm Stripe Refund
            </h3>
            <p className="mt-1 text-xs text-zinc-500">
              Customer: {activeRefundReturn.user?.name} &bull; Order #
              {activeRefundReturn.orderId.slice(-6).toUpperCase()}
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Refund Amount ($)
              </label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={refundAmountInput}
                onChange={(e) => setRefundAmountInput(e.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-300 p-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveRefundReturn(null)}
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessingRefund}
                onClick={handleConfirmRefund}
                className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {isProcessingRefund ? "Processing..." : "Process Refund"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
