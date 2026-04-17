"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { AnimatePresence } from "framer-motion";
import { MetricCard } from "@/components/admin/MetricCard";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { OrdersDonut } from "@/components/admin/OrdersDonut";
import { adminApi } from "@/lib/api";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { 
  TrendingUp, Users, ShoppingBag, DollarSign,
  ArrowRight, User as UserIcon, BarChart3
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";

// --- Types ---

interface RevenuePoint {
  date: string;
  amount: number;
}

interface AnalyticsOverview {
  totalRevenue: number;
  todayRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  conversionRate: number;
  ordersToday: number;
  newCustomers: number;
  statusCounts?: Record<string, number>;
}

interface TopProduct {
  id: string;
  name: string;
  quantity: number;
  revenue: number;
}

interface CustomerSummary {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  totalSpent: number;
}

// --- Shared Tooltip ---

const ChartTooltip = ({ active, payload, label }: any) => (
  <AnimatePresence>
    {active && payload && payload.length && (
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 5 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 5 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
        className="bg-zinc-950 border border-zinc-800 p-3 shadow-2xl rounded-xl backdrop-blur-md pointer-events-none z-50 min-w-[140px]"
      >
        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1.5">
          {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-baseline gap-1.5">
            <span className="text-xs font-bold text-white leading-none">
              {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </span>
            <span className="text-[10px] font-bold text-zinc-400">{entry.name}</span>
          </div>
        ))}
      </motion.div>
    )}
  </AnimatePresence>
);

// --- Chart Card Wrapper ---

const ChartCard = ({ title, subtitle, children, isLoading, className }: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}) => (
  <div className={cn(
    "bg-white p-8 rounded-2xl shadow-sm border border-zinc-100 flex flex-col h-full group hover:shadow-md transition-all duration-500",
    className
  )}>
    <div className="mb-8">
      <h2 className="text-lg font-bold tracking-tight text-zinc-950">{title}</h2>
      <p className="text-sm text-zinc-400 font-light">{subtitle}</p>
    </div>
    <div className="flex-1 min-h-[300px] w-full flex items-center justify-center">
      {isLoading ? (
        <Skeleton className="h-full w-full rounded-xl" />
      ) : children}
    </div>
  </div>
);

// --- Page Animations ---

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

// --- Page Component ---

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [revenueLoading, setRevenueLoading] = useState(true);
  const [revenueRange, setRevenueRange] = useState<"30D" | "90D">("30D");

  const [metrics, setMetrics] = useState<AnalyticsOverview>({
    totalRevenue: 0, todayRevenue: 0, totalOrders: 0, totalCustomers: 0,
    conversionRate: 0, ordersToday: 0, newCustomers: 0,
  });

  const [revenueData, setRevenueData] = useState<RevenuePoint[]>([]);
  const [ordersStatusData, setOrdersStatusData] = useState<{ name: string; value: number }[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [topCustomers, setTopCustomers] = useState<CustomerSummary[]>([]);

  // 1. Initial Data Fetch
  useEffect(() => {
    let cancelled = false;

    const fetchOverview = async () => {
      setLoading(true);
      try {
        const [analyticsRes, topProductsRes, customersRes] = await Promise.all([
          adminApi.getAnalytics(),
          adminApi.getTopProducts(),
          adminApi.getCustomers({ limit: 5 }),
        ]);

        if (cancelled) return;

        if (analyticsRes.data.success) {
          const data = analyticsRes.data.data as AnalyticsOverview;
          setMetrics(data);
          if (data.statusCounts) {
            setOrdersStatusData(Object.entries(data.statusCounts).map(([name, value]) => ({
              name,
              value: value as number,
            })));
          }
        }

        if (topProductsRes.data.success) {
          setTopProducts(topProductsRes.data.data as TopProduct[]);
        }

        if (customersRes.data.success) {
          const customers = customersRes.data.data as any[];
          setTopCustomers(
            customers
              .sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0))
              .slice(0, 5)
              .map(c => ({
                id: c.id,
                name: c.name,
                email: c.email,
                avatar: c.avatar,
                totalSpent: c.totalSpent || 0,
              }))
          );
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchOverview();
    return () => { cancelled = true; };
  }, []);

  // 2. Selective Revenue Fetch
  const fetchRevenue = useCallback(async (range: "30D" | "90D") => {
    setRevenueLoading(true);
    try {
      const days = range === "30D" ? 30 : 90;
      const res = await adminApi.getRevenue({ days });
      if (res.data.success) {
        setRevenueData(res.data.data as RevenuePoint[]);
      }
    } catch (error) {
      console.error("Failed to fetch revenue:", error);
    } finally {
      setRevenueLoading(false);
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
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-zinc-950">Analytics</h1>
          <p className="text-sm text-zinc-400 font-medium">Deep performance insights across all operations.</p>
        </div>
      </div>

      {/* KPI Metric Cards — reusing <MetricCard> from dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={metrics.totalRevenue}
          prefix="$"
          href="/admin/orders"
        />
        <MetricCard
          title="Total Orders"
          value={metrics.totalOrders}
          href="/admin/orders"
        />
        <MetricCard
          title="Total Customers"
          value={metrics.totalCustomers}
          href="/admin/customers"
        />
        <MetricCard
          title="Conversion Rate"
          value={parseFloat(metrics.conversionRate.toFixed(1))}
          suffix="%"
          progressBar={metrics.conversionRate > 0 ? Math.min(metrics.conversionRate * 10, 100) : 0}
        />
      </div>

      {/* Row 1: Revenue Chart & Orders Donut — reusing existing components */}
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

      {/* Row 2: Top Products & Top Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Products — Bar Chart with Real Data */}
        <ChartCard
          title="Top Products"
          subtitle="Best-selling items by units sold."
          isLoading={loading}
          className="lg:col-span-2"
        >
          {topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={topProducts}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f4f4f5" />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#18181b' }}
                  width={120}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar
                  name="Units"
                  dataKey="quantity"
                  fill="#18181b"
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center gap-3 text-zinc-200">
              <BarChart3 size={32} strokeWidth={1} />
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-300">No product data yet</p>
            </div>
          )}
        </ChartCard>

        {/* Top Customers — Ranked List with Real Data */}
        <div className="bg-zinc-950 p-8 rounded-2xl shadow-2xl flex flex-col relative overflow-hidden group hover:shadow-md transition-all duration-500">
          <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:scale-110 transition-transform duration-700">
            <TrendingUp size={120} strokeWidth={1} className="text-white" />
          </div>

          <div className="space-y-1 mb-8 z-10">
            <h2 className="text-lg font-bold tracking-tight text-white">Top Customers</h2>
            <p className="text-sm text-zinc-500 font-light">Highest lifetime value contributors.</p>
          </div>

          <div className="flex-1 w-full space-y-3 z-10">
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-9 h-9 rounded-full bg-white/10" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-3 w-24 bg-white/10" />
                      <Skeleton className="h-2 w-16 bg-white/5" />
                    </div>
                  </div>
                  <Skeleton className="h-3 w-16 bg-white/10" />
                </div>
              ))
            ) : topCustomers.length > 0 ? (
              topCustomers.map((customer) => (
                <div key={customer.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-white/40 border border-white/10 overflow-hidden">
                      {customer.avatar ? (
                        <img src={customer.avatar} alt={customer.name} className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon size={14} />
                      )}
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-white tracking-tight">{customer.name}</p>
                      <p className="text-[9px] text-zinc-500 font-medium truncate max-w-[100px]">{customer.email}</p>
                    </div>
                  </div>
                  <p className="text-xs font-black text-white tabular-nums">{formatCurrency(customer.totalSpent)}</p>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3 py-12">
                <Users size={32} strokeWidth={1} className="text-zinc-600" />
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">No customer data</p>
              </div>
            )}
          </div>

          <Button
            variant="none"
            className="w-full bg-white text-zinc-950 font-black text-[10px] uppercase tracking-widest rounded-xl py-3 hover:opacity-90 transition-all flex items-center justify-center gap-2 z-10 mt-6"
            onClick={() => window.location.href = '/admin/customers'}
          >
            View All Customers <ArrowRight size={14} />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
