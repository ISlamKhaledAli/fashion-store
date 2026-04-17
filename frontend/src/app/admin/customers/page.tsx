"use client";

import React, { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { AdminCustomer } from "@/types";
import { adminApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { toast } from "sonner";
import { Search, Download, User as UserIcon, ArrowUpDown, MoreHorizontal, UserX, UserCheck } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";

// Lazy load the details panel to prevent blocking the main thread during initial load
const CustomerDetailPanel = React.lazy(() => 
  import("@/components/admin/CustomerDetailPanel").then(module => ({ default: module.CustomerDetailPanel }))
);

// Optimized Atomic Components
const CustomerRow = React.memo(({ 
  customer, 
  onClick,
  onStatusChange,
  onDelete
}: { 
  customer: AdminCustomer; 
  onClick: (c: AdminCustomer) => void;
  onStatusChange: (id: string, status: 'ACTIVE' | 'BANNED') => void;
  onDelete: (id: string) => void;
}) => {
  return (
    <tr 
      onClick={() => onClick(customer)}
      className="group/row hover:bg-zinc-50/30 transition-all cursor-pointer border-b border-zinc-50"
    >
      <td className="px-8 py-6">
        <div className="flex items-center gap-5">
          <div className="w-11 h-11 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 overflow-hidden border border-zinc-100 group-hover/row:scale-105 transition-transform shrink-0 shadow-sm">
            {customer.avatar ? <img src={customer.avatar} alt={customer.name} className="w-full h-full object-cover" /> : <UserIcon size={20} />}
          </div>
          <div className="space-y-1">
            <p className="text-lg font-semibold text-zinc-950 tracking-tight leading-tight group-hover/row:translate-x-1 transition-transform">{customer.name}</p>
            <p className="text-sm font-medium text-zinc-500 tracking-wide font-mono uppercase">ID: {customer.id.split('-')[1] || customer.id.slice(-6)}</p>
          </div>
        </div>
      </td>
      <td className="px-8 py-6">
        <div className="space-y-1">
          <p className="text-sm text-zinc-500 font-medium leading-tight">{customer.email}</p>
          <p className="text-sm text-zinc-400 font-medium tracking-wide">{customer.phone || "No Connection"}</p>
        </div>
      </td>
      <td className="px-8 py-6 text-right">
        <p className="text-base font-black text-zinc-950 tabular-nums tracking-tighter">{customer.totalOrders.toString().padStart(2, '0')}</p>
      </td>
      <td className="px-8 py-6 text-right font-black text-zinc-950 tabular-nums tracking-tighter text-base">
        {formatCurrency(customer.totalSpent)}
      </td>
      <td className="px-8 py-6 text-center">
        <StatusBadge status={customer.status} className="px-3 py-1 text-[10px] font-black min-w-[80px] justify-center" />
      </td>
      <td className="px-8 py-6 text-right pr-12" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-end items-center gap-1.5 opacity-0 group-hover/row:opacity-100 transition-all translate-x-4 group-hover/row:translate-x-0">
          {customer.status === 'ACTIVE' ? (
            <Button 
              variant="icon" 
              size="none" 
              onClick={() => onStatusChange(customer.id, 'BANNED')}
              className="hover:bg-red-50 p-2.5 text-zinc-300 hover:text-red-500 rounded-lg transition-all" 
              icon={<UserX size={18} />} 
              title="Restrict Account"
            />
          ) : (
            <Button 
              variant="icon" 
              size="none" 
              onClick={() => onStatusChange(customer.id, 'ACTIVE')}
              className="hover:bg-zinc-100 p-2.5 text-zinc-300 hover:text-zinc-950 rounded-lg transition-all" 
              icon={<UserCheck size={18} />} 
              title="Restore Access"
            />
          )}
          <Button 
            variant="icon" 
            size="none" 
            onClick={() => onClick(customer)}
            className="hover:bg-zinc-100 p-2.5 text-zinc-300 hover:text-zinc-950 rounded-lg transition-all" 
            icon={<MoreHorizontal size={18} />} 
          />
        </div>
      </td>
    </tr>
  );
});
CustomerRow.displayName = "CustomerRow";

const MobileCustomerRow = React.memo(({ 
  customer, 
  onClick 
}: { 
  customer: AdminCustomer; 
  onClick: (c: AdminCustomer) => void;
}) => {
  return (
    <div 
      className="p-6 space-y-4 hover:bg-zinc-50/50 transition-colors cursor-pointer"
      onClick={() => onClick(customer)}
    >
      <div className="flex justify-between items-start">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 overflow-hidden border border-zinc-100">
            {customer.avatar ? <img src={customer.avatar} alt={customer.name} className="w-full h-full object-cover" /> : <UserIcon size={24} />}
          </div>
          <div className="space-y-0.5">
            <p className="text-base font-semibold text-zinc-950 tracking-tight">{customer.name}</p>
            <p className="text-sm text-zinc-500 font-medium">{customer.email}</p>
          </div>
        </div>
        <StatusBadge status={customer.status} className="px-2 py-0.5 text-[9px] font-black" />
      </div>
      <div className="grid grid-cols-2 gap-4 pt-1">
        <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
          <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest block mb-1">Acquisitions</span>
          <span className="text-base font-black text-zinc-950 tracking-tighter">{customer.totalOrders}</span>
        </div>
        <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
          <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest block mb-1">Total Spent</span>
          <span className="text-base font-black text-zinc-950 tracking-tighter">{formatCurrency(customer.totalSpent)}</span>
        </div>
      </div>
    </div>
  );
});
MobileCustomerRow.displayName = "MobileCustomerRow";

const TABS = ["ALL", "ACTIVE", "BANNED"];

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomer | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const fetchCustomers = useCallback(async (isMounted: { current: boolean }) => {
    setLoading(true);
    try {
      const res = await adminApi.getCustomers();
      if (isMounted.current && res.data.success) {
        setCustomers(res.data.data as AdminCustomer[]);
      }
    } catch (err) {
      if (isMounted.current) {
        toast.error("Telemetry failure. Profiles inaccessible.");
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const isMounted = { current: true };
    fetchCustomers(isMounted);
    return () => { isMounted.current = false; };
  }, [fetchCustomers]);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === "ALL" || c.status === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [customers, searchQuery, activeTab]);

  const handleRowClick = useCallback((customer: AdminCustomer) => {
    // Optimistic state update: open panel immediately
    setSelectedCustomer(customer);
    setIsPanelOpen(true);
  }, []);

  const handleStatusChange = useCallback(async (id: string, status: 'ACTIVE' | 'BANNED') => {
    try {
      await adminApi.updateCustomerStatus(id, status);
      toast.success(`Protocol updated: Status set to ${status.toLowerCase()}`);
      fetchCustomers({ current: true });
      setIsPanelOpen(false);
    } catch (err) {
      toast.error("Status override failed. Access persists.");
    }
  }, [fetchCustomers]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this customer profile? This action is irreversible.")) return;
    try {
      await adminApi.deleteCustomer(id);
      toast.success("Profile purged from archives");
      fetchCustomers({ current: true });
      setIsPanelOpen(false);
    } catch (err) {
      toast.error("Critical failure. Data persists.");
    }
  }, [fetchCustomers]);

  const exportCSV = useCallback(() => {
    const headers = ["ID", "Name", "Email", "Phone", "Total Orders", "Total Spent", "Join Date", "Status"];
    const rows = customers.map(c => [
      c.id, c.name, c.email, c.phone, c.totalOrders, c.totalSpent, c.joinDate, c.status
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `customers_intelligence_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Intelligence report exported");
  }, [customers]);

  return (
    <div className="max-w-6xl mx-auto w-full space-y-8 lg:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 px-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950">Customer Intelligence</h1>
          <div className="flex items-center gap-3">
             <Badge variant="surface" className="px-3 py-1 font-black">Biometric Feed</Badge>
             <div className="h-4 w-[1px] bg-zinc-200" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
               {customers.length} Profiles Indexed
             </span>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={exportCSV}
          className="rounded-xl border-zinc-200 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50 font-bold text-[10px] uppercase tracking-widest px-6 shadow-sm transition-all flex items-center gap-2 w-full sm:w-auto"
          icon={<Download size={14} />}
        >
          Export CSV
        </Button>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 border-b border-zinc-100 pb-4">
        <div className="flex gap-x-12 w-full lg:w-auto overflow-x-auto no-scrollbar scroll-smooth">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "pb-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative whitespace-nowrap group",
                activeTab === tab ? "text-zinc-950" : "text-zinc-400 hover:text-zinc-600"
              )}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-950" />
              )}
            </button>
          ))}
        </div>
        <div className="w-full lg:w-[320px]">
          <Input
            placeholder="Search fingerprints..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-zinc-50/50 border-zinc-100 rounded-xl py-3 focus:bg-white transition-all text-sm shadow-inner"
            icon={<Search size={16} />}
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-zinc-50/50 text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 border-b border-zinc-100">
                <th className="px-8 py-5">Customer Identification</th>
                <th className="px-8 py-5">Communication Feed</th>
                <th className="px-8 py-5 text-right">Acquisitions</th>
                <th className="px-8 py-5 text-right">Lifetime Value</th>
                <th className="px-8 py-5 text-center">Stance</th>
                <th className="px-8 py-5 text-right pr-12">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td className="px-8 py-8 flex items-center gap-6">
                      <Skeleton className="w-11 h-11 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </td>
                    <td className="px-8 py-8 space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </td>
                    <td className="px-8 py-8"><Skeleton className="h-5 w-12 ml-auto" /></td>
                    <td className="px-8 py-8"><Skeleton className="h-5 w-20 ml-auto" /></td>
                    <td className="px-8 py-8 flex justify-center"><Skeleton className="h-6 w-24 rounded-full" /></td>
                    <td className="px-8 py-8 ml-auto"><Skeleton className="h-5 w-12 ml-auto" /></td>
                  </tr>
                ))
              ) : filteredCustomers.length > 0 ? (
                filteredCustomers.map((c) => (
                  <CustomerRow 
                    key={c.id} 
                    customer={c}
                    onClick={handleRowClick}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-6 max-w-sm mx-auto opacity-40">
                      <UserIcon size={48} strokeWidth={1} className="text-zinc-400" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">No manifest matches found in archives</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-zinc-50">
          {loading ? (
             Array(3).fill(0).map((_, i) => (
              <div key={i} className="p-6 space-y-4">
                <div className="flex gap-4">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-20 w-full rounded-xl" />
              </div>
            ))
          ) : filteredCustomers.map((c) => (
            <MobileCustomerRow 
              key={c.id} 
              customer={c} 
              onClick={handleRowClick}
            />
          ))}
        </div>
      </div>

      {/* Detail Overlay - Lazy loaded and Wrapped in Suspense */}
      <Suspense fallback={null}>
        <CustomerDetailPanel 
          customer={selectedCustomer}
          isOpen={isPanelOpen}
          onClose={() => setIsPanelOpen(false)}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      </Suspense>
    </div>
  );
}
