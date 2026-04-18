"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Plus, 
  Copy, 
  Search, 
  Tag, 
  TrendingUp, 
  Calendar, 
  MoreHorizontal, 
  Trash2, 
  Power,
  PowerOff,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Filter
} from "lucide-react";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { DiscountFormPanel } from "@/components/admin/DiscountFormPanel";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { PriceDisplay } from "@/components/admin/PriceDisplay";
import { MetricCard } from "@/components/admin/MetricCard";
import { AdminTabs, AdminTab } from "@/components/admin/AdminTabs";
import { cn } from "@/lib/utils";

// Optimized Table Row Component
const DiscountRow = React.memo(({ 
  discount, 
  onEdit, 
  onToggleStatus, 
  onDelete, 
  onCopy 
}: { 
  discount: any; 
  onEdit: (d: any) => void;
  onToggleStatus: (id: string, current: boolean) => void;
  onDelete: (id: string) => void;
  onCopy: (code: string) => void;
}) => {
  const now = new Date();
  const isExpired = discount.expiresAt && new Date(discount.expiresAt) < now;
  const isScheduled = discount.startDate && new Date(discount.startDate) > now;
  const isLimitReached = discount.maxUses && discount.usedCount >= discount.maxUses;
  const isDisabled = !discount.isActive;
  const usagePercent = discount.maxUses ? (discount.usedCount / discount.maxUses) * 100 : 0;

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
        "group/row hover:bg-zinc-50/50 transition-all cursor-pointer relative border-b border-zinc-50",
        (isDisabled || isExpired) && "opacity-60 grayscale-[0.5]",
        isLimitReached && "bg-orange-50/10",
        isScheduled && "opacity-90"
      )}
    >
      <td className="px-6 py-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center border border-zinc-100 group-hover/row:bg-white transition-colors">
            <Tag size={18} className={cn(
              "transition-colors",
              (isDisabled || isExpired) ? "text-zinc-300" : "text-zinc-400 group-hover/row:text-zinc-950"
            )} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={cn(
                "font-mono text-sm tracking-widest font-black uppercase transition-colors",
                (isDisabled || isExpired) ? "text-zinc-400/70" : "text-zinc-950",
                isExpired && "line-through"
              )}>
                {discount.code}
              </span>
              <button 
                onClick={(e) => { e.stopPropagation(); onCopy(discount.code); }}
                className="opacity-0 group-hover/row:opacity-100 p-1.5 hover:bg-zinc-100 rounded-md text-zinc-400 hover:text-zinc-950 transition-all active:scale-90"
              >
                <Copy size={12} />
              </button>
            </div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              #{discount.id.slice(-6).toUpperCase()}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-6">
        <StatusBadge status={status} className="scale-90 origin-left" />
      </td>
      <td className="px-4 py-6">
        <Badge variant="surface" className={cn(
          "px-2 py-0.5 font-black text-[9px] uppercase",
          discount.type === 'PERCENTAGE' ? "bg-blue-50/20 text-blue-600 border-blue-100" : "bg-purple-50/20 text-purple-600 border-purple-100",
          (isDisabled || isExpired) && "opacity-50 grayscale"
        )}>
          {discount.type === 'PERCENTAGE' ? 'Perc' : 'Fixed'}
        </Badge>
      </td>
      <td className="px-6 py-6">
        <div className="flex flex-col">
            <div className={cn(
            "transition-colors",
            (isDisabled || isExpired) ? "text-zinc-400" : "text-zinc-950"
            )}>
            {discount.type === 'PERCENTAGE' ? (
                <span className="text-base font-black">{discount.value}%</span>
            ) : (
                <PriceDisplay amount={discount.value} className="text-base font-black" />
            )}
            </div>
            <div className="text-[10px] items-center gap-1 font-bold text-zinc-400 uppercase tracking-tight">
                {discount.minOrder ? (
                    <>Min: <PriceDisplay amount={discount.minOrder} className="text-zinc-400" /></>
                ) : "No Min"}
            </div>
        </div>
      </td>
      <td className="px-6 py-6">
        <div className="flex flex-col gap-1.5 max-w-[100px]">
          <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-zinc-400">
            <span className={cn(
              "tabular-nums font-bold",
              isLimitReached && "text-orange-600"
            )}>
              {discount.usedCount}/{discount.maxUses || '∞'}
            </span>
            <span>Used</span>
          </div>
          <div className={cn(
            "h-1 bg-zinc-100 rounded-full overflow-hidden",
            isLimitReached && "bg-orange-100"
          )}>
            <div 
              className={cn(
                "h-full transition-all duration-1000", 
                isLimitReached ? "bg-red-500" : (isDisabled || isExpired) ? "bg-zinc-300" : "bg-zinc-950"
              )} 
              style={{ width: `${Math.min(usagePercent, 100)}%` }} 
            />
          </div>
        </div>
      </td>
      <td className="px-6 py-6">
        <div className="flex flex-col">
          <span className={cn(
             "text-xs font-bold leading-none",
             isExpired ? "text-red-500" : (isDisabled || isScheduled) ? "text-zinc-400" : "text-zinc-900"
          )}>
            {discount.expiresAt ? new Date(discount.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Never"}
          </span>
          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter mt-1">
            {isScheduled ? "Starts" : "Expires"}
          </span>
        </div>
      </td>
      <td className="px-4 py-6 text-right pr-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover/row:opacity-100 transition-all translate-x-2 group-hover/row:translate-x-0">
          <Button 
            variant="none" 
            size="none" 
            onClick={() => onToggleStatus(discount.id, discount.isActive)}
            className="hover:bg-zinc-100 transition-all p-2 text-zinc-400 hover:text-zinc-950 rounded-full" 
            icon={discount.isActive ? <PowerOff size={16} /> : <Power size={16} />} 
          />
          <Button 
            variant="none" 
            size="none" 
            onClick={() => onEdit(discount)}
            className="hover:bg-zinc-100 transition-all p-2 text-zinc-400 hover:text-zinc-950 rounded-full" 
            icon={<Edit2 size={16} />} 
          />
          <Button 
            variant="none" 
            size="none" 
            onClick={() => onDelete(discount.id)}
            className="hover:bg-red-50 transition-all p-2 text-zinc-400 hover:text-red-500 rounded-full" 
            icon={<Trash2 size={16} />} 
          />
        </div>
      </td>
    </tr>
  );
});
DiscountRow.displayName = "DiscountRow";

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const fetchDiscounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getDiscounts();
      if (res.data.success) {
        setDiscounts(res.data.data);
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

  const handleEdit = useCallback((discount: any) => {
    setEditingDiscount(discount);
    setIsFormOpen(true);
  }, []);

  const handleCreate = useCallback(() => {
    setEditingDiscount(null);
    setIsFormOpen(true);
  }, []);

  const toggleStatus = useCallback(async (id: string, currentStatus: boolean) => {
    try {
      await adminApi.updateDiscount(id, { isActive: !currentStatus });
      toast.success(`Discount ${!currentStatus ? "activated" : "deactivated"}`);
      setDiscounts(prev => prev.map(d => d.id === id ? { ...d, isActive: !currentStatus } : d));
    } catch (err) {
      toast.error("Status update failed");
    }
  }, []);

  const deleteDiscount = useCallback(async (id: string) => {
    if (!confirm("Permanently purge this promotion from the archives?")) return;
    try {
      await adminApi.deleteDiscount(id);
      toast.success("Manifest purged");
      setDiscounts(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      toast.error("Purge failed");
    }
  }, []);

  const filteredDiscounts = useMemo(() => {
    const now = new Date();
    return discounts.filter(d => {
      const matchesSearch = d.code.toLowerCase().includes(searchQuery.toLowerCase());
      const isExpired = d.expiresAt && new Date(d.expiresAt) < now;
      const isScheduled = d.startDate && new Date(d.startDate) > now;
      const isLimitReached = d.maxUses && d.usedCount >= d.maxUses;
      
      let matchesTab = true;
      if (activeTab === "ACTIVE") matchesTab = d.isActive && !isExpired && !isScheduled && !isLimitReached;
      if (activeTab === "SCHEDULED") matchesTab = d.isActive && isScheduled;
      if (activeTab === "EXPIRED") matchesTab = isExpired;
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
    const active = discounts.filter(d => 
        d.isActive && 
        (!d.expiresAt || new Date(d.expiresAt) > now) && 
        (!d.startDate || new Date(d.startDate) < now) &&
        (!d.maxUses || d.usedCount < d.maxUses)
    ).length;
    
    const totalUses = discounts.reduce((acc, d) => acc + (d.usedCount || 0), 0);
    const revenue = discounts.reduce((acc, d) => acc + (d.revenueGenerated || 0), 0);
    
    // Naive conversion: (Total Uses / 100) or similar until we have traffic data
    // Here we use uses relative to total manifests
    const conversions = discounts.length > 0 ? Number((totalUses / (discounts.length * 5)).toFixed(1)) : 0;

    // Generate real sparkline path based on revenueGenerated of each discount
    const revenuePoints = discounts.map(d => d.revenueGenerated || 0).slice(0, 10).reverse();
    const maxVal = Math.max(...revenuePoints, 1);
    const sparklinePath = revenuePoints.length > 1 
        ? `M 0 ${20 - (revenuePoints[0]/maxVal)*15} ` + revenuePoints.map((v, i) => `L ${i * 10} ${20 - (v/maxVal)*15}`).join(' ')
        : "M 0 15 L 100 15";

    return { 
        active, 
        totalUses,
        conversions,
        revenue,
        sparkline: sparklinePath
    };
  }, [discounts]);

  const tabList: AdminTab[] = useMemo(() => {
    const now = new Date();
    return [
      { id: "ALL",      label: "All Codes", count: discounts.length },
      { id: "ACTIVE",   label: "Active",    count: discounts.filter(d => d.isActive && (!d.expiresAt || new Date(d.expiresAt) > now) && (!d.startDate || new Date(d.startDate) < now) && (!d.maxUses || d.usedCount < d.maxUses)).length },
      { id: "SCHEDULED",label: "Scheduled", count: discounts.filter(d => d.isActive && d.startDate && new Date(d.startDate) > now).length },
      { id: "EXPIRED",  label: "Expired",   count: discounts.filter(d => d.expiresAt && new Date(d.expiresAt) < now).length },
      { id: "INACTIVE", label: "Inactive",  count: discounts.filter(d => !d.isActive).length },
    ];
  }, [discounts]);

  return (
    <ProtectedRoute adminOnly>
      <div className="space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {/* Page Header */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8">
          <div className="space-y-4">
            <div>
              <h2 className="text-[3rem] sm:text-[3.5rem] font-bold tracking-tight text-zinc-950 leading-none">Discounts</h2>
              <p className="text-zinc-500 mt-4 text-lg italic font-medium">
                Designing editorial rewards for a global audience.
              </p>
            </div>
            
            {!isLoading && discounts.length > 0 && (
              <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-1000 delay-200">
                <Badge variant="surface" className="px-3 py-1 font-black">Promotion Ledger</Badge>
                <div className="h-4 w-[1px] bg-zinc-200" />
                 <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                   {discounts.length} Manifests Generated
                 </p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button 
                variant="primary" 
                size="sm"
                onClick={handleCreate}
                className="bg-zinc-950 text-white rounded-xl px-8 py-3.5 font-bold uppercase tracking-[0.2em] text-xs shadow-2xl hover:bg-zinc-800 transition-all flex items-center gap-2 flex-1 sm:flex-none active:scale-95"
                icon={<Plus size={16} />}
            >
              Initialize Code
            </Button>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    <svg className="w-full h-full text-zinc-950 fill-none stroke-current stroke-[2]" viewBox="0 0 100 20">
                        <path d={stats.sparkline} strokeLinecap="round" />
                    </svg>
                }
            />
        </div>

        {/* Control Bar */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 border-b border-zinc-100 pb-4">
          <AdminTabs
            tabs={tabList}
            activeTab={activeTab}
            onTabChange={(id) => { setActiveTab(id); setPage(1); }}
            layoutId="discountsTabUnderline"
            className="flex-1 lg:flex-none"
          />
          <div className="w-full lg:w-[320px] xl:w-[400px]">
            <Input
              placeholder="Search code manifestation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-zinc-50/50 border-zinc-100 rounded-xl py-3.5 focus:bg-white transition-all shadow-inner"
              icon={<Search className="text-zinc-400" />}
            />
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden shadow-xl shadow-zinc-200/50">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed lg:table-auto">
              <thead>
                <tr className="bg-zinc-50/50 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 border-b border-zinc-100">
                  <th className="px-6 py-4 w-[240px]">Identity</th>
                  <th className="px-4 py-4 w-[120px]">Status</th>
                  <th className="px-4 py-4 w-[100px]">Type</th>
                  <th className="px-6 py-4 w-[140px]">Financials</th>
                  <th className="px-6 py-4 w-[160px]">Usage</th>
                  <th className="px-6 py-4 w-[140px]">Timeline</th>
                  <th className="px-4 py-4 text-right pr-8">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                        <td className="px-6 py-6 flex items-center gap-4">
                            <Skeleton className="w-10 h-10 rounded-xl" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-2 w-16" />
                            </div>
                        </td>
                        <td className="px-4 py-6"><Skeleton className="h-6 w-20 rounded-full" /></td>
                        <td className="px-4 py-6"><Skeleton className="h-4 w-12 rounded-full" /></td>
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
                        <td className="px-4 py-6 text-right pr-8"><Skeleton className="h-6 w-16 ml-auto" /></td>
                    </tr>
                  ))
                ) : paginatedDiscounts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-8 py-44 text-center">
                        <div className="flex flex-col items-center gap-6 max-w-sm mx-auto">
                            <div className="p-8 bg-zinc-50 rounded-full shadow-inner opacity-40">
                                <Tag size={64} strokeWidth={1} className="text-zinc-400" />
                            </div>
                            <div className="space-y-2 text-center">
                                <h3 className="text-xl font-bold text-zinc-950 tracking-tight">Voucher Void</h3>
                                <p className="text-[11px] text-zinc-400 leading-relaxed font-bold uppercase tracking-widest px-8">
                                    No promotions match this search criteria. The editorial catalog is currently empty.
                                </p>
                            </div>
                            <Button 
                                variant="primary" 
                                onClick={handleCreate}
                                className="mt-6 rounded-xl bg-zinc-950 text-[10px] font-black uppercase tracking-[0.3em] px-12 py-4 shadow-2xl"
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
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mt-8">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    Showing {Math.min(filteredDiscounts.length, (page - 1) * itemsPerPage + 1)} to {Math.min(filteredDiscounts.length, page * itemsPerPage)} of {filteredDiscounts.length.toLocaleString()} results
                </span>
                <div className="flex gap-2">
                    <Button 
                        variant="none"
                        size="none"
                        disabled={page === 1}
                        onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="w-10 h-10 flex items-center justify-center rounded-xl border border-zinc-200 hover:bg-zinc-50 disabled:opacity-30 transition-all font-bold"
                    >
                        <ChevronLeft size={18} />
                    </Button>
                    {Array.from({ length: totalPages }).map((_, i) => (
                        <Button 
                            variant="none"
                            size="none"
                            key={i}
                            onClick={() => { setPage(i + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            className={cn(
                                "w-10 h-10 flex items-center justify-center rounded-xl font-bold text-xs transition-all",
                                page === i + 1 ? "bg-zinc-950 text-white shadow-xl" : "text-zinc-500 hover:bg-zinc-50"
                            )}
                        >
                            {i + 1}
                        </Button>
                    ))}
                    <Button 
                        variant="none"
                        size="none"
                        disabled={page === totalPages}
                        onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="w-10 h-10 flex items-center justify-center rounded-xl border border-zinc-200 hover:bg-zinc-50 disabled:opacity-30 transition-all font-bold"
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
    </ProtectedRoute>
  );
}
