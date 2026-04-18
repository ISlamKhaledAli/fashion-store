"use client";

import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart as PieIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrdersDonutProps {
  data: { name: string; value: number }[];
  isLoading?: boolean;
}

// Proper status colors
const STATUS_COLORS: Record<string, string> = {
  PROCESSING: "#F59E0B",  // amber
  SHIPPED:    "#3B82F6",  // blue
  DELIVERED:  "#10B981",  // green
  CANCELLED:  "#EF4444",  // red
  CANCELED:   "#EF4444",  // red (alternate spelling)
  PENDING:    "#8B5CF6",  // purple
  FULFILLED:  "#10B981",  // green
  RETURNED:   "#F97316",  // orange
};

const getStatusColor = (name: string): string =>
  STATUS_COLORS[name.toUpperCase()] || "#6B7280";

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { value: number; payload: { name: string } }[];
}) => (
  <AnimatePresence>
    {active && payload && payload.length && (
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 4 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="bg-black text-white px-2.5 py-2 rounded-md shadow-lg pointer-events-none z-50 flex flex-col items-center min-w-[90px]"
      >
        <span className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-0.5">
          {payload[0].payload.name}
        </span>
        <div className="flex items-center gap-1">
          <span className="text-sm font-bold leading-none">{payload[0].value.toLocaleString()}</span>
          <span className="text-[9px] font-medium opacity-40 uppercase">Orders</span>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);
CustomTooltip.displayName = "CustomTooltip";

export const OrdersDonut = ({ data, isLoading }: OrdersDonutProps) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const total = Array.isArray(data) ? data.reduce((acc, curr) => acc + (curr.value || 0), 0) : 0;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 w-full h-full">
        <h3 className="text-lg font-medium tracking-tight mb-8 w-full">Orders by Status</h3>
        <div className="w-40 h-40 rounded-full bg-zinc-100 animate-pulse mx-auto" />
        <div className="grid grid-cols-2 gap-4 w-full mt-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex flex-col gap-1 px-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-zinc-100 animate-pulse" />
                <div className="w-16 h-3 rounded bg-zinc-100 animate-pulse" />
              </div>
              <div className="w-8 h-4 rounded bg-zinc-100 animate-pulse pl-4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <h3 className="text-lg font-medium tracking-tight mb-8">Orders by Status</h3>

      <div className="flex-1 flex flex-col items-center justify-center">
        {total === 0 ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-44 h-44 rounded-full border-[18px] border-surface-container-high relative flex items-center justify-center">
              <div className="text-center">
                <span className="block text-2xl font-bold text-on-surface">0</span>
                <span className="block text-[10px] text-on-surface-variant uppercase tracking-widest">Total</span>
              </div>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40">No order data</p>
          </div>
        ) : (
          <>
            {/* Square donut chart */}
            <div className="w-full aspect-square max-w-[200px] mx-auto relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="82%"
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                    animationDuration={1200}
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getStatusColor(entry.name)}
                        style={{
                          opacity: activeIndex === null || activeIndex === index ? 1 : 0.5,
                          transition: "opacity 0.2s ease",
                        }}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Center label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-on-surface tabular-nums">
                  {total.toLocaleString()}
                </span>
                <span className="text-[10px] text-on-surface-variant uppercase tracking-widest">Total</span>
              </div>
            </div>

            {/* Legend — uses actual status colors */}
            <div className="mt-8 grid grid-cols-2 gap-4 w-full">
              {data.map((item) => (
                <div key={item.name} className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: getStatusColor(item.name) }}
                    />
                    <span className="text-[11px] font-medium text-on-surface-variant capitalize">
                      {item.name.charAt(0).toUpperCase() + item.name.slice(1).toLowerCase()}
                    </span>
                  </div>
                  <span className="text-sm font-bold pl-4 text-on-surface tabular-nums">
                    {item.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};
