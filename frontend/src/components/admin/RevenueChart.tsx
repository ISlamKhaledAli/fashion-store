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
import { Activity } from "lucide-react";

interface RevenueChartProps {
  data: { date: string; amount: number }[];
  isLoading?: boolean;
  range?: "30D" | "90D";
  onRangeChange?: (range: "30D" | "90D") => void;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
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
            {new Date(label as string).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
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
CustomTooltip.displayName = "CustomTooltip";

export const RevenueChart = ({ data, isLoading, range, onRangeChange }: RevenueChartProps) => {
  if (isLoading) {
    return (
      <div className="bg-surface-container-lowest p-8 rounded-xl cinematic-shadow border border-outline-variant/10 h-full">
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
          </div>
        </div>
        <Skeleton className="h-[280px] w-full" />
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest p-8 rounded-xl cinematic-shadow border border-outline-variant/10 flex flex-col h-full group transition-all duration-500">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-lg font-medium tracking-tight text-on-surface">Revenue Over Time</h2>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-primary rounded-full"></span>
            <span className="text-xs font-medium">Current</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-surface-container-high rounded-full"></span>
            <span className="text-xs font-medium text-on-surface-variant">Previous</span>
          </div>
        </div>
      </div>

      <div className="h-[280px] w-full mt-auto flex items-center justify-center">
        {(!data || !Array.isArray(data) || data.length === 0) ? (
          <div className="flex flex-col items-center gap-3 text-on-surface-variant/20">
            <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center">
              <Activity className="w-6 h-6 text-on-surface-variant/40" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40">No data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#030304" stopOpacity={0.03}/>
                  <stop offset="95%" stopColor="#030304" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eeeef0" />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 500, fill: "#868587" }}
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
                tick={{ fontSize: 10, fontWeight: 500, fill: "#868587" }}
                tickFormatter={(value) => `$${value >= 1000 ? (value/1000).toFixed(1) + 'k' : value}`}
                dx={-10}
              />
              <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ stroke: '#c7c6ca', strokeWidth: 1, strokeDasharray: '4 4' }}
                wrapperStyle={{ outline: 'none' }}
              />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#030304" 
                strokeWidth={2.5}
                fillOpacity={1} 
                fill="url(#revenueGradient)" 
                animationDuration={1500}
                activeDot={{ 
                  r: 4, 
                  strokeWidth: 2, 
                  stroke: '#fff', 
                  fill: '#030304',
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>

  );
};
