"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area 
} from "recharts";
import { TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const data = [
  { name: "Sep 25", revenue: 4000 },
  { name: "Oct 01", revenue: 3000 },
  { name: "Oct 05", revenue: 5000 },
  { name: "Oct 10", revenue: 4500 },
  { name: "Oct 15", revenue: 6000 },
  { name: "Oct 20", revenue: 5500 },
  { name: "Oct 24", revenue: 7000 },
];

export default function AdminDashboard() {
  const [metrics] = useState({
    totalRevenue: 124500,
    ordersToday: 84,
    newCustomers: 12,
    conversionRate: 3.4,
  });

  const recentOrders = [
    { id: "#1024", customer: "Sarah Jenkins", date: "Oct 24, 2023", total: 450, status: "PROCESSING" },
    { id: "#1023", customer: "Marcus Chen", date: "Oct 23, 2023", total: 1200, status: "SHIPPED" },
    { id: "#1022", customer: "Elena Rodriguez", date: "Oct 23, 2023", total: 840, status: "DELIVERED" },
  ];

  return (
    <div className="p-8 space-y-12 max-w-[1600px]">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Revenue", value: formatCurrency(metrics.totalRevenue), trend: "+12%" },
          { label: "Orders Today", value: metrics.ordersToday, trend: "+5%" },
          { label: "New Customers", value: metrics.newCustomers, trend: "+2%" },
          { label: "Conversion Rate", value: `${metrics.conversionRate}%`, trend: "+0.5%" },
        ].map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm space-y-2"
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                {metric.label}
              </span>
              <span className="text-green-600 text-[10px] font-bold flex items-center">
                {metric.trend}
                <TrendingUp size={12} className="ml-0.5" strokeWidth={2} />
              </span>
            </div>
            <div className="text-3xl font-bold tracking-tighter text-on-surface">
              {metric.value}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/10 shadow-sm">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Revenue Trajectory</h2>
            <p className="text-sm text-on-surface-variant">Real-time performance metrics</p>
          </div>
        </div>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#030304" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#030304" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 700, fill: "#46464a" }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 700, fill: "#46464a" }}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#030304" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm overflow-hidden text-on-surface">
        <div className="px-8 py-6 border-b border-outline-variant/10 flex justify-between items-center">
          <h2 className="text-xl font-bold tracking-tight">Recent Orders</h2>
          <Button variant="ghost" size="none" className="text-[10px] font-bold uppercase tracking-widest hover:underline">View All</Button>
        </div>
        <table className="w-full text-left">
          <thead className="bg-surface-container-low/50">
            <tr>
              <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">ID</th>
              <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Customer</th>
              <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Date</th>
              <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Total</th>
              <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {recentOrders.map((order) => (
              <tr key={order.id} className="hover:bg-surface-container-low transition-colors group cursor-pointer">
                <td className="px-8 py-5 text-sm font-bold tracking-tight">{order.id}</td>
                <td className="px-8 py-5 text-sm font-medium">{order.customer}</td>
                <td className="px-8 py-5 text-sm text-on-surface-variant">{order.date}</td>
                <td className="px-8 py-5 text-sm font-bold">{formatCurrency(order.total)}</td>
                <td className="px-8 py-5">
                  <Badge variant={order.status === "DELIVERED" ? "secondary" : "surface"}>
                    {order.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
