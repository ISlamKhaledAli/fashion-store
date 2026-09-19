"use client";

import React, { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion, AnimatePresence } from "framer-motion";

interface OrdersDonutProps {
  data: { name: string; value: number }[];
  isLoading?: boolean;
}

// Proper status colors
const STATUS_COLORS: Record<string, string> = {
  PROCESSING: "#F59E0B", // amber
  SHIPPED: "#3B82F6", // blue
  DELIVERED: "#10B981", // green
  CANCELLED: "#EF4444", // red
  CANCELED: "#EF4444", // red (alternate spelling)
  PENDING: "#8B5CF6", // purple
  FULFILLED: "#10B981", // green
  RETURNED: "#F97316", // orange
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
        className="pointer-events-none z-50 flex min-w-[90px] flex-col items-center rounded-md bg-black px-2.5 py-2 text-white shadow-lg"
      >
        <span className="mb-0.5 text-[10px] font-black tracking-widest uppercase opacity-50">
          {payload[0].payload.name}
        </span>
        <div className="flex items-center gap-1">
          <span className="text-sm leading-none font-bold">
            {payload[0].value.toLocaleString()}
          </span>
          <span className="text-[9px] font-medium uppercase opacity-40">
            Orders
          </span>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);
CustomTooltip.displayName = "CustomTooltip";

export const OrdersDonut = ({ data, isLoading }: OrdersDonutProps) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const total = Array.isArray(data)
    ? data.reduce((acc, curr) => acc + (curr.value || 0), 0)
    : 0;

  if (isLoading) {
    return (
      <div className="flex h-full w-full flex-col items-center gap-4 py-6">
        <h3 className="mb-8 w-full text-lg font-medium tracking-tight">
          Orders by Status
        </h3>
        <div className="mx-auto h-40 w-40 animate-pulse rounded-full bg-zinc-100" />
        <div className="mt-8 grid w-full grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col gap-1 px-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 animate-pulse rounded-full bg-zinc-100" />
                <div className="h-3 w-16 animate-pulse rounded bg-zinc-100" />
              </div>
              <div className="h-4 w-8 animate-pulse rounded bg-zinc-100 pl-4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <h3 className="mb-8 text-lg font-medium tracking-tight">
        Orders by Status
      </h3>

      <div className="flex flex-1 flex-col items-center justify-center">
        {total === 0 ? (
          <div className="flex flex-col items-center gap-4">
            <div className="relative flex h-44 w-44 items-center justify-center rounded-full border-[18px] border-surface-container-high">
              <div className="text-center">
                <span className="block text-2xl font-bold text-on-surface">
                  0
                </span>
                <span className="block text-[10px] tracking-widest text-on-surface-variant uppercase">
                  Total
                </span>
              </div>
            </div>
            <p className="text-[10px] font-bold tracking-widest text-on-surface-variant/40 uppercase">
              No order data
            </p>
          </div>
        ) : (
          <>
            {/* Square donut chart */}
            <div className="relative mx-auto flex aspect-square w-full max-w-[200px] items-center justify-center">
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
                          opacity:
                            activeIndex === null || activeIndex === index
                              ? 1
                              : 0.5,
                          transition: "opacity 0.2s ease",
                        }}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Center label */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-on-surface tabular-nums">
                  {total.toLocaleString()}
                </span>
                <span className="text-[10px] tracking-widest text-on-surface-variant uppercase">
                  Total
                </span>
              </div>
            </div>

            {/* Legend — uses actual status colors */}
            <div className="mt-8 grid w-full grid-cols-2 gap-4">
              {data.map((item) => (
                <div key={item.name} className="flex flex-col">
                  <div className="mb-1 flex items-center gap-2">
                    <div
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: getStatusColor(item.name) }}
                    />
                    <span className="text-[11px] font-medium text-on-surface-variant capitalize">
                      {item.name.charAt(0).toUpperCase() +
                        item.name.slice(1).toLowerCase()}
                    </span>
                  </div>
                  <span className="pl-4 text-sm font-bold text-on-surface tabular-nums">
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
