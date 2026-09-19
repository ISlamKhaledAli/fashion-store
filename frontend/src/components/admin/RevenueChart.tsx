"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/Skeleton";
import { Activity } from "lucide-react";

interface RevenueChartProps {
  data: { date: string; amount: number }[];
  isLoading?: boolean;
  range?: "30D" | "90D";
  onRangeChange?: (range: "30D" | "90D") => void;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) => {
  return (
    <AnimatePresence>
      {active && payload && payload.length && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 5 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
          className="pointer-events-none z-50 min-w-[140px] rounded-xl border border-zinc-800 bg-zinc-950 p-3 shadow-2xl backdrop-blur-md"
        >
          <p className="mb-1.5 text-[9px] font-black tracking-[0.2em] text-zinc-500 uppercase">
            {new Date(label as string).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl leading-none font-bold text-white">
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

export const RevenueChart = ({
  data,
  isLoading,
  range,
  onRangeChange,
}: RevenueChartProps) => {
  if (isLoading) {
    return (
      <div className="cinematic-shadow h-full rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
          </div>
        </div>
        <Skeleton className="h-[280px] w-full" />
      </div>
    );
  }

  return (
    <div className="cinematic-shadow group flex h-full flex-col rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-8 transition-all duration-500">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-lg font-medium tracking-tight text-on-surface">
          Revenue Over Time
        </h2>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-primary"></span>
            <span className="text-xs font-medium">Current</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-surface-container-high"></span>
            <span className="text-xs font-medium text-on-surface-variant">
              Previous
            </span>
          </div>
        </div>
      </div>

      <div className="mt-auto flex h-[280px] w-full items-center justify-center">
        {!data || !Array.isArray(data) || data.length === 0 ? (
          <div className="flex flex-col items-center gap-3 text-on-surface-variant/20">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-low">
              <Activity className="h-6 w-6 text-on-surface-variant/40" />
            </div>
            <p className="text-[10px] font-bold tracking-widest text-on-surface-variant/40 uppercase">
              No data available
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient
                  id="revenueGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#030304" stopOpacity={0.03} />
                  <stop offset="95%" stopColor="#030304" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#eeeef0"
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 500, fill: "#868587" }}
                dy={12}
                tickFormatter={(val) => {
                  const date = new Date(val);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
                minTickGap={30}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 500, fill: "#868587" }}
                tickFormatter={(value) =>
                  `$${value >= 1000 ? (value / 1000).toFixed(1) + "k" : value}`
                }
                dx={-10}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  stroke: "#c7c6ca",
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                }}
                wrapperStyle={{ outline: "none" }}
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
                  stroke: "#fff",
                  fill: "#030304",
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
