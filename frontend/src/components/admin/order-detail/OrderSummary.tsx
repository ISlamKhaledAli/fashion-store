"use client";

import React from "react";
import type { OrderItem } from "@/types";
import { PriceDisplay } from "../PriceDisplay";

interface OrderSummaryProps {
  items: OrderItem[];
}

export const OrderSummary = React.memo(({ items }: OrderSummaryProps) => {
  return (
    <div className="space-y-4">
      {items.map((item, idx) => (
        <div key={idx} className="group/item flex gap-4">
          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded border border-zinc-100 bg-zinc-50 transition-shadow group-hover/item:shadow-md">
            <img
              src={item.product?.images?.[0]?.url || ""}
              alt={item.product?.name}
              className="h-full w-full object-cover transition-transform group-hover/item:scale-105"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-bold tracking-tight text-zinc-900">
              {item.product?.name}
            </div>
            <div className="mt-0.5 text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
              Qty: {item.quantity} • {item.variant?.size} /{" "}
              {item.variant?.color}
            </div>
            <PriceDisplay amount={item.price} size="sm" />
          </div>
        </div>
      ))}
    </div>
  );
});

OrderSummary.displayName = "OrderSummary";
