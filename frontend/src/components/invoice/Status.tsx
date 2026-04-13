import React from "react";
import { cn } from "@/lib/utils";

interface StatusProps {
  status: string;
  paymentStatus: string;
}

export const Status = ({ status, paymentStatus }: StatusProps) => {
  return (
    <div className="flex justify-between items-center">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">Order Invoice</h2>
        <p className="text-xs text-zinc-400 font-medium">Cinematic Admin & Archive System</p>
      </div>
      <div className="flex gap-2">
        <span className={cn(
          "px-3 py-1 text-[10px] font-bold tracking-widest uppercase rounded-full",
          paymentStatus === "PAID" ? "bg-green-50 text-green-700" : "bg-zinc-100 text-zinc-700"
        )}>
          {paymentStatus}
        </span>
        <span className="px-3 py-1 bg-zinc-100 text-zinc-700 text-[10px] font-bold tracking-widest uppercase rounded-full">
          {status}
        </span>
      </div>
    </div>
  );
};
