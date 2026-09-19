"use client";

import React from "react";
import { ShoppingBag, Mail, Ban, RotateCcw, ShoppingCart } from "lucide-react";
import type { AdminCustomer } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { AdminDrawer } from "./AdminDrawer";
import { PriceDisplay } from "./PriceDisplay";

interface CustomerDetailPanelProps {
  customer: AdminCustomer | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: "ACTIVE" | "BANNED") => void;
}

export const CustomerDetailPanel = ({
  customer,
  isOpen,
  onClose,
  onStatusChange,
}: CustomerDetailPanelProps) => {
  if (!customer) return null;

  return (
    <AdminDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Customer Profile"
      subtitle={customer.name}
      footer={
        <>
          <Button
            variant="primary"
            className="h-[48px] flex-1 text-[10px] font-black tracking-[0.2em] uppercase"
            onClick={() => (window.location.href = `mailto:${customer.email}`)}
            icon={<Mail size={16} />}
          >
            Message Customer
          </Button>
          <Button
            variant={customer.status === "ACTIVE" ? "outline" : "primary"}
            className={cn(
              "h-[48px] px-8 text-[10px] font-black tracking-[0.2em] uppercase",
              customer.status === "ACTIVE"
                ? "border-red-100 text-red-500 hover:bg-red-50"
                : "border-red-600 bg-red-600 text-white hover:bg-red-700"
            )}
            onClick={() =>
              onStatusChange(
                customer.id,
                customer.status === "ACTIVE" ? "BANNED" : "ACTIVE"
              )
            }
            icon={
              customer.status === "ACTIVE" ? (
                <Ban size={16} />
              ) : (
                <RotateCcw size={16} />
              )
            }
          >
            {customer.status === "ACTIVE" ? "Restrict" : "Restore"}
          </Button>
        </>
      }
    >
      <div className="space-y-12">
        {/* Profile Overview */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-zinc-50 bg-zinc-50 shadow-inner">
            {customer.avatar ? (
              <img
                className="h-full w-full object-cover"
                src={customer.avatar}
                alt={customer.name}
              />
            ) : (
              <span className="text-4xl font-bold text-zinc-300">
                {customer.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
            )}
          </div>
          <h3 className="text-2xl font-bold tracking-tight text-zinc-900">
            {customer.name}
          </h3>
          <p className="mt-1 text-sm text-zinc-500">{customer.email}</p>
          <div className="mt-4 flex gap-2">
            {customer.totalSpent > 10000 && (
              <span className="rounded bg-zinc-900 px-3 py-1 text-[10px] font-bold tracking-wider text-white uppercase">
                VIP Customer
              </span>
            )}
            <span className="rounded border border-zinc-100 bg-zinc-50 px-3 py-1 text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
              Joined{" "}
              {new Date(customer.joinDate).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Detailed Stats Bento */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-zinc-100/50 bg-zinc-50 p-6">
              <span className="mb-2 block text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                Lifetime Value
              </span>
              <PriceDisplay amount={customer.totalSpent} size="lg" />
            </div>
            <div className="rounded-xl border border-zinc-100/50 bg-zinc-50 p-6">
              <span className="mb-2 block text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                Order Count
              </span>
              <p className="text-xl font-bold text-zinc-900 tabular-nums">
                {customer.totalOrders}
              </p>
            </div>
          </div>
          {customer.orders && customer.orders.length > 0 && (
            <div className="rounded-xl border border-zinc-100/50 bg-zinc-50 p-6">
              <span className="mb-2 block text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                Last Order Status
              </span>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-zinc-700">
                  {new Date(customer.orders[0].date).toLocaleDateString(
                    "en-US",
                    { month: "long", day: "numeric", year: "numeric" }
                  )}
                </p>
                <span className="text-[9px] font-black tracking-widest text-zinc-400 uppercase">
                  {customer.orders[0].status}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h4 className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase">
              Recent Activity
            </h4>
            {customer.orders && customer.orders.length > 3 && (
              <Button
                variant="none"
                size="none"
                className="rounded-none border-b border-zinc-900/10 text-xs font-bold text-zinc-900 transition-all hover:border-zinc-900"
              >
                View All
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {customer.orders && customer.orders.length > 0 ? (
              customer.orders.slice(0, 3).map((order) => (
                <div
                  key={order.id}
                  className="group flex items-start gap-4 rounded-xl border border-zinc-50 p-4 transition-all hover:bg-zinc-50/50"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-zinc-50 transition-colors group-hover:bg-zinc-100">
                    <ShoppingCart size={18} className="text-zinc-400" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-bold text-zinc-900">
                        #ORD-{order.id.slice(-6).toUpperCase()}
                      </p>
                      <span
                        className={cn(
                          "shrink-0 rounded px-2 py-0.5 text-[9px] font-black tracking-wider uppercase",
                          order.status === "DELIVERED"
                            ? "bg-green-50 text-green-600"
                            : "bg-amber-50 text-amber-600"
                        )}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
                      <PriceDisplay amount={order.total} size="sm" /> •{" "}
                      {new Date(order.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-100 bg-zinc-50/30 py-12">
                <ShoppingBag
                  size={32}
                  className="mb-4 text-zinc-200"
                  strokeWidth={1}
                />
                <p className="text-[10px] font-bold tracking-[0.3em] text-zinc-400 uppercase">
                  No activity logged
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminDrawer>
  );
};
