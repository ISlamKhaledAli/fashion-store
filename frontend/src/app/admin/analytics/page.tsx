"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";

import { 
  Calendar, ChevronDown, TrendingUp, TrendingDown, Globe 
} from "lucide-react";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";
import { formatCurrency, cn } from "@/lib/utils";
import { PriceDisplay } from "@/components/admin/PriceDisplay";

import { RevenueChart } from "@/components/admin/RevenueChart";
import { OrdersDonut } from "@/components/admin/OrdersDonut";
import { TopProductsTable } from "@/components/admin/TopProductsTable";
import { CategoryRevenueChart } from "@/components/admin/CategoryRevenueChart";
import { Button } from "@/components/ui/Button";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function AdminAnalyticsPage() {
  const [days, setDays] = useState<number>(30);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [geoData, setGeoData] = useState<any[]>([]);
  const [retention, setRetention] = useState({
    newCustomers: 0,
    returningCustomers: 0,
    newPercentage: 0,
    returningPercentage: 0,
    total: 0,
  });

  const fetchDashboardData = useCallback(async (isMounted: { current: boolean }) => {
    setIsLoading(true);
    try {
      // Mock category data from top products or static if API doesn't have it
      const [overviewRes, revenueRes, topProductsRes, geoRes, categoryRes, retentionRes] = await Promise.all([
        adminApi.getAnalytics().catch(() => ({ data: { data: null } })),
        adminApi.getRevenue({ days }).catch(() => ({ data: { data: [] } })),
        adminApi.getTopProducts().catch(() => ({ data: { data: [] } })),
        adminApi.getGeographicData().catch(() => ({ data: { data: [] } })),
        adminApi.getCategoryRevenue().catch(() => ({ data: { data: [] } })),
        adminApi.getCustomerRetention().catch(() => ({ data: { data: null } }))
      ]);

      if (isMounted.current) {
        let ov = overviewRes.data?.data as Record<string, any>;
        if (ov) {
           ov.totalRevenue = ov.totalRevenue || 0;
           ov.totalOrders = ov.totalOrders || 0;
           ov.newCustomers = ov.newCustomers || 0;
           ov.avgOrderValue = ov.totalOrders > 0 ? (ov.totalRevenue / ov.totalOrders) : 0;
        }
        setOverview(ov || null);
        
        let revData = (revenueRes.data?.data as any[]) || [];
        setRevenueData(revData);

        let prods = (topProductsRes.data?.data as any[]) || [];
        setTopProducts(prods);

        let gData = (geoRes.data?.data as any[]) || [];
        setGeoData(gData);

        let catData = (categoryRes.data?.data as any[]) || [];
        console.log("Analytics: Category Data Loaded:", catData);
        setCategoryData(catData);

        let retData = retentionRes.data?.data;
        if (retData) {
          setRetention(retData as any);
        }
      }
    } catch (err) {
      if (isMounted.current) toast.error("Failed to load analytics data");
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  }, [days]);

  useEffect(() => {
    const isMounted = { current: true };
    fetchDashboardData(isMounted);
    return () => { isMounted.current = false; };
  }, [fetchDashboardData]);

  const dateRangeOpts = [
    { label: "Last 7 Days", value: 7 },
    { label: "Last 30 Days", value: 30 },
    { label: "Last 90 Days", value: 90 },
  ];

  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - days);
  const dateLabel = `${pastDate.toLocaleDateString("en-US", { month: 'short', day: '2-digit', year: 'numeric' })} — ${new Date().toLocaleDateString("en-US", { month: 'short', day: '2-digit', year: 'numeric' })}`;

  const ordersStatusData = useMemo(() => {
    if (!overview?.statusCounts) return [];
    return Object.entries(overview.statusCounts).map(([name, value]) => ({
      name,
      value: value as number
    }));
  }, [overview?.statusCounts]);

  return (
    <div className="space-y-12 pb-12 font-inter text-zinc-900 max-w-7xl mx-auto px-8">
      
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-headline font-medium tracking-tight text-on-surface">Analytics</h2>
          <p className="text-on-surface-variant text-sm mt-1">Platform performance and editorial metrics</p>
        </div>
        
        <div className="relative">
          <Button 
            variant="none"
            size="none"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 bg-surface-container-lowest cinematic-shadow px-4 py-2.5 rounded-lg group transition-all"
          >
            <Calendar className="w-5 h-5 text-on-surface-variant group-hover:text-on-surface" />
            <span className="text-xs font-medium text-on-surface">{dateLabel}</span>
            <ChevronDown className={cn("w-5 h-5 text-on-surface-variant transition-transform duration-300", isDropdownOpen && "rotate-180")} />
          </Button>
          
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 bg-white shadow-xl rounded-lg border border-zinc-100 overflow-hidden z-50 min-w-[200px]">
              {dateRangeOpts.map(opt => (
                <Button
                  key={opt.value}
                  variant="none"
                  size="none"
                  className={cn(
                    "w-full text-left px-4 py-3 text-sm transition-colors hover:bg-zinc-50",
                    days === opt.value ? "font-bold text-zinc-900 bg-zinc-50/50" : "font-medium text-zinc-500"
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

      {/* Row 1: Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white p-8 rounded-xl shadow-[0_20px_50px_rgba(26,28,29,0.02)] border border-zinc-100 h-[400px]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-medium tracking-tight">Revenue Over Time</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-zinc-900 rounded-sm" />
                <span className="text-xs font-medium text-zinc-600">Current</span>
              </div>
            </div>
          </div>
          <div className="h-[280px] w-full">
            {isLoading ? (
              <div className="w-full h-full bg-zinc-50 animate-pulse rounded-lg" />
            ) : (
              <RevenueChart data={revenueData} />
            )}
          </div>
        </div>

        <div className="lg:col-span-4 bg-surface-container-lowest p-8 rounded-xl cinematic-shadow border border-outline-variant/10 flex flex-col">
          <OrdersDonut data={ordersStatusData} isLoading={isLoading} />
        </div>
      </div>

      {/* Row 3: Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-[400px]">
          <TopProductsTable products={topProducts} isLoading={isLoading} />
        </div>
        <div className="h-[400px]">
           <CategoryRevenueChart categories={categoryData} isLoading={isLoading} />
        </div>
      </div>

      {/* Row 4: Customer Insights & Distribution (Empty States) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* New vs Returning Bar Chart */}
        <div className="lg:col-span-5 bg-surface-container-lowest p-8 rounded-xl cinematic-shadow border border-outline-variant/10 flex flex-col justify-center">
          <h3 className="text-lg font-medium tracking-tight mb-8 text-on-surface">New vs. Returning</h3>
          {isLoading ? (
            <div className="space-y-4 w-full">
              <div className="animate-pulse">
                <div className="flex justify-between text-sm mb-1">
                  <div className="w-24 h-4 bg-zinc-100 rounded"></div>
                  <div className="w-16 h-4 bg-zinc-100 rounded"></div>
                </div>
                <div className="w-full bg-zinc-50 rounded-full h-2"></div>
              </div>
              <div className="animate-pulse">
                <div className="flex justify-between text-sm mb-1">
                  <div className="w-32 h-4 bg-zinc-100 rounded"></div>
                  <div className="w-16 h-4 bg-zinc-100 rounded"></div>
                </div>
                <div className="w-full bg-zinc-50 rounded-full h-2"></div>
              </div>
            </div>
          ) : retention.total === 0 ? (
            <p className="text-center text-sm text-zinc-400 py-8">
              No customer data available yet
            </p>
          ) : (
            <div className="space-y-4 w-full mt-auto mb-auto">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-on-surface">New Customers</span>
                  <span className="font-medium text-on-surface">{retention.newCustomers} ({retention.newPercentage}%)</span>
                </div>
                <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-primary h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${retention.newPercentage}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-on-surface">Returning Customers</span>
                  <span className="font-medium text-on-surface">{retention.returningCustomers} ({retention.returningPercentage}%)</span>
                </div>
                <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-zinc-400 h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${retention.returningPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Geographic Distribution -> Real Data */}
        <div className="lg:col-span-7 bg-surface-container-lowest p-8 rounded-xl cinematic-shadow border border-outline-variant/10">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-medium tracking-tight text-on-surface">Geographic Distribution</h3>
            <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
              <Globe className="w-4 h-4" />
              Global Activity
            </div>
          </div>
          
          <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 py-2 animate-pulse">
                  <div className="h-4 bg-surface-container-high rounded w-4"></div>
                  <div className="h-4 bg-surface-container-high rounded flex-1"></div>
                  <div className="h-1.5 bg-surface-container-low rounded-full w-32"></div>
                  <div className="h-4 bg-surface-container-high rounded w-20"></div>
                </div>
              ))
            ) : geoData.length === 0 ? (
              <div className="flex items-center justify-center h-56 bg-surface-container-low/50 rounded-lg border border-dashed border-outline-variant/20">
                <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/40">No geographic data available yet</span>
              </div>
            ) : (
              geoData.map((item, i) => (
                <div key={item.country} className="flex items-center gap-4 py-2 hover:bg-surface-container-low/50 transition-colors rounded-lg px-2 -mx-2 group">
                  <span className="text-[10px] font-bold text-on-surface-variant/40 w-4 tabular-nums">{(i + 1).toString().padStart(2, '0')}</span>
                  <span className="text-sm font-medium text-on-surface flex-1 truncate">{item.country}</span>
                  <div className="w-32 bg-surface-container-high rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-primary h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${(item.revenue / (geoData[0]?.revenue || 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-on-surface w-24 text-right">
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

function MetricCard({ title, value, trend, isPositive, progress, isLoading }: {
  title: string;
  value: string | number;
  trend: string;
  isPositive: boolean;
  progress?: number;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="bg-surface-container-lowest p-6 rounded-xl cinematic-shadow border border-outline-variant/10 flex flex-col animate-pulse h-full">
        <div className="h-3 bg-surface-container-high rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-surface-container-high rounded w-3/4 mb-6"></div>
        <div className="h-1 bg-surface-container-high rounded-full w-full mt-auto"></div>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl cinematic-shadow border border-outline-variant/10 transition-all hover:scale-[1.02] duration-300 group cursor-default h-full flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <span className="text-[10px] font-bold tracking-[0.15em] text-on-surface-variant uppercase">{title}</span>
        <span className={cn(
          "px-2 py-0.5 rounded text-[10px] font-bold",
          isPositive ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
        )}>
          {isPositive ? "+" : "-"}{trend}
        </span>
      </div>
      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-3xl font-bold text-on-surface tracking-tight">{value}</span>
      </div>
      {progress !== undefined && (
        <div className="mt-auto h-1 w-full bg-surface-container-high rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-1000 ease-out" 
            style={{ width: `${progress}%` }} 
          />
        </div>
      )}
    </div>
  );
}
