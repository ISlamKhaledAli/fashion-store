"use client";

import React from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface RevenueChartProps {
  data: any[];
  isLoading?: boolean;
  range: "30D" | "90D";
  onRangeChange: (range: "30D" | "90D") => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  return (
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
            {new Date(label).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-white leading-none">
              ${payload[0].value.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold text-zinc-400">revenue</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const RevenueChart = ({ data, isLoading, range, onRangeChange }: RevenueChartProps) => {
  if (isLoading) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-100 h-full">
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
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-100 flex flex-col h-full group hover:shadow-md transition-all duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-zinc-950">Revenue Over Time</h2>
          <p className="text-sm text-zinc-400 font-light">Earnings from the last {range === "30D" ? "30 days" : "90 days"} of sales.</p>
        </div>
        <div className="flex bg-zinc-50 rounded-xl p-1 border border-zinc-100">
          {(["30D", "90D"] as const).map((r) => (
            <Button 
              key={r}
              variant="none"
              size="none"
              onClick={() => onRangeChange(r)}
              className={cn(
                "px-4 py-1.5 text-[10px] font-black tracking-widest uppercase rounded-lg transition-all duration-300",
                range === r ? "bg-white text-zinc-950 shadow-sm ring-1 ring-zinc-950/5" : "text-zinc-400 hover:text-zinc-600"
              )}
            >
              {r}
            </Button>
          ))}
        </div>
      </div>

      <div className="h-[300px] w-full mt-auto flex items-center justify-center">
        {(!data || !Array.isArray(data) || data.length === 0) ? (
          <div className="flex flex-col items-center gap-3 text-zinc-200">
            <div className="w-12 h-12 rounded-full bg-zinc-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">monitoring</span>
            </div>
            <p className="text-sm font-bold uppercase tracking-widest text-zinc-300">No telemetry data</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#09090b" stopOpacity={0.08}/>
                  <stop offset="95%" stopColor="#09090b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 9, fontWeight: 700, fill: "#a1a1aa" }}
                dy={12}
                tickFormatter={(val) => {
                  const date = new Date(val);
                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }}
                minTickGap={30}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 9, fontWeight: 700, fill: "#a1a1aa" }}
                tickFormatter={(value) => `$${value >= 1000 ? (value/1000).toFixed(1) + 'k' : value}`}
                dx={-10}
              />
              <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ stroke: '#e4e4e7', strokeWidth: 1, strokeDasharray: '4 4' }}
                wrapperStyle={{ outline: 'none' }}
              />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#09090b" 
                strokeWidth={2.5}
                fillOpacity={1} 
                fill="url(#revenueGradient)" 
                animationDuration={1500}
                activeDot={{ 
                  r: 5, 
                  strokeWidth: 2, 
                  stroke: '#fff', 
                  fill: '#09090b',
                  className: "shadow-lg shadow-zinc-950/20"
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
