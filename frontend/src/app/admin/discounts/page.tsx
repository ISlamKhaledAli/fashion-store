"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Copy,
  Search,
  Tag,
  Trash2,
  Power,
  PowerOff,
  Edit2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { DiscountFormPanel } from "@/components/admin/DiscountFormPanel";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { PriceDisplay } from "@/components/admin/PriceDisplay";
import { MetricCard } from "@/components/admin/MetricCard";
import type { AdminTab } from "@/components/admin/AdminTabs";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { cn } from "@/lib/utils";

export interface DiscountItem {
  id: string;
  code: string;
  type: string;
  value: number;
  minOrder: number | null;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
  startDate: string | null;
  revenueGenerated?: number;
}

// Optimized Table Row Component
const DiscountRow = React.memo(
  ({
    discount,
    onEdit,
    onToggleStatus,
    onDelete,
    onCopy,
  }: {
    discount: DiscountItem;
    onEdit: (d: DiscountItem) => void;
    onToggleStatus: (id: string, current: boolean) => void;
    onDelete: (id: string) => void;
    onCopy: (code: string) => void;
  }) => {
    const now = new Date();
    const isExpired = discount.expiresAt && new Date(discount.expiresAt) < now;
    const isScheduled =
      discount.startDate && new Date(discount.startDate) > now;
    const isLimitReached =
      discount.maxUses && discount.usedCount >= discount.maxUses;
    const isDisabled = !discount.isActive;
    const usagePercent = discount.maxUses
      ? (discount.usedCount / discount.maxUses) * 100
      : 0;

    // Derive Status Badge
    let status = "ACTIVE";
    if (isDisabled) status = "DISABLED";
    else if (isExpired) status = "EXPIRED";
    else if (isScheduled) status = "SCHEDULED";
    else if (isLimitReached) status = "LIMIT_REACHED";

    return (
      <tr
        onClick={() => onEdit(discount)}
        className={cn(
          "group/row relative cursor-pointer border-b border-zinc-50 transition-all hover:bg-zinc-50/50",
          (isDisabled || isExpired) && "opacity-60 grayscale-[0.5]",
          isLimitReached && "bg-orange-50/10",
          isScheduled && "opacity-90"
        )}
      >
        <td className="px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-100 bg-zinc-50 transition-colors group-hover/row:bg-white">
              <Tag
                size={18}
                className={cn(
                  "transition-colors",
                  isDisabled || isExpired
                    ? "text-zinc-300"
                    : "text-zinc-400 group-hover/row:text-zinc-950"
                )}
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "font-mono text-sm font-black tracking-widest uppercase transition-colors",
                    isDisabled || isExpired
                      ? "text-zinc-400/70"
                      : "text-zinc-950",
                    isExpired && "line-through"
                  )}
                >
                  {discount.code}
                </span>
                <Button
                  variant="none"
                  size="none"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCopy(discount.code);
                  }}
                  className="rounded-md p-1.5 text-zinc-400 opacity-0 transition-all group-hover/row:opacity-100 hover:bg-zinc-100 hover:text-zinc-950"
                >
                  <Copy size={12} />
                </Button>
              </div>
              <p className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                #{discount.id.slice(-6).toUpperCase()}
              </p>
            </div>
          </div>
        </td>
        <td className="px-4 py-6">
          <StatusBadge status={status} className="origin-left scale-90" />
        </td>
        <td className="px-4 py-6">
          <Badge
            variant="surface"
            className={cn(
              "px-2 py-0.5 text-[9px] font-black uppercase",
              discount.type === "PERCENTAGE"
                ? "border-blue-100 bg-blue-50/20 text-blue-600"
                : "border-purple-100 bg-purple-50/20 text-purple-600",
              (isDisabled || isExpired) && "opacity-50 grayscale"
            )}
          >
            {discount.type === "PERCENTAGE" ? "Perc" : "Fixed"}
          </Badge>
        </td>
        <td className="px-6 py-6">
          <div className="flex flex-col">
            <div
              className={cn(
                "transition-colors",
                isDisabled || isExpired ? "text-zinc-400" : "text-zinc-950"
              )}
            >
              {discount.type === "PERCENTAGE" ? (
                <span className="text-base font-black">{discount.value}%</span>
              ) : (
                <PriceDisplay
                  amount={discount.value}
                  className="text-base font-black"
                />
              )}
            </div>
            <div className="items-center gap-1 text-[10px] font-bold tracking-tight text-zinc-400 uppercase">
              {discount.minOrder ? (
                <>
                  Min:{" "}
                  <PriceDisplay
                    amount={discount.minOrder}
                    className="text-zinc-400"
                  />
                </>
              ) : (
                "No Min"
              )}
            </div>
          </div>
        </td>
        <td className="px-6 py-6">
          <div className="flex max-w-[100px] flex-col gap-1.5">
            <div className="flex items-center justify-between text-[9px] font-black tracking-widest text-zinc-400 uppercase">
              <span
                className={cn(
                  "font-bold tabular-nums",
                  isLimitReached && "text-orange-600"
                )}
              >
                {discount.usedCount}/{discount.maxUses || "∞"}
              </span>
              <span>Used</span>
            </div>
            <div
              className={cn(
                "h-1 overflow-hidden rounded-full bg-zinc-100",
                isLimitReached && "bg-orange-100"
              )}
            >
              <div
                className={cn(
                  "h-full transition-all duration-1000",
                  isLimitReached
                    ? "bg-red-500"
                    : isDisabled || isExpired
                      ? "bg-zinc-300"
                      : "bg-zinc-950"
                )}
                style={{ width: `${Math.min(usagePercent, 100)}%` }}
              />
            </div>
          </div>
        </td>
        <td className="px-6 py-6">
          <div className="flex flex-col">
            <span
              className={cn(
                "text-xs leading-none font-bold",
                isExpired
                  ? "text-red-500"
                  : isDisabled || isScheduled
                    ? "text-zinc-400"
                    : "text-zinc-900"
              )}
            >
              {discount.expiresAt
                ? new Date(discount.expiresAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Never"}
            </span>
            <span className="mt-1 text-[9px] font-black tracking-tighter text-zinc-400 uppercase">
              {isScheduled ? "Starts" : "Expires"}
            </span>
          </div>
        </td>
        <td
          className="px-4 py-6 pr-8 text-right"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex translate-x-2 items-center justify-end gap-1 opacity-0 transition-all group-hover/row:translate-x-0 group-hover/row:opacity-100">
            <Button
              variant="none"
              size="none"
              onClick={() => onToggleStatus(discount.id, discount.isActive)}
              className="rounded-full p-2 text-zinc-400 transition-all hover:bg-zinc-100 hover:text-zinc-950"
              icon={
                discount.isActive ? <PowerOff size={16} /> : <Power size={16} />
              }
            />
            <Button
              variant="none"
              size="none"
              onClick={() => onEdit(discount)}
              className="rounded-full p-2 text-zinc-400 transition-all hover:bg-zinc-100 hover:text-zinc-950"
              icon={<Edit2 size={16} />}
            />
            <Button
              variant="none"
              size="none"
              onClick={() => onDelete(discount.id)}
              className="rounded-full p-2 text-zinc-400 transition-all hover:bg-red-50 hover:text-red-500"
              icon={<Trash2 size={16} />}
            />
          </div>
        </td>
      </tr>
    );
  }
);
DiscountRow.displayName = "DiscountRow";

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<DiscountItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<DiscountItem | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const fetchDiscounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getDiscounts();
      if (res.data.success) {
        setDiscounts(res.data.data as unknown as DiscountItem[]);
      }
    } catch (err) {
      toast.error("Telemetry failure. Records inaccessible.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDiscounts();
  }, [fetchDiscounts]);

  const copyToClipboard = useCallback((code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!");
  }, []);

  const handleEdit = useCallback((discount: DiscountItem) => {
    setEditingDiscount(discount);
    setIsFormOpen(true);
  }, []);

  const handleCreate = useCallback(() => {
    setEditingDiscount(null);
    setIsFormOpen(true);
  }, []);

  const toggleStatus = useCallback(
    async (id: string, currentStatus: boolean) => {
      try {
        await adminApi.updateDiscount(id, { isActive: !currentStatus });
        toast.success(
          `Discount ${!currentStatus ? "activated" : "deactivated"}`
        );
        setDiscounts((prev) =>
          prev.map((d) =>
            d.id === id ? { ...d, isActive: !currentStatus } : d
          )
        );
      } catch (err) {
        toast.error("Status update failed");
      }
    },
    []
  );

  const deleteDiscount = useCallback(async (id: string) => {
    if (!confirm("Permanently purge this promotion from the archives?")) return;
    try {
      await adminApi.deleteDiscount(id);
      toast.success("Manifest purged");
      setDiscounts((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      toast.error("Purge failed");
    }
  }, []);

  const filteredDiscounts = useMemo(() => {
    const now = new Date();
    return discounts.filter((d) => {
      const matchesSearch = d.code
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const isExpired = d.expiresAt && new Date(d.expiresAt) < now;
      const isScheduled = d.startDate && new Date(d.startDate) > now;
      const isLimitReached = d.maxUses && d.usedCount >= d.maxUses;

      let matchesTab = true;
      if (activeTab === "ACTIVE")
        matchesTab = Boolean(
          d.isActive && !isExpired && !isScheduled && !isLimitReached
        );
      if (activeTab === "SCHEDULED")
        matchesTab = Boolean(d.isActive && isScheduled);
      if (activeTab === "EXPIRED") matchesTab = Boolean(isExpired);
      if (activeTab === "INACTIVE") matchesTab = !d.isActive;

      return matchesSearch && matchesTab;
    });
  }, [discounts, searchQuery, activeTab]);

  const paginatedDiscounts = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredDiscounts.slice(start, start + itemsPerPage);
  }, [filteredDiscounts, page]);

  const totalPages = Math.ceil(filteredDiscounts.length / itemsPerPage);

  const stats = useMemo(() => {
    const now = new Date();
    const active = discounts.filter(
      (d) =>
        d.isActive &&
        (!d.expiresAt || new Date(d.expiresAt) > now) &&
        (!d.startDate || new Date(d.startDate) < now) &&
        (!d.maxUses || d.usedCount < d.maxUses)
    ).length;

    const totalUses = discounts.reduce((acc, d) => acc + (d.usedCount || 0), 0);
    const revenue = discounts.reduce(
      (acc, d) => acc + (d.revenueGenerated || 0),
      0
    );

    // Naive conversion: (Total Uses / 100) or similar until we have traffic data
    // Here we use uses relative to total manifests
    const conversions =
      discounts.length > 0
        ? Number((totalUses / (discounts.length * 5)).toFixed(1))
        : 0;

    // Generate real sparkline path based on revenueGenerated of each discount
    const revenuePoints = discounts
      .map((d) => d.revenueGenerated || 0)
      .slice(0, 10)
      .reverse();
    const maxVal = Math.max(...revenuePoints, 1);
    const sparklinePath =
      revenuePoints.length > 1
        ? `M 0 ${20 - (revenuePoints[0] / maxVal) * 15} ` +
          revenuePoints
            .map((v, i) => `L ${i * 10} ${20 - (v / maxVal) * 15}`)
            .join(" ")
        : "M 0 15 L 100 15";

    return {
      active,
      totalUses,
      conversions,
      revenue,
      sparkline: sparklinePath,
    };
  }, [discounts]);

  const tabList: AdminTab[] = useMemo(() => {
    const now = new Date();
    return [
      { id: "ALL", label: "All Codes", count: discounts.length },
      {
        id: "ACTIVE",
        label: "Active",
        count: discounts.filter(
          (d) =>
            d.isActive &&
            (!d.expiresAt || new Date(d.expiresAt) > now) &&
            (!d.startDate || new Date(d.startDate) < now) &&
            (!d.maxUses || d.usedCount < d.maxUses)
        ).length,
      },
      {
        id: "SCHEDULED",
        label: "Scheduled",
        count: discounts.filter(
          (d) => d.isActive && d.startDate && new Date(d.startDate) > now
        ).length,
      },
      {
        id: "EXPIRED",
        label: "Expired",
        count: discounts.filter(
          (d) => d.expiresAt && new Date(d.expiresAt) < now
        ).length,
      },
      {
        id: "INACTIVE",
        label: "Inactive",
        count: discounts.filter((d) => !d.isActive).length,
      },
    ];
  }, [discounts]);

  return (
    <>
      <div className="animate-in fade-in slide-in-from-bottom-4 space-y-12 pb-20 duration-1000">
        {/* Page Header */}
        <div className="flex flex-col items-start justify-between gap-8 xl:flex-row xl:items-end">
          <div className="space-y-4">
            <div>
              <h2 className="text-[3rem] leading-none font-bold tracking-tight text-zinc-950 sm:text-[3.5rem]">
                Discounts
              </h2>
              <p className="mt-4 text-lg font-medium text-zinc-500 italic">
                Designing editorial rewards for a global audience.
              </p>
            </div>

            {!isLoading && discounts.length > 0 && (
              <div className="animate-in fade-in slide-in-from-left-4 flex items-center gap-4 delay-200 duration-1000">
                <Badge variant="surface" className="px-3 py-1 font-black">
                  Promotion Ledger
                </Badge>
                <div className="h-4 w-[1px] bg-zinc-200" />
                <p className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase">
                  {discounts.length} Manifests Generated
                </p>
              </div>
            )}
          </div>
          <div className="flex w-full items-center gap-3 sm:w-auto">
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreate}
              className="flex flex-1 items-center gap-2 rounded-xl bg-zinc-950 px-8 py-3.5 text-xs font-bold tracking-[0.2em] text-white uppercase shadow-2xl transition-all hover:bg-zinc-800 active:scale-95 sm:flex-none"
              icon={<Plus size={16} />}
            >
              Initialize Code
            </Button>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Active Manifests"
            value={stats.active}
            trend={+8}
            href="/admin/discounts"
          />
          <MetricCard
            title="Total Engagement"
            value={stats.totalUses}
            trend={+12}
            suffix=" Uses"
          />
          <MetricCard
            title="Conversion Lift"
            value={stats.conversions}
            suffix="%"
            trend={+0.4}
            progressBar={Number(stats.conversions) * 2}
          />
          <MetricCard
            title="Revenue Impact"
            value={stats.revenue}
            prefix="$"
            trend={+15.2}
            sparkline={
              <svg
                className="h-full w-full fill-none stroke-current stroke-[2] text-zinc-950"
                viewBox="0 0 100 20"
              >
                <path d={stats.sparkline} strokeLinecap="round" />
              </svg>
            }
          />
        </div>

        {/* Control Bar */}
        <div className="flex flex-col items-center justify-between gap-6 border-b border-zinc-100 pb-4 lg:flex-row">
          <AdminTabs
            tabs={tabList}
            activeTab={activeTab}
            onTabChange={(id) => {
              setActiveTab(id);
              setPage(1);
            }}
            layoutId="discountsTabUnderline"
            className="flex-1 lg:flex-none"
          />
          <div className="w-full lg:w-[320px] xl:w-[400px]">
            <Input
              placeholder="Search code manifestation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-xl border-zinc-100 bg-zinc-50/50 py-3.5 shadow-inner transition-all focus:bg-white"
              icon={<Search className="text-zinc-400" />}
            />
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-xl shadow-zinc-200/50">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed border-collapse text-left lg:table-auto">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/50 text-[9px] font-black tracking-[0.2em] text-zinc-400 uppercase">
                  <th className="w-[240px] px-6 py-4">Identity</th>
                  <th className="w-[120px] px-4 py-4">Status</th>
                  <th className="w-[100px] px-4 py-4">Type</th>
                  <th className="w-[140px] px-6 py-4">Financials</th>
                  <th className="w-[160px] px-6 py-4">Usage</th>
                  <th className="w-[140px] px-6 py-4">Timeline</th>
                  <th className="px-4 py-4 pr-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="flex items-center gap-4 px-6 py-6">
                        <Skeleton className="h-10 w-10 rounded-xl" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-2 w-16" />
                        </div>
                      </td>
                      <td className="px-4 py-6">
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </td>
                      <td className="px-4 py-6">
                        <Skeleton className="h-4 w-12 rounded-full" />
                      </td>
                      <td className="px-6 py-6">
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-16" />
                          <Skeleton className="h-2 w-12" />
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="space-y-2">
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className="h-1 w-full" />
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-2 w-12" />
                        </div>
                      </td>
                      <td className="px-4 py-6 pr-8 text-right">
                        <Skeleton className="ml-auto h-6 w-16" />
                      </td>
                    </tr>
                  ))
                ) : paginatedDiscounts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-8 py-44 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center gap-6">
                        <div className="rounded-full bg-zinc-50 p-8 opacity-40 shadow-inner">
                          <Tag
                            size={64}
                            strokeWidth={1}
                            className="text-zinc-400"
                          />
                        </div>
                        <div className="space-y-2 text-center">
                          <h3 className="text-xl font-bold tracking-tight text-zinc-950">
                            Voucher Void
                          </h3>
                          <p className="px-8 text-[11px] leading-relaxed font-bold tracking-widest text-zinc-400 uppercase">
                            No promotions match this search criteria. The
                            editorial catalog is currently empty.
                          </p>
                        </div>
                        <Button
                          variant="primary"
                          onClick={handleCreate}
                          className="mt-6 rounded-xl bg-zinc-950 px-12 py-4 text-[10px] font-black tracking-[0.3em] uppercase shadow-2xl"
                        >
                          Initialize Archives
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedDiscounts.map((discount) => (
                    <DiscountRow
                      key={discount.id}
                      discount={discount}
                      onEdit={handleEdit}
                      onToggleStatus={toggleStatus}
                      onDelete={deleteDiscount}
                      onCopy={copyToClipboard}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex flex-col items-center justify-between gap-6 sm:flex-row">
            <span className="text-xs font-bold tracking-widest text-zinc-400 uppercase">
              Showing{" "}
              {Math.min(
                filteredDiscounts.length,
                (page - 1) * itemsPerPage + 1
              )}{" "}
              to {Math.min(filteredDiscounts.length, page * itemsPerPage)} of{" "}
              {filteredDiscounts.length.toLocaleString()} results
            </span>
            <div className="flex gap-2">
              <Button
                variant="none"
                size="none"
                disabled={page === 1}
                onClick={() => {
                  setPage((p) => p - 1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 font-bold transition-all hover:bg-zinc-50 disabled:opacity-30"
              >
                <ChevronLeft size={18} />
              </Button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <Button
                  variant="none"
                  size="none"
                  key={i}
                  onClick={() => {
                    setPage(i + 1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold transition-all",
                    page === i + 1
                      ? "bg-zinc-950 text-white shadow-xl"
                      : "text-zinc-500 hover:bg-zinc-50"
                  )}
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                variant="none"
                size="none"
                disabled={page === totalPages}
                onClick={() => {
                  setPage((p) => p + 1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 font-bold transition-all hover:bg-zinc-50 disabled:opacity-30"
              >
                <ChevronRight size={18} />
              </Button>
            </div>
          </div>
        )}

        <DiscountFormPanel
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          discount={editingDiscount}
          onSuccess={fetchDiscounts}
        />
      </div>
    </>
  );
}
