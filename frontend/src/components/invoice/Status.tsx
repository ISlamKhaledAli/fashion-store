import React from "react";
import { cn } from "@/lib/utils";

interface StatusProps {
  status: string;
  paymentStatus: string;
}

export const Status = ({ status, paymentStatus }: StatusProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Order Invoice
        </h2>
        <p className="text-xs font-medium text-zinc-400">
          Cinematic Admin & Archive System
        </p>
      </div>
      <div className="flex gap-2">
        <span
          className={cn(
            "rounded-full px-3 py-1 text-[10px] font-bold tracking-widest uppercase",
            paymentStatus === "PAID"
              ? "bg-green-50 text-green-700"
              : "bg-zinc-100 text-zinc-700"
          )}
        >
          {paymentStatus}
        </span>
        <span className="rounded-full bg-zinc-100 px-3 py-1 text-[10px] font-bold tracking-widest text-zinc-700 uppercase">
          {status}
        </span>
      </div>
    </div>
  );
};
