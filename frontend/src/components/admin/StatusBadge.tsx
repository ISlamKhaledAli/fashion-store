"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  PROCESSING: "bg-primary-container text-on-primary-container",
  SHIPPED: "bg-secondary-container/10 text-secondary border border-secondary/20",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-error-container text-on-error-container",
  PENDING: "bg-surface-container-high text-on-surface-variant",
};

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
      statusStyles[status] || "bg-zinc-100 text-zinc-600",
      className
    )}>
      {status}
    </span>
  );
};
