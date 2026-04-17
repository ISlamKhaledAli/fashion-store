"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  Download, 
  MoreVertical, 
  ChevronRight,
  Filter,
  ArrowRight
} from "lucide-react";
import { adminApi } from "@/lib/api";
import { Order, OrderStatus } from "@/types";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { BulkActionBar } from "@/components/admin/BulkActionBar";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Optimized Imports
const OrderDetailPanel = React.lazy(() => import("@/components/admin/OrderDetailPanel").then(module => ({ default: module.OrderDetailPanel })));

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function AdminOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });

  const fetchOrders = async (page = 1, isMounted: { current: boolean }) => {
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
  };

  useEffect(() => {
    const isMounted = { current: true };
    
    const timer = setTimeout(() => {
      fetchOrders(1, isMounted);
    }, 500);

    return () => {
      isMounted.current = false;
      clearTimeout(timer);
    };
  }, [searchQuery, statusFilter]);

  const toggleSelectAll = () => {
    if (selectedIds.size === orders.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(orders.map(o => o.id)));
    }
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
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
    const headers = ["Order ID", "Customer", "Email", "Status", "Date", "Total"];
    const csvContent = [
      headers.join(","),
      ...orders.map(o => [
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
          <nav className="flex gap-4 sm:gap-8">
            {["All", "Processing", "Shipped", "Delivered"].map((status) => (
              <Button
                key={status}
                variant="none"
                size="none"
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "text-sm font-bold py-2 transition-all relative",
                  statusFilter === status 
                    ? "text-zinc-900" 
                    : "text-zinc-400 hover:text-zinc-600"
                )}
              >
                {status + (status === "All" ? " Orders" : "")}
                {statusFilter === status && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-zinc-900"
                  />
                )}
              </Button>
            ))}
          </nav>
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
                    checked={selectedIds.size === orders.length && orders.length > 0}
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
                    onClick={() => setSelectedOrder(order)}
                    className={cn(
                      "hover:bg-zinc-50/80 transition-all group cursor-pointer border-l-4",
                      selectedOrder?.id === order.id ? "bg-zinc-50/50 border-zinc-900" : "border-transparent"
                    )}
                  >
                    <td className="px-6 py-5 text-center" onClick={(e) => toggleSelect(order.id, e)}>
                      <Checkbox 
                        checked={selectedIds.has(order.id)}
                        onCheckedChange={() => {}} // Controlled by row click logic
                      />
                    </td>
                    <td className="px-6 py-5 font-mono text-xs font-bold text-zinc-900">
                      #{order.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-[10px] font-bold text-zinc-500 border border-zinc-200 shrink-0">
                          {order.user?.avatar ? (
                            <img src={order.user.avatar} className="w-full h-full object-cover rounded-full" alt="" />
                          ) : (
                            order.user?.name ? order.user.name.split(' ').map(n => n[0]).join('') : "U"
                          )}
                        </div>
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
                    <td className="px-6 py-5 text-sm font-black text-zinc-900">
                      ${order.total.toLocaleString()}
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
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs font-bold text-zinc-900 uppercase tracking-tighter">
                    #{order.id.slice(-6).toUpperCase()}
                  </span>
                  <StatusBadge status={order.status} />
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-500 border border-zinc-200 shrink-0">
                    {order.user?.avatar ? (
                      <img src={order.user.avatar} className="w-full h-full object-cover rounded-full" alt="" />
                    ) : (
                      order.user?.name ? order.user.name.split(' ').map(n => n[0]).join('') : "U"
                    )}
                  </div>
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
                    <span className="text-sm font-black text-zinc-900 tabular-nums">
                      ${order.total.toLocaleString()}
                    </span>
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
        <div className="px-4 sm:px-8 py-4 lg:py-5 bg-zinc-50/30 border-t border-zinc-100 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
            Showing {orders.length} of {pagination.total} orders
          </span>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => {
                const isMounted = { current: true };
                fetchOrders(pagination.page - 1, isMounted);
              }}
              className="px-4 py-2 bg-white border border-zinc-200 rounded-lg text-xs font-bold text-zinc-500 hover:text-zinc-900 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm"
            >
              Previous
            </Button>
            <Button 
              variant="primary"
              size="sm"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => {
                const isMounted = { current: true };
                fetchOrders(pagination.page + 1, isMounted);
              }}
              className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-bold hover:opacity-90 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <BulkActionBar 
        selectedCount={selectedIds.size} 
        onClear={() => setSelectedIds(new Set())} 
        onAction={handleBulkAction}
      />

      <React.Suspense fallback={null}>
        <OrderDetailPanel 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
          onUpdateStatus={handleUpdateStatus}
        />
      </React.Suspense>
    </div>
  );
}
