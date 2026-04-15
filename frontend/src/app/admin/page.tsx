"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { MetricCard } from "@/components/admin/MetricCard";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { OrdersDonut } from "@/components/admin/OrdersDonut";
import { RecentOrdersTable } from "@/components/admin/RecentOrdersTable";
import { OrderDetailPanel } from "@/components/admin/OrderDetailPanel";
import { adminApi } from "@/lib/api";
import { Order } from "@/types";
import { Package, TrendingUp, Settings, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [revenueLoading, setRevenueLoading] = useState(true);
  const [revenueRange, setRevenueRange] = useState<"30D" | "90D">("30D");

  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    revenueTrend: 0,
    ordersToday: 0,
    ordersTrend: 0,
    newCustomers: 0,
    customersTrend: 0,
    conversionRate: 0,
    conversionTrend: 0,
  });
  
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [ordersStatusData, setOrdersStatusData] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [customersData, setCustomersData] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // 1. Initial Data Fetch
  useEffect(() => {
    let cancelled = false;

    const fetchOverview = async () => {
      setLoading(true);
      try {
        const [analyticsRes, ordersRes, customersRes] = await Promise.all([
          adminApi.getAnalytics(),
          adminApi.getOrders({ limit: 5 }),
          adminApi.getCustomers({ limit: 3 })
        ]);

        if (cancelled) return;

        if (analyticsRes.data.success) {
          const data = analyticsRes.data.data as any;
          setMetrics({
            totalRevenue: data.totalRevenue || 0,
            revenueTrend: data.revenueTrend || 0,
            ordersToday: data.ordersToday || 0,
            ordersTrend: data.ordersTrend || 0,
            newCustomers: data.newCustomers || 0,
            customersTrend: data.customersTrend || 0,
            conversionRate: data.conversionRate || 0,
            conversionTrend: data.conversionTrend || 0,
          });
          
          if (data.statusCounts) {
            setOrdersStatusData(Object.entries(data.statusCounts).map(([name, value]) => ({ 
              name, 
              value: value as number 
            })));
          }
        }

        if (ordersRes.data.success) {
          setRecentOrders(ordersRes.data.data);
        }

        if (customersRes.data.success) {
          setCustomersData(customersRes.data.data as any[]);
        }
      } catch (error) {
        console.error("Failed to fetch admin dashboard overview:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchOverview();
    return () => { cancelled = true; };
  }, []);

  // 2. Selective Revenue Fetch
  const fetchRevenue = useCallback(async (range: "30D" | "90D", skipLoadingState = false) => {
    if (!skipLoadingState) setRevenueLoading(true);
    try {
      const days = range === "30D" ? 30 : 90;
      const res = await adminApi.getRevenue({ days });
      if (res.data.success) {
        setRevenueData(res.data.data as any[]);
      }
    } catch (error) {
      console.error("Failed to fetch revenue analytics:", error);
    } finally {
      setRevenueLoading(false);
    }
  }, []);

  const handleUpdateOrderStatus = useCallback(async (id: string, status: string) => {
    try {
      const res = await adminApi.updateOrder(id, { status });
      if (res.data.success) {
        toast.success(`Order status updated to ${status}`);
        // Update local state if the order is currently visible
        setRecentOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
        setSelectedOrder(prev => prev?.id === id ? { ...prev, status } : prev);
      }
    } catch (error) {
      toast.error("Failed to update order status");
    }
  }, []);

  useEffect(() => {
    fetchRevenue(revenueRange);
  }, [revenueRange, fetchRevenue]);

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-10"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-zinc-950">Overview</h1>
          <p className="text-sm text-zinc-400 font-medium">Monitoring results for the current performance cycle.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            size="sm"
            className="rounded-xl px-5 py-2.5 font-bold text-zinc-600 hover:text-zinc-950 transition-all border-zinc-100 hover:border-zinc-200"
            icon={<Settings size={16} />}
          >
            Settings
          </Button>
          <Button 
            variant="primary" 
            size="sm"
            className="bg-zinc-950 text-white rounded-xl px-5 py-2.5 font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-950/20 active:scale-95 flex items-center gap-2"
          >
            Generate Report
            <ExternalLink size={14} />
          </Button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Total Revenue" 
          value={metrics.totalRevenue} 
          prefix="$" 
          trend={metrics.revenueTrend}
          href="/admin/analytics"
          sparkline={
            <svg className="w-full h-full text-zinc-950 fill-none stroke-current stroke-[2]" viewBox="0 0 100 20">
              <path 
                d={revenueData.length > 1 
                  ? `M 0 ${20 - (revenueData[revenueData.length-7]?.amount / (Math.max(...revenueData.map(d => d.amount)) || 1) * 15 || 15)} ${revenueData.slice(-6).map((d, i) => `T ${(i+1)*20} ${20 - (d.amount / (Math.max(...revenueData.map(d => d.amount)) || 1) * 15 || 10)}`).join(' ')}`
                  : "M0 15 Q 10 5, 20 12 T 40 8 T 60 14 T 80 5 T 100 10"
                } 
                strokeLinecap="round" 
              />
            </svg>
          }
        />
        <MetricCard 
          title="Orders Today" 
          value={metrics.ordersToday} 
          trend={metrics.ordersTrend}
          href="/admin/orders"
          sparkline={
            <div className="flex items-end gap-1 h-full opacity-20">
              {(revenueData.length > 0 ? revenueData.slice(-7) : [40, 60, 30, 80, 50, 90, 70]).map((d, i) => (
                <div 
                  key={i} 
                  className="bg-zinc-950 w-full rounded-sm" 
                  style={{ height: `${typeof d === 'object' ? (d.amount / (Math.max(...revenueData.map(val => val.amount)) || 1) * 100) : d}%` }} 
                />
              ))}
            </div>
          }
        />
        <MetricCard 
          title="New Customers" 
          value={metrics.newCustomers} 
          trend={metrics.customersTrend}
          href="/admin/customers"
          avatars={customersData.map(c => ({
            name: c.name,
            avatar: c.avatar
          }))}
        />
        <MetricCard 
          title="Conversion Rate" 
          value={metrics.conversionRate} 
          suffix="%" 
          trend={metrics.conversionTrend}
          progressBar={metrics.conversionRate > 0 ? metrics.conversionRate * 10 : 0}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div variants={containerVariants} className="lg:col-span-2">
          <RevenueChart 
            data={revenueData} 
            isLoading={revenueLoading} 
            range={revenueRange}
            onRangeChange={setRevenueRange}
          />
        </motion.div>
        <motion.div variants={containerVariants}>
          <OrdersDonut data={ordersStatusData} isLoading={loading} />
        </motion.div>
      </div>

      {/* Recent Orders Section */}
      <RecentOrdersTable 
        orders={recentOrders} 
        isLoading={loading} 
        onOrderClick={setSelectedOrder}
      />

      <OrderDetailPanel 
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdateStatus={handleUpdateOrderStatus}
      />
    </motion.div>
  );
}
