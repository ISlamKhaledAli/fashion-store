"use client";

import React, { useState } from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface RevenueChartProps {
  data: any[];
  isLoading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-950 border border-zinc-800 p-3 shadow-2xl rounded-lg">
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-sm font-bold text-white">
          ${payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export const RevenueChart = ({ data, isLoading }: RevenueChartProps) => {
  const [range, setRange] = useState<"30D" | "90D">("30D");

  if (isLoading) {
    return (
      <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10">
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-on-surface">Revenue Over Time</h2>
          <p className="text-sm text-on-surface-variant font-light">Earnings from the last {range === "30D" ? "30 days" : "90 days"} of sales.</p>
        </div>
        <div className="flex bg-surface-container-high rounded-lg p-1">
          <Button 
            variant="none"
            size="none"
            onClick={() => setRange("30D")}
            className={cn(
              "px-3 py-1 text-xs font-bold rounded transition-all",
              range === "30D" ? "bg-white text-zinc-950 shadow-sm" : "text-on-surface-variant hover:opacity-70"
            )}
          >
            30D
          </Button>
          <Button 
            variant="none"
            size="none"
            onClick={() => setRange("90D")}
            className={cn(
              "px-3 py-1 text-xs font-bold rounded transition-all",
              range === "90D" ? "bg-white text-zinc-950 shadow-sm" : "text-on-surface-variant hover:opacity-70"
            )}
          >
            90D
          </Button>
        </div>
      </div>

      <div className="h-[300px] w-full mt-4 flex items-center justify-center">
        {(!data || !Array.isArray(data) || data.length === 0 || !data.some(d => d.amount > 0)) ? (
          <div className="flex flex-col items-center gap-3 text-on-surface-variant/40">
            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">monitoring</span>
            </div>
            <p className="text-sm font-medium">No data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#030304" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#030304" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e2e4" />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 700, fill: "#46464a" }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 700, fill: "#46464a" }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#030304" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#revenueGradient)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
