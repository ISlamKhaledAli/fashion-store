"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";

import { Calendar, ChevronDown, Globe } from "lucide-react";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";
import { formatCurrency, cn } from "@/lib/utils";
import { PriceDisplay } from "@/components/admin/PriceDisplay";

import { RevenueChart } from "@/components/admin/RevenueChart";
import { OrdersDonut } from "@/components/admin/OrdersDonut";
import type { TopProduct } from "@/components/admin/TopProductsTable";
import { TopProductsTable } from "@/components/admin/TopProductsTable";
import type { CategoryStat } from "@/components/admin/CategoryRevenueChart";
import { CategoryRevenueChart } from "@/components/admin/CategoryRevenueChart";
import { AIInsightsPanel } from "@/components/admin/AIInsightsPanel";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default function AdminAnalyticsPage() {
  const [days, setDays] = useState<number>(30);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [overview, setOverview] = useState<Record<string, number> | null>(null);
  const [revenueData, setRevenueData] = useState<
    { date: string; amount: number }[]
  >([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryStat[]>([]);
  const [geoData, setGeoData] = useState<
    { country: string; revenue: number }[]
  >([]);
  const [retention, setRetention] = useState({
    newCustomers: 0,
    returningCustomers: 0,
    newPercentage: 0,
    returningPercentage: 0,
    total: 0,
  });

  const fetchDashboardData = useCallback(
    async (isMounted: { current: boolean }) => {
      setIsLoading(true);
      try {
        // Mock category data from top products or static if API doesn't have it
        const [
          overviewRes,
          revenueRes,
          topProductsRes,
          geoRes,
          categoryRes,
          retentionRes,
        ] = await Promise.all([
          adminApi.getAnalytics().catch(() => ({ data: { data: null } })),
          adminApi.getRevenue({ days }).catch(() => ({ data: { data: [] } })),
          adminApi.getTopProducts().catch(() => ({ data: { data: [] } })),
          adminApi.getGeographicData().catch(() => ({ data: { data: [] } })),
          adminApi.getCategoryRevenue().catch(() => ({ data: { data: [] } })),
          adminApi
            .getCustomerRetention()
            .catch(() => ({ data: { data: null } })),
        ]);

        if (isMounted.current) {
          const ov = overviewRes.data?.data as Record<string, number> | null;
          if (ov) {
            ov.totalRevenue = ov.totalRevenue || 0;
            ov.totalOrders = ov.totalOrders || 0;
            ov.newCustomers = ov.newCustomers || 0;
            ov.avgOrderValue =
              ov.totalOrders > 0 ? ov.totalRevenue / ov.totalOrders : 0;
          }
          setOverview(ov || null);

          const revData =
            (revenueRes.data?.data as { date: string; amount: number }[]) || [];
          setRevenueData(revData);

          const prods = (topProductsRes.data?.data as TopProduct[]) || [];
          setTopProducts(prods);

          const gData =
            (geoRes.data?.data as { country: string; revenue: number }[]) || [];
          setGeoData(gData);

          const catData = (categoryRes.data?.data as CategoryStat[]) || [];
          console.log("Analytics: Category Data Loaded:", catData);
          setCategoryData(catData);

          const retData = retentionRes.data?.data;
          if (retData) {
            setRetention(retData as typeof retention);
          }
        }
      } catch (err) {
        if (isMounted.current) toast.error("Failed to load analytics data");
      } finally {
        if (isMounted.current) setIsLoading(false);
      }
    },
    [days]
  );

  useEffect(() => {
    const isMounted = { current: true };
    fetchDashboardData(isMounted);
    return () => {
      isMounted.current = false;
    };
  }, [fetchDashboardData]);

  const dateRangeOpts = [
    { label: "Last 7 Days", value: 7 },
    { label: "Last 30 Days", value: 30 },
    { label: "Last 90 Days", value: 90 },
  ];

  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - days);
  const dateLabel = `${pastDate.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })} — ${new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}`;

  const ordersStatusData = useMemo(() => {
    if (!overview?.statusCounts) return [];
    return Object.entries(overview.statusCounts).map(([name, value]) => ({
      name,
      value: value as number,
    }));
  }, [overview?.statusCounts]);

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-8 pb-12 font-inter text-zinc-900">
      {/* Page Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-headline text-4xl font-medium tracking-tight text-on-surface">
            Analytics
          </h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Platform performance and editorial metrics
          </p>
        </div>

        <div className="relative">
          <Button
            variant="none"
            size="none"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="cinematic-shadow group flex items-center gap-3 rounded-lg bg-surface-container-lowest px-4 py-2.5 transition-all"
          >
            <Calendar className="h-5 w-5 text-on-surface-variant group-hover:text-on-surface" />
            <span className="text-xs font-medium text-on-surface">
              {dateLabel}
            </span>
            <ChevronDown
              className={cn(
                "h-5 w-5 text-on-surface-variant transition-transform duration-300",
                isDropdownOpen && "rotate-180"
              )}
            />
          </Button>

          {isDropdownOpen && (
            <div className="absolute top-full right-0 z-50 mt-2 min-w-[200px] overflow-hidden rounded-lg border border-zinc-100 bg-white shadow-xl">
              {dateRangeOpts.map((opt) => (
                <Button
                  key={opt.value}
                  variant="none"
                  size="none"
                  className={cn(
                    "w-full px-4 py-3 text-left text-sm transition-colors hover:bg-zinc-50",
                    days === opt.value
                      ? "bg-zinc-50/50 font-bold text-zinc-900"
                      : "font-medium text-zinc-500"
                  )}
                  onClick={() => {
                    setDays(opt.value);
                    setIsDropdownOpen(false);
                  }}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Insights Panel */}
      <AIInsightsPanel
        days={days}
        setDays={setDays}
        isLoadingData={isLoading}
        analyticsData={{
          period: `${days}days`,
          totalRevenue: overview?.totalRevenue || 0,
          revenueChange: overview?.revenueTrend || 0,
          totalOrders: overview?.totalOrders || 0,
          ordersChange: overview?.ordersTrend || 0,
          topProducts: topProducts.map((p) => ({
            name: p.name,
            unitsSold: p.quantity,
            revenue: p.revenue,
          })),
          categoryBreakdown: categoryData.map((c) => ({
            category: c.name,
            revenue: c.revenue,
            percentage:
              categoryData.reduce((acc, curr) => acc + curr.revenue, 0) > 0
                ? Math.round(
                    (c.revenue /
                      categoryData.reduce(
                        (acc, curr) => acc + curr.revenue,
                        0
                      )) *
                      100
                  )
                : 0,
          })),
          newVsReturning: {
            newCustomers: retention.newCustomers,
            returning: retention.returningCustomers,
          },
          revenueTimeline: revenueData,
        }}
      />

      {/* Row 1: Metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(overview?.totalRevenue || 0)}
          trend={`${Math.abs(overview?.revenueTrend || 0)}%`}
          isPositive={(overview?.revenueTrend || 0) >= 0}
          isLoading={isLoading}
        />
        <MetricCard
          title="Total Orders"
          value={(overview?.totalOrders || 0).toLocaleString()}
          trend={`${Math.abs(overview?.ordersTrend || 0)}%`}
          isPositive={(overview?.ordersTrend || 0) >= 0}
          isLoading={isLoading}
        />
        <MetricCard
          title="New Customers"
          value={(overview?.newCustomers || 0).toLocaleString()}
          trend={`${Math.abs(overview?.customersTrend || 0)}%`}
          isPositive={(overview?.customersTrend || 0) >= 0}
          isLoading={isLoading}
        />
        <MetricCard
          title="Avg. Order Value"
          value={formatCurrency(overview?.avgOrderValue || 0)}
          trend={`${Math.abs(overview?.avgOrderValueTrend || 0)}%`}
          isPositive={(overview?.avgOrderValueTrend || 0) >= 0}
          isLoading={isLoading}
        />
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="h-[400px] rounded-xl border border-zinc-100 bg-white p-8 shadow-[0_20px_50px_rgba(26,28,29,0.02)] lg:col-span-8">
          <div className="mb-8 flex items-center justify-between">
            <h3 className="text-lg font-medium tracking-tight">
              Revenue Over Time
            </h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-zinc-900" />
                <span className="text-xs font-medium text-zinc-600">
                  Current
                </span>
              </div>
            </div>
          </div>
          <div className="h-[280px] w-full">
            {isLoading ? (
              <div className="h-full w-full animate-pulse rounded-lg bg-zinc-50" />
            ) : (
              <RevenueChart data={revenueData} />
            )}
          </div>
        </div>

        <div className="cinematic-shadow flex flex-col rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-8 lg:col-span-4">
          <OrdersDonut data={ordersStatusData} isLoading={isLoading} />
        </div>
      </div>

      {/* Row 3: Tables */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="h-[400px]">
          <TopProductsTable products={topProducts} isLoading={isLoading} />
        </div>
        <div className="h-[400px]">
          <CategoryRevenueChart
            categories={categoryData}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Row 4: Customer Insights & Distribution (Empty States) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* New vs Returning Bar Chart */}
        <div className="cinematic-shadow flex flex-col justify-center rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-8 lg:col-span-5">
          <h3 className="mb-8 text-lg font-medium tracking-tight text-on-surface">
            New vs. Returning
          </h3>
          {isLoading ? (
            <div className="w-full space-y-4">
              <div className="animate-pulse">
                <div className="mb-1 flex justify-between text-sm">
                  <div className="h-4 w-24 rounded bg-zinc-100"></div>
                  <div className="h-4 w-16 rounded bg-zinc-100"></div>
                </div>
                <div className="h-2 w-full rounded-full bg-zinc-50"></div>
              </div>
              <div className="animate-pulse">
                <div className="mb-1 flex justify-between text-sm">
                  <div className="h-4 w-32 rounded bg-zinc-100"></div>
                  <div className="h-4 w-16 rounded bg-zinc-100"></div>
                </div>
                <div className="h-2 w-full rounded-full bg-zinc-50"></div>
              </div>
            </div>
          ) : retention.total === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-400">
              No customer data available yet
            </p>
          ) : (
            <div className="mt-auto mb-auto w-full space-y-4">
              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-on-surface">New Customers</span>
                  <span className="font-medium text-on-surface">
                    {retention.newCustomers} ({retention.newPercentage}%)
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
                    style={{ width: `${retention.newPercentage}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-on-surface">Returning Customers</span>
                  <span className="font-medium text-on-surface">
                    {retention.returningCustomers} (
                    {retention.returningPercentage}%)
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
                  <div
                    className="h-full rounded-full bg-zinc-400 transition-all duration-700 ease-out"
                    style={{ width: `${retention.returningPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Geographic Distribution -> Real Data */}
        <div className="cinematic-shadow rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-8 lg:col-span-7">
          <div className="mb-8 flex items-center justify-between">
            <h3 className="text-lg font-medium tracking-tight text-on-surface">
              Geographic Distribution
            </h3>
            <div className="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
              <Globe className="h-4 w-4" />
              Global Activity
            </div>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex animate-pulse items-center gap-4 py-2"
                >
                  <div className="h-4 w-4 rounded bg-surface-container-high"></div>
                  <div className="h-4 flex-1 rounded bg-surface-container-high"></div>
                  <div className="h-1.5 w-32 rounded-full bg-surface-container-low"></div>
                  <div className="h-4 w-20 rounded bg-surface-container-high"></div>
                </div>
              ))
            ) : geoData.length === 0 ? (
              <div className="flex h-56 items-center justify-center rounded-lg border border-dashed border-outline-variant/20 bg-surface-container-low/50">
                <span className="text-xs font-bold tracking-widest text-on-surface-variant/40 uppercase">
                  No geographic data available yet
                </span>
              </div>
            ) : (
              geoData.map((item, i) => (
                <div
                  key={item.country}
                  className="group -mx-2 flex items-center gap-4 rounded-lg px-2 py-2 transition-colors hover:bg-surface-container-low/50"
                >
                  <span className="w-4 text-[10px] font-bold text-on-surface-variant/40 tabular-nums">
                    {(i + 1).toString().padStart(2, "0")}
                  </span>
                  <span className="flex-1 truncate text-sm font-medium text-on-surface">
                    {item.country}
                  </span>
                  <div className="h-1.5 w-32 overflow-hidden rounded-full bg-surface-container-high">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-1000 ease-out"
                      style={{
                        width: `${(item.revenue / (geoData[0]?.revenue || 1)) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="w-24 text-right text-xs font-bold text-on-surface">
                    <PriceDisplay amount={item.revenue} size="sm" />
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  trend,
  isPositive,
  progress,
  isLoading,
}: {
  title: string;
  value: string | number;
  trend: string;
  isPositive: boolean;
  progress?: number;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="cinematic-shadow flex h-full animate-pulse flex-col rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-6">
        <div className="mb-4 h-3 w-1/2 rounded bg-surface-container-high"></div>
        <div className="mb-6 h-8 w-3/4 rounded bg-surface-container-high"></div>
        <div className="mt-auto h-1 w-full rounded-full bg-surface-container-high"></div>
      </div>
    );
  }

  return (
    <div className="cinematic-shadow group flex h-full cursor-default flex-col rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-6 transition-all duration-300 hover:scale-[1.02]">
      <div className="mb-4 flex items-start justify-between">
        <span className="text-[10px] font-bold tracking-[0.15em] text-on-surface-variant uppercase">
          {title}
        </span>
        <span
          className={cn(
            "rounded px-2 py-0.5 text-[10px] font-bold",
            isPositive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
          )}
        >
          {isPositive ? "+" : "-"}
          {trend}
        </span>
      </div>
      <div className="mb-4 flex items-baseline gap-1">
        <span className="text-3xl font-bold tracking-tight text-on-surface">
          {value}
        </span>
      </div>
      {progress !== undefined && (
        <div className="mt-auto h-1 w-full overflow-hidden rounded-full bg-surface-container-high">
          <div
            className="h-full bg-primary transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
