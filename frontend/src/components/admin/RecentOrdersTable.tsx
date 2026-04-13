"use client";

import React from "react";
import { Order } from "@/types";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface RecentOrdersTableProps {
  orders: Order[];
  isLoading?: boolean;
}

const statusStyles: Record<string, string> = {
  Processing: "bg-amber-100 text-amber-700",
  Shipped: "bg-blue-100 text-blue-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

export const RecentOrdersTable = ({ orders, isLoading }: RecentOrdersTableProps) => {
  if (isLoading) {
    return (
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden">
        <div className="px-8 py-6 border-b border-outline-variant/10 flex justify-between items-center">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="p-8 space-y-4">
          {Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden">
      <div className="px-8 py-6 border-b border-outline-variant/10 flex justify-between items-center bg-white">
        <h2 className="text-lg font-bold tracking-tight text-on-surface">Recent Orders</h2>
        <Link 
          href="/admin/orders" 
          className="text-xs font-bold text-primary hover:underline transition-all uppercase tracking-[0.2em]"
        >
          View All
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container-low/50">
              <th className="px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Order ID</th>
              <th className="px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Customer</th>
              <th className="px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Date</th>
              <th className="px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Items</th>
              <th className="px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Total</th>
              <th className="px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Status</th>
              <th className="px-8 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-8 py-12 text-center text-sm text-on-surface-variant font-light italic">
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-surface-container-low transition-colors group">
                  <td className="px-8 py-4 font-mono text-sm font-semibold text-on-surface">#{order.id.slice(-4).toUpperCase()}</td>
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center overflow-hidden border border-outline-variant/20 shadow-sm">
                        {order.user?.avatar ? (
                          <img src={order.user.avatar} className="w-full h-full object-cover" alt={order.user.name} />
                        ) : (
                          <span className="text-[10px] font-bold text-on-surface-variant">
                            {order.user?.name?.split(' ').map(n => n[0]).join('') || "U"}
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-medium text-on-surface truncate max-w-[120px]">
                        {order.user?.name || "Guest User"}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-sm text-on-surface-variant">
                    {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-8 py-4 text-sm text-on-surface">{order.items?.length || 0}</td>
                  <td className="px-8 py-4 text-sm font-bold text-on-surface">${order.total.toLocaleString()}</td>
                  <td className="px-8 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-tight",
                      statusStyles[order.status] || "bg-zinc-100 text-zinc-600"
                    )}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <Button 
                      variant="icon"
                      size="none"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      icon={<span className="material-symbols-outlined text-on-surface-variant">more_horiz</span>}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
