"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
  icon?: React.ReactNode;
  animate?: boolean;
  children?: React.ReactNode;
}

interface VariantConfig {
  bg: string;
  pulse?: boolean;
  glow?: boolean;
}

const statusVariants: Record<string, VariantConfig> = {
  // Core Statuses
  PROCESSING: { bg: "bg-amber-100 text-amber-700 border-amber-200", pulse: true },
  PENDING: { bg: "bg-zinc-100 text-zinc-600 border-zinc-200" },
  DELIVERED: { bg: "bg-green-100 text-green-700 border-green-200", glow: true },
  
  // Inventory Related
  ACTIVE: { bg: "bg-zinc-950 text-white border-zinc-950 shadow-lg shadow-zinc-950/20", glow: true },
  OUT_OF_STOCK: { bg: "bg-red-50 text-red-700 border-red-100/50", glow: true },
  DEPLETING: { bg: "bg-orange-50 text-orange-700 border-orange-100/50", glow: true },
  
  // Archival/Misc
  ARCHIVED: { bg: "bg-zinc-100 text-zinc-500 border-zinc-200" },
  DRAFT: { bg: "bg-amber-100 text-amber-700 border-amber-200" },

  // Mapped States
  SHIPPED: { bg: "bg-zinc-100 text-zinc-600 border-zinc-200" },
  PAID: { bg: "bg-green-100 text-green-700 border-green-200", glow: true },
  CANCELLED: { bg: "bg-red-50 text-red-700 border-red-100/50" },
};

export const StatusBadge = ({ status, className, children }: StatusBadgeProps) => {
  const normalizedStatus = status.toUpperCase().replace(/\s+/g, '_');
  const variant = statusVariants[normalizedStatus] || statusVariants.ARCHIVED;

  return (
    <span className={cn(
      "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-medium tracking-wide border transition-all duration-300 hover:scale-[1.05] hover:shadow-md hover:z-10 uppercase select-none whitespace-nowrap",
      variant.bg,
      variant.glow && "animate-soft-glow",
      className
    )}>
      <span className={cn(
        "w-2 h-2 rounded-full shrink-0 bg-current",
        variant.pulse && "animate-pulse"
      )} />
      {children || status.replace(/_/g, ' ')}
    </span>
  );
};

