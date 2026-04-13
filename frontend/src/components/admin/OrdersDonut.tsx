"use client";

import React from "react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Skeleton } from "@/components/ui/Skeleton";

interface OrdersDonutProps {
  data: { name: string; value: number }[];
  isLoading?: boolean;
}

const COLORS: Record<string, string> = {
  Processing: "#fbbf24", // amber-400
  Shipped: "#3b82f6",    // blue-500
  Delivered: "#22c55e",  // green-500
  Cancelled: "#ef4444",   // red-500
};

export const OrdersDonut = ({ data, isLoading }: OrdersDonutProps) => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  if (isLoading) {
    return (
      <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10">
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-4 w-48 mb-8" />
        <div className="flex flex-col items-center">
          <Skeleton className="h-48 w-48 rounded-full" />
          <div className="grid grid-cols-2 gap-4 w-full mt-10">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10 flex flex-col h-full">
      <h2 className="text-lg font-bold tracking-tight text-on-surface">Orders by Status</h2>
      <p className="text-sm text-on-surface-variant font-light mb-8">Daily fulfillment breakdown.</p>
      
      <div className="flex-1 flex flex-col items-center justify-center">
        {total === 0 ? (
          <div className="flex flex-col items-center gap-3 text-on-surface-variant/40">
            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">pie_chart</span>
            </div>
            <p className="text-sm font-medium">No data available</p>
          </div>
        ) : (
          <>
            <div className="relative w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name] || "#eee"} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold tracking-tighter text-on-surface">{total}</span>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Total</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-4 gap-x-8 w-full mt-10">
              {data.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[item.name] }} />
                  <span className="text-xs font-medium text-on-surface truncate">
                    {item.name} ({item.value})
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
