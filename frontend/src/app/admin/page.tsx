"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MetricCard } from "@/components/admin/MetricCard";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { OrdersDonut } from "@/components/admin/OrdersDonut";
import { RecentOrdersTable } from "@/components/admin/RecentOrdersTable";
import { adminApi } from "@/lib/api";
import { Order } from "@/types";
import { Package, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [analyticsRes, revenueRes, ordersRes, customersRes] = await Promise.all([
          adminApi.getAnalytics(),
          adminApi.getRevenue(),
          adminApi.getOrders({ limit: 5 }),
          adminApi.getCustomers({ limit: 3 })
        ]);

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

        if (revenueRes.data.success) {
          setRevenueData(revenueRes.data.data as any[]);
        }

        if (ordersRes.data.success) {
          setRecentOrders(ordersRes.data.data);
        }

        if (customersRes.data.success) {
          setCustomersData(customersRes.data.data as any[]);
        }
      } catch (error) {
        console.error("Failed to fetch admin dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Total Revenue" 
          value={metrics.totalRevenue} 
          prefix="$" 
          trend={metrics.revenueTrend}
          sparkline={
            <svg className="w-full h-full text-zinc-900 fill-none stroke-current stroke-[1.5]" viewBox="0 0 100 20">
              <path 
                d={revenueData.length > 1 
                  ? `M 0 ${20 - (revenueData[revenueData.length-7]?.amount / Math.max(...revenueData.map(d => d.amount)) * 15 || 15)} ${revenueData.slice(-6).map((d, i) => `T ${(i+1)*20} ${20 - (d.amount / Math.max(...revenueData.map(d => d.amount)) * 15 || 10)}`).join(' ')}`
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
          sparkline={
            <div className="flex items-end gap-1 h-full opacity-30">
              {(revenueData.length > 0 ? revenueData.slice(-7) : [40, 60, 30, 80, 50, 90, 70]).map((d, i) => (
                <div 
                  key={i} 
                  className="bg-zinc-900 w-full rounded-sm" 
                  style={{ height: `${typeof d === 'object' ? (d.amount / Math.max(...revenueData.map(val => val.amount)) * 100) : d}%` }} 
                />
              ))}
            </div>
          }
        />
        <MetricCard 
          title="New Customers" 
          value={metrics.newCustomers} 
          trend={metrics.customersTrend}
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
        <div className="lg:col-span-2">
          <RevenueChart data={revenueData} isLoading={loading} />
        </div>
        <div>
          <OrdersDonut data={ordersStatusData} isLoading={loading} />
        </div>
      </div>

      {/* Recent Orders Section */}
      <RecentOrdersTable orders={recentOrders} isLoading={loading} />
    </div>
  );
}

