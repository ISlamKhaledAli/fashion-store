"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { MetricCard } from "@/components/admin/MetricCard";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { OrdersDonut } from "@/components/admin/OrdersDonut";
import { RecentOrdersTable } from "@/components/admin/RecentOrdersTable";
import { OrderDetailPanel } from "@/components/admin/OrderDetailPanel";
import { adminApi } from "@/lib/api";
import type { Order, OrderStatus } from "@/types";
import { Settings, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ReportModal } from "@/components/admin/ReportModal";
import { toast } from "sonner";

interface RevenuePoint {
  date: string;
  amount: number;
}

interface CustomerSummary {
  name: string;
  avatar?: string;
}

interface AnalyticsOverview {
  totalRevenue: number;
  revenueTrend: number;
  ordersToday: number;
  ordersTrend: number;
  newCustomers: number;
  customersTrend: number;
  conversionRate: number;
  conversionTrend: number;
  statusCounts?: Record<string, number>;
}

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

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
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [revenueLoading, setRevenueLoading] = useState(true);
  const [revenueRange, setRevenueRange] = useState<"30D" | "90D">("30D");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

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

  const [revenueData, setRevenueData] = useState<RevenuePoint[]>([]);
  const [ordersStatusData, setOrdersStatusData] = useState<
    { name: string; value: number }[]
  >([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [customersData, setCustomersData] = useState<CustomerSummary[]>([]);
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
          adminApi.getCustomers({ limit: 3 }),
        ]);

        if (cancelled) return;

        if (analyticsRes.data.success) {
          const data = analyticsRes.data.data as AnalyticsOverview & {
            dailyRevenue?: RevenuePoint[];
          };
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

          if (data.dailyRevenue) {
            setRevenueData(data.dailyRevenue);
          }

          if (data.statusCounts) {
            setOrdersStatusData(
              Object.entries(data.statusCounts).map(([name, value]) => ({
                name,
                value: value as number,
              }))
            );
          }
        }

        if (ordersRes.data.success) {
          setRecentOrders(ordersRes.data.data as Order[]);
        }

        if (customersRes.data.success) {
          setCustomersData(customersRes.data.data as CustomerSummary[]);
        }
      } catch (error) {
        console.error("Failed to fetch admin dashboard overview:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchOverview();
    return () => {
      cancelled = true;
    };
  }, []);

  // 2. Selective Revenue Fetch
  const fetchRevenue = useCallback(
    async (range: "30D" | "90D", skipLoadingState = false) => {
      if (!skipLoadingState) setRevenueLoading(true);
      try {
        const days = range === "30D" ? 30 : 90;
        const res = await adminApi.getRevenue({ days });
        if (res.data.success) {
          setRevenueData(res.data.data as RevenuePoint[]);
        }
      } catch (error) {
        console.error("Failed to fetch revenue analytics:", error);
      } finally {
        setRevenueLoading(false);
      }
    },
    []
  );

  const handleUpdateOrderStatus = useCallback(
    async (id: string, status: string) => {
      try {
        const res = await adminApi.updateOrderStatus(id, status as OrderStatus);
        if (res.data.success) {
          toast.success(`Order status updated to ${status}`);
          // Update local state if the order is currently visible
          setRecentOrders((prev) =>
            prev.map((o) =>
              o.id === id ? { ...o, status: status as OrderStatus } : o
            )
          );
          setSelectedOrder((prev) =>
            prev?.id === id
              ? prev
                ? { ...prev, status: status as OrderStatus }
                : null
              : prev
          );
        }
      } catch (error) {
        toast.error("Failed to update order status");
      }
    },
    []
  );

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
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-zinc-950">
            Overview
          </h1>
          <p className="text-sm font-medium text-zinc-400">
            Monitoring results for the current performance cycle.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/settings")}
            className="rounded-xl border-zinc-100 px-5 py-2.5 font-bold text-zinc-600 transition-all hover:border-zinc-200 hover:text-zinc-950"
            icon={<Settings size={16} />}
          >
            Settings
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-zinc-950 px-5 py-2.5 font-bold text-white shadow-lg shadow-zinc-950/20 transition-all hover:bg-zinc-800 active:scale-95"
          >
            Generate Report
            <ExternalLink size={14} />
          </Button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={metrics.totalRevenue}
          prefix="$"
          trend={metrics.revenueTrend}
          href="/admin/analytics"
          sparkline={
            <svg
              className="h-full w-full fill-none stroke-current stroke-[2] text-zinc-950"
              viewBox="0 0 100 20"
            >
              <path
                d={
                  revenueData.length > 1
                    ? `M 0 ${20 - ((revenueData[revenueData.length - 7]?.amount / (Math.max(...revenueData.map((d) => d.amount)) || 1)) * 15 || 15)} ${revenueData
                        .slice(-6)
                        .map(
                          (d, i) =>
                            `T ${(i + 1) * 20} ${20 - ((d.amount / (Math.max(...revenueData.map((v) => v.amount)) || 1)) * 15 || 10)}`
                        )
                        .join(" ")}`
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
            <div className="flex h-full items-end gap-1 opacity-20">
              {(revenueData.length > 0
                ? revenueData.slice(-7)
                : [40, 60, 30, 80, 50, 90, 70]
              ).map((d, i) => {
                const height =
                  typeof d === "object"
                    ? ((d as RevenuePoint).amount /
                        (Math.max(...revenueData.map((val) => val.amount)) ||
                          1)) *
                      100
                    : (d as number);
                return (
                  <div
                    key={i}
                    className="w-full rounded-sm bg-zinc-950"
                    style={{ height: `${height}%` }}
                  />
                );
              })}
            </div>
          }
        />
        <MetricCard
          title="New Customers"
          value={metrics.newCustomers}
          trend={metrics.customersTrend}
          href="/admin/customers"
          avatars={customersData.map((c: CustomerSummary) => ({
            name: c.name,
            avatar: c.avatar,
          }))}
        />
        <MetricCard
          title="Conversion Rate"
          value={metrics.conversionRate}
          suffix="%"
          trend={metrics.conversionTrend}
          progressBar={
            metrics.conversionRate > 0 ? metrics.conversionRate * 10 : 0
          }
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
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
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdateStatus={handleUpdateOrderStatus}
      />

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </motion.div>
  );
}
