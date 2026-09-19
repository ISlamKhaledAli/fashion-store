"use client";

import React from "react";
import type { Order } from "@/types";
import { Skeleton } from "@/components/ui/Skeleton";
import { ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { StatusBadge } from "./StatusBadge";
import { TableImage } from "./TableImage";
import { PriceDisplay } from "./PriceDisplay";

interface RecentOrdersTableProps {
  orders: Order[];
  isLoading?: boolean;
  onOrderClick?: (order: Order) => void;
}

const OrderRow = React.memo(
  ({ order, onClick }: { order: Order; onClick?: (order: Order) => void }) => {
    return (
      <motion.tr
        onClick={() => onClick?.(order)}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="group/row relative cursor-pointer border-b border-zinc-50 transition-colors duration-200 last:border-0 hover:bg-zinc-50"
      >
        <td className="px-6 py-4">
          <span className="text-xs font-bold text-zinc-950">
            #{order.id.slice(-6).toUpperCase()}
          </span>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <TableImage
              src={order.user?.avatar}
              alt={order.user?.name}
              containerClassName="w-8 h-8 rounded-full border border-zinc-100 shadow-sm transition-transform group-hover/row:scale-110"
            />
            <div className="flex flex-col">
              <span className="max-w-[140px] truncate text-sm font-medium text-zinc-950">
                {order.user?.name || "Anonymous User"}
              </span>
              <span className="text-[10px] font-medium text-zinc-500">
                Customer
              </span>
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-zinc-950">
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
            <span className="text-[10px] font-medium tracking-tight text-zinc-500 uppercase">
              {new Date(order.createdAt).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </span>
          </div>
        </td>
        <td className="px-6 py-4">
          <PriceDisplay amount={order.total} size="sm" />
        </td>
        <td className="px-6 py-4">
          <StatusBadge status={order.status} />
        </td>
        <td className="px-6 py-4 text-right opacity-0 transition-all group-hover/row:opacity-100">
          <div className="flex items-center justify-end gap-2 text-zinc-400">
            <ExternalLink size={14} />
          </div>
        </td>
      </motion.tr>
    );
  }
);

OrderRow.displayName = "OrderRow";

export const RecentOrdersTable = ({
  orders,
  isLoading,
  onOrderClick,
}: RecentOrdersTableProps) => {
  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="space-y-4 p-6">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      className="group/table overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-500 hover:shadow-lg"
    >
      <div className="flex items-center justify-between border-b border-zinc-100 bg-white px-6 py-5">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold tracking-tight text-zinc-950">
            Recent Orders
          </h2>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-black tracking-widest text-zinc-500 uppercase">
            {orders.length} New
          </span>
        </div>
        <Link
          href="/admin/orders"
          className="group/link flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-zinc-400 uppercase transition-all hover:text-zinc-950"
        >
          View Archive
          <ArrowRight
            size={12}
            className="transition-transform group-hover/link:translate-x-1"
          />
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/50">
              <th className="px-6 py-4 text-[10px] font-black tracking-[0.2em] text-zinc-400 uppercase">
                Order Identifier
              </th>
              <th className="px-6 py-4 text-[10px] font-black tracking-[0.2em] text-zinc-400 uppercase">
                Acquisition
              </th>
              <th className="px-6 py-4 text-[10px] font-black tracking-[0.2em] text-zinc-400 uppercase">
                Timestamp
              </th>
              <th className="px-6 py-4 text-[10px] font-black tracking-[0.2em] text-zinc-400 uppercase">
                Amount
              </th>
              <th className="px-6 py-4 text-[10px] font-black tracking-[0.2em] text-zinc-400 uppercase">
                State
              </th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {orders.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-16 text-center text-sm font-medium text-zinc-300 italic"
                >
                  No transaction records found
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <OrderRow key={order.id} order={order} onClick={onOrderClick} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};
