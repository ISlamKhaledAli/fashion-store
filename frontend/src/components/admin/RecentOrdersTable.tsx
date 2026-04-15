"use client";

import React from "react";
import { Order } from "@/types";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { motion } from "framer-motion";
import { StatusBadge } from "./StatusBadge";

interface RecentOrdersTableProps {
  orders: Order[];
  isLoading?: boolean;
  onOrderClick?: (order: Order) => void;
}

const OrderRow = React.memo(({ order, onClick }: { order: Order; onClick?: (order: Order) => void }) => {
  return (
    <motion.tr 
      onClick={() => onClick?.(order)}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="hover:bg-zinc-50 transition-colors duration-200 cursor-pointer group/row relative border-b border-zinc-50 last:border-0"
    >
      <td className="px-6 py-4">
        <span className="font-bold text-xs text-zinc-950">
          #{order.id.slice(-6).toUpperCase()}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center overflow-hidden border border-zinc-100 shadow-sm transition-transform group-hover/row:scale-110">
            {order.user?.avatar ? (
              <img src={order.user.avatar} className="w-full h-full object-cover" alt={order.user.name} />
            ) : (
              <span className="text-[10px] font-black text-zinc-400">
                {order.user?.name?.split(' ').map((n: string) => n[0]).join('') || "U"}
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-zinc-950 truncate max-w-[140px]">
              {order.user?.name || "Anonymous User"}
            </span>
            <span className="text-[10px] text-zinc-500 font-medium">Customer</span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-zinc-950">
            {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
          <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-tight">
            {new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm font-bold text-zinc-950 tabular-nums">
          ${order.total.toLocaleString(undefined, { minimumFractionDigits: 1 })}
        </span>
      </td>
      <td className="px-6 py-4">
        <StatusBadge status={order.status} />
      </td>
      <td className="px-6 py-4 text-right opacity-0 group-hover/row:opacity-100 transition-all">
        <div className="flex items-center justify-end gap-2 text-zinc-400">
          <ExternalLink size={14} />
        </div>
      </td>
    </motion.tr>
  );
});

OrderRow.displayName = "OrderRow";

export const RecentOrdersTable = ({ orders, isLoading, onOrderClick }: RecentOrdersTableProps) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="p-6 space-y-4">
          {Array(5).fill(0).map((_, i) => (
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
        ease: [0.16, 1, 0.3, 1] as const
      }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden group/table hover:shadow-lg transition-all duration-500"
    >
      <div className="px-6 py-5 border-b border-zinc-100 flex justify-between items-center bg-white">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold tracking-tight text-zinc-950">Recent Orders</h2>
          <span className="bg-zinc-100 text-zinc-500 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">{orders.length} New</span>
        </div>
        <Link 
          href="/admin/orders" 
          className="group/link text-[10px] font-black text-zinc-400 hover:text-zinc-950 transition-all uppercase tracking-[0.2em] flex items-center gap-2"
        >
          View Archive
          <ArrowRight size={12} className="group-hover/link:translate-x-1 transition-transform" />
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50/50 border-b border-zinc-100">
              <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Order Identifier</th>
              <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Acquisition</th>
              <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Timestamp</th>
              <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Amount</th>
              <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">State</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-sm text-zinc-300 font-medium italic">
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
