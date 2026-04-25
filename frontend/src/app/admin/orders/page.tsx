"use client";

import React, { useEffect, useState } from "react";
import { 
  Search, 
  Download, 
  MoreVertical, 
  ChevronRight,
  Filter,
  ArrowRight,
  ChevronLeft
} from "lucide-react";
import { adminApi } from "@/lib/api";
import { Order, OrderStatus } from "@/types";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { BulkActionBar } from "@/components/admin/BulkActionBar";
import { TableImage } from "@/components/admin/TableImage";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { PriceDisplay } from "@/components/admin/PriceDisplay";

// Optimized Imports
import { OrderDetailPanel } from "@/components/admin/OrderDetailPanel";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function AdminOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  
  // Drawer State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });

  const fetchOrders = React.useCallback(async (page = 1, isMounted: { current: boolean }) => {
    setLoading(true);
    try {
      const params: { page?: number; limit?: number; search?: string; status?: OrderStatus } = { 
        page, 
        limit: 10,
        search: searchQuery || undefined,
        status: statusFilter === "All" ? undefined : statusFilter.toUpperCase() as OrderStatus
      };
      
      const res = await adminApi.getOrders(params);
      if (isMounted.current && res.data.success) {
        setOrders(res.data.data as Order[]);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (error) {
      if (isMounted.current) {
        console.error("Failed to load orders");
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    const isMounted = { current: true };
    
    const timer = setTimeout(() => {
      fetchOrders(1, isMounted);
    }, 500);

    return () => {
      isMounted.current = false;
      clearTimeout(timer);
    };
  }, [searchQuery, statusFilter, fetchOrders]);

  const toggleSelectAll = () => {
    const newSelected = new Set(selectedIds);
    const visibleIds = orders.map(o => o.id);
    const allVisibleSelected = visibleIds.length > 0 && visibleIds.every(id => selectedIds.has(id));

    if (allVisibleSelected) {
      // Deselect all visible
      visibleIds.forEach(id => newSelected.delete(id));
    } else {
      // Select all visible
      visibleIds.forEach(id => newSelected.add(id));
    }
    
    setSelectedIds(newSelected);
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkAction = async (action: string) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    if (action === "ship") {
      try {
        setLoading(true);
        const res = await adminApi.bulkUpdateOrderStatus(ids, "SHIPPED");
        if (res.data.success) {
          toast.success(`Marked ${ids.length} orders as shipped`);
          const isMounted = { current: true };
          await fetchOrders(pagination.page, isMounted);
        }
      } catch (error) {
        toast.error("Failed to update orders");
      } finally {
        setLoading(false);
      }
    } else if (action === "delete") {
      if (!window.confirm(`Are you sure you want to delete ${ids.length} orders? This action cannot be undone.`)) {
        return;
      }
      try {
        setLoading(true);
        const res = await adminApi.bulkDeleteOrders(ids);
        if (res.data.success) {
          toast.success(`Deleted ${ids.length} orders`);
          const isMounted = { current: true };
          await fetchOrders(1, isMounted);
        }
      } catch (error) {
        toast.error("Failed to delete orders");
      } finally {
        setLoading(false);
      }
    } else if (action === "export") {
      handleExport();
    }
    setSelectedIds(new Set());
  };

  const handleExport = () => {
    const idsToExport = Array.from(selectedIds);
    const ordersToExport = orders.filter(o => idsToExport.includes(o.id));
    
    if (ordersToExport.length === 0) {
      toast.error("No orders selected for export");
      return;
    }

    const headers = ["Order ID", "Customer", "Email", "Status", "Date", "Total"];
    const csvContent = [
      headers.join(","),
      ...ordersToExport.map(o => [
        `"${o.id}"`,
        `"${o.user?.name || ''}"`,
        `"${o.user?.email || ''}"`,
        `"${o.status}"`,
        `"${new Date(o.createdAt).toLocaleDateString()}"`,
        `"${o.total}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-export-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  const handleUpdateStatus = React.useCallback(async (id: string, status: string) => {
    try {
      const res = await adminApi.updateOrderStatus(id, status as OrderStatus);
      if (res.data.success) {
        setOrders(prev => prev.map(o => o.id === id ? res.data.data as Order : o));
        if (selectedOrder?.id === id) setSelectedOrder(res.data.data as Order);
      }
    } catch (error) {
      console.error("Failed to update status");
    }
  }, [selectedOrder?.id]);

  return (
    <div className="flex-1 flex flex-col min-h-screen animate-in fade-in duration-700">
      {/* Filters bar */}
      <div className="flex flex-col gap-4 items-stretch sm:items-center sm:flex-row justify-between mb-6 lg:mb-8 border-b border-zinc-100 pb-4">
        <div className="flex items-center gap-4 sm:gap-8 overflow-x-auto no-scrollbar">
          <AdminTabs
            tabs={[
              { id: "All",        label: "All Orders" },
              { id: "Processing", label: "Processing" },
              { id: "Shipped",    label: "Shipped" },
              { id: "Delivered",  label: "Delivered" },
            ]}
            activeTab={statusFilter}
            onTabChange={setStatusFilter}
            layoutId="ordersTabUnderline"
            className="border-b-0 px-0"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Input 
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 sm:w-60 lg:w-72"
            icon={<Search />}
          />
          <Button 
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-bold text-zinc-900 hover:bg-zinc-50 transition-all active:scale-95"
            icon={<Download size={14} />}
          >
            Export
          </Button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-xl shadow-zinc-200/50 overflow-hidden relative">
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-zinc-50/50 text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-black border-b border-zinc-100">
                <th className="px-6 py-5 w-12 text-center">
                  <Checkbox 
                    checked={orders.length > 0 && orders.every(o => selectedIds.has(o.id))}
                    onCheckedChange={toggleSelectAll}
                  />
                </th>
                <th className="px-6 py-5">Order ID</th>
                <th className="px-6 py-5">Customer</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Date</th>
                <th className="px-6 py-5">Total</th>
                <th className="px-6 py-5 text-right pr-10">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-5"><div className="w-4 h-4 bg-zinc-100 rounded mx-auto" /></td>
                    <td className="px-6 py-5"><div className="w-20 h-4 bg-zinc-100 rounded" /></td>
                    <td className="px-6 py-5"><div className="w-32 h-4 bg-zinc-100 rounded" /></td>
                    <td className="px-6 py-5"><div className="w-24 h-6 bg-zinc-100 rounded-full" /></td>
                    <td className="px-6 py-5"><div className="w-24 h-4 bg-zinc-100 rounded" /></td>
                    <td className="px-6 py-5"><div className="w-16 h-4 bg-zinc-100 rounded" /></td>
                    <td className="px-6 py-5"></td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-32 text-center">
                    <div className="flex flex-col items-center gap-4 text-zinc-400">
                      <div className="w-16 h-16 rounded-full bg-zinc-50 flex items-center justify-center">
                        <Filter size={24} />
                      </div>
                      <p className="text-sm font-medium">No orders match your filters</p>
                      <Button 
                        variant="none"
                        size="none"
                        onClick={() => { setSearchQuery(""); setStatusFilter("All"); }}
                        className="text-xs font-bold text-zinc-900 hover:underline underline-offset-4"
                      >
                        Clear all filters
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr 
                    key={order.id} 
                    onClick={() => { setSelectedOrder(order); setIsPanelOpen(true); }}
                    className={cn(
                      "hover:bg-zinc-50/80 transition-all group cursor-pointer border-l-4",
                      selectedOrder?.id === order.id ? "bg-zinc-50/50 border-zinc-900" : "border-transparent"
                    )}
                  >
                    <td className="px-6 py-5 text-center" onClick={(e) => e.stopPropagation()}>
                      <Checkbox 
                        checked={selectedIds.has(order.id)}
                        onCheckedChange={() => toggleSelect(order.id)}
                      />
                    </td>
                    <td className="px-6 py-5 font-mono text-xs font-bold text-zinc-900">
                      #{order.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <TableImage 
                          src={order.user?.avatar}
                          alt={order.user?.name}
                          containerClassName="w-8 h-8 rounded-full border border-zinc-200"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold text-zinc-900 truncate">{order.user?.name || "Unknown Customer"}</span>
                          <span className="text-[10px] text-zinc-400 font-medium truncate">{order.user?.email || "No email provided"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-5 text-xs text-zinc-500 font-medium">
                      {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-5">
                      <PriceDisplay amount={order.total} />
                    </td>
                    <td className="px-6 py-5 text-right pr-8">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="icon"
                          size="none"
                          className="p-2 hover:bg-zinc-200/50 rounded-full transition-colors text-zinc-400 hover:text-zinc-900 opacity-0 group-hover:opacity-100"
                          icon={<MoreVertical size={16} />}
                        />
                        <ArrowRight size={14} className={cn(
                          "text-zinc-300 transition-all",
                          selectedOrder?.id === order.id ? "translate-x-1 text-zinc-900" : "group-hover:translate-x-1"
                        )} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-zinc-50">
          {loading ? (
             Array(3).fill(0).map((_, i) => (
              <div key={i} className="p-6 space-y-4 animate-pulse">
                <div className="flex justify-between items-center">
                  <div className="w-20 h-4 bg-zinc-100 rounded" />
                  <div className="w-24 h-6 bg-zinc-100 rounded-full" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-100 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <div className="w-32 h-4 bg-zinc-100 rounded" />
                    <div className="w-48 h-3 bg-zinc-100 rounded" />
                  </div>
                </div>
                <div className="flex justify-between pt-2">
                  <div className="w-24 h-4 bg-zinc-100 rounded" />
                  <div className="w-16 h-5 bg-zinc-100 rounded" />
                </div>
              </div>
            ))
          ) : orders.length === 0 ? (
            <div className="p-12 text-center text-zinc-400 text-sm italic">
              No orders on file
            </div>
          ) : (
            orders.map((order) => (
              <div 
                key={order.id} 
                className={cn(
                  "p-6 space-y-4 hover:bg-zinc-50/50 transition-all cursor-pointer relative",
                  selectedOrder?.id === order.id ? "bg-zinc-50/80" : ""
                )}
                onClick={() => { setSelectedOrder(order); setIsPanelOpen(true); }}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div onClick={(e) => e.stopPropagation()}>
                      <Checkbox 
                        checked={selectedIds.has(order.id)}
                        onCheckedChange={() => toggleSelect(order.id)}
                      />
                    </div>
                    <span className="font-mono text-xs font-bold text-zinc-900 uppercase tracking-tighter">
                      #{order.id.slice(-6).toUpperCase()}
                    </span>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <div className="flex items-center gap-4">
                  <TableImage 
                    src={order.user?.avatar}
                    alt={order.user?.name}
                    containerClassName="w-10 h-10 rounded-full border border-zinc-200"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-zinc-900 truncate">{order.user?.name || "Unknown Customer"}</span>
                    <span className="text-[10px] text-zinc-400 font-medium truncate">{order.user?.email || "No email"}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-50">
                   <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Transaction Date</span>
                    <span className="text-xs text-zinc-600 font-medium">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                   </div>
                   <div className="flex flex-col items-end">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest text-right">Settlement</span>
                    <PriceDisplay amount={order.total} size="sm" />
                   </div>
                </div>

                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-300">
                  <ChevronRight size={18} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="px-8 py-6 bg-zinc-50/30 border-t border-zinc-100 flex flex-col sm:flex-row justify-between items-center gap-6">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
            Showing {(pagination.page - 1) * 10 + 1} to {Math.min(pagination.total, pagination.page * 10)} of {pagination.total.toLocaleString()} results
          </span>
          <div className="flex gap-2">
            <Button 
              variant="none"
              size="none"
              disabled={pagination.page === 1}
              onClick={() => {
                const isMounted = { current: true };
                fetchOrders(pagination.page - 1, isMounted);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-zinc-200 hover:bg-zinc-50 disabled:opacity-30 transition-all font-bold"
            >
              <ChevronLeft size={18} />
            </Button>
            {Array.from({ length: Math.min(5, pagination.totalPages) }).map((_, i) => (
              <Button 
                variant="none"
                size="none"
                key={i}
                onClick={() => {
                  const isMounted = { current: true };
                  fetchOrders(i + 1, isMounted);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={cn(
                  "w-10 h-10 flex items-center justify-center rounded-lg font-bold text-xs transition-all",
                  pagination.page === i + 1 ? "bg-zinc-900 text-white" : "text-zinc-500 hover:bg-zinc-50"
                )}
              >
                {i + 1}
              </Button>
            ))}
            <Button 
              variant="none"
              size="none"
              disabled={pagination.page === pagination.totalPages || pagination.totalPages === 0}
              onClick={() => {
                const isMounted = { current: true };
                fetchOrders(pagination.page + 1, isMounted);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-zinc-200 hover:bg-zinc-50 disabled:opacity-30 transition-all font-bold"
            >
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>
      </div>

      <BulkActionBar 
        selectedCount={selectedIds.size} 
        onClear={() => setSelectedIds(new Set())} 
        onAction={handleBulkAction}
      />

      <OrderDetailPanel 
        order={selectedOrder}
        isOpen={isPanelOpen} 
        onClose={() => setIsPanelOpen(false)} 
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
