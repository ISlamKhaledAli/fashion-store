"use client";

import React from "react";
import { OrderItem } from "@/types";

interface OrderSummaryProps {
  items: OrderItem[];
}

export const OrderSummary = React.memo(({ items }: OrderSummaryProps) => {
  return (
    <div className="space-y-4">
      {items.map((item, idx) => (
        <div key={idx} className="flex gap-4 group/item">
          <div className="w-16 h-16 rounded bg-zinc-50 overflow-hidden flex-shrink-0 border border-zinc-100 transition-shadow group-hover/item:shadow-md">
            <img 
              src={item.product?.images?.[0]?.url || ""} 
              alt={item.product?.name} 
              className="w-full h-full object-cover transition-transform group-hover/item:scale-105" 
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-zinc-900 truncate tracking-tight">{item.product?.name}</div>
            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
              Qty: {item.quantity} • {item.variant?.size} / {item.variant?.color}
            </div>
            <div className="text-sm font-black mt-1 text-zinc-900 tabular-nums">
              ${item.price.toLocaleString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

OrderSummary.displayName = "OrderSummary";
