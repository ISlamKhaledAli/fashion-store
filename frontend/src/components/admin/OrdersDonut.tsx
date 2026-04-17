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
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

interface OrdersDonutProps {
  data: { name: string; value: number }[];
  isLoading?: boolean;
}

const COLORS: Record<string, string> = {
  PROCESSING: "#fbbf24", // amber-400
  SHIPPED: "#3b82f6",    // blue-500
  DELIVERED: "#22c55e",  // green-500
  CANCELLED: "#ef4444",   // red-500
};

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
  return (
    <AnimatePresence>
      {active && payload && payload.length && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 4 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="bg-black text-white px-2 py-1.5 rounded-md shadow-lg pointer-events-none z-50 flex flex-col items-center min-w-[80px]"
        >
          <span className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-0.5">
            {payload[0].payload.name}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold leading-none">{payload[0].value}</span>
            <span className="text-[9px] font-medium opacity-40 uppercase">Orders</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
CustomTooltip.displayName = "CustomTooltip";

export const OrdersDonut = ({ data, isLoading }: OrdersDonutProps) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  if (isLoading) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-100 flex flex-col items-center justify-center space-y-6">
        <div className="w-full text-left">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48 mb-6" />
        </div>
        <Skeleton className="h-[180px] w-[180px] rounded-full" />
        <div className="grid grid-cols-2 gap-4 w-full px-4">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-100 flex flex-col h-full group hover:shadow-md transition-all duration-500 overflow-hidden">
      <div className="mb-6">
        <h2 className="text-lg font-bold tracking-tight text-zinc-950">Orders by Status</h2>
        <p className="text-sm text-zinc-400 font-light">Direct fulfillment state distribution.</p>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
        {total === 0 ? (
          <div className="flex flex-col items-center gap-3 text-zinc-200">
            <div className="w-12 h-12 rounded-full bg-zinc-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">pie_chart</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-300">Archive empty</p>
          </div>
        ) : (
          <>
            {/* Chart Area */}
            <div className="relative w-[180px] h-[180px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={6}
                    dataKey="value"
                    stroke="none"
                    animationDuration={1200}
                    animationBegin={0}
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                  >
                    {data.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[entry.name.toUpperCase()] || "#e4e4e7"} 
                        className="cursor-pointer transition-all duration-300"
                        style={{
                          opacity: activeIndex === null || activeIndex === index ? 1 : 0.4,
                          filter: activeIndex === index ? "brightness(1.1)" : "none",
                        }}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={<CustomTooltip />} 
                    cursor={false}
                    offset={15}
                    wrapperStyle={{ outline: 'none' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none translate-y-1">
                <span className="text-4xl font-black tracking-tighter text-zinc-950 tabular-nums">
                  {total}
                </span>
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] -mt-1">Total</span>
              </div>
            </div>

            {/* Legend Area */}
            <div className="w-full h-px bg-zinc-50" />
            
            <div className="w-full flex-1 flex flex-col gap-4 px-2">
              {data.map((item, index) => {
                const color = COLORS[item.name.toUpperCase()] || "#e4e4e7";
                const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
                const isActive = activeIndex === index;
                
                return (
                  <div 
                    key={item.name} 
                    className={cn(
                      "flex items-center justify-between px-4 transition-all duration-300",
                      activeIndex !== null && !isActive ? "opacity-30 scale-[0.98]" : "opacity-100 scale-100"
                    )}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div 
                        className="w-2 h-2 rounded-full shrink-0 shadow-sm" 
                        style={{ backgroundColor: color }} 
                      />
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest truncate">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-[11px] font-black text-zinc-950 tabular-nums">
                      {percentage}%
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
