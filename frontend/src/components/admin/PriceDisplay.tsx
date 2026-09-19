import React from "react";
import { cn } from "@/lib/utils";

export interface PriceDisplayProps {
  amount: number;
  currency?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const PriceDisplay = React.memo(
  ({ amount, currency = "$", size = "md", className }: PriceDisplayProps) => {
    // Format with commas, always keep 2 decimal points
    const formatted = amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    const [whole, decimal] = formatted.split(".");

    const sizeClasses = {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-base",
      xl: "text-lg",
    };

    const textClass = sizeClasses[size] || sizeClasses.md;

    return (
      <span
        className={cn(
          "inline-flex items-baseline tracking-tight tabular-nums",
          textClass,
          className
        )}
      >
        <span className="mr-[1px] font-medium text-zinc-500 select-none">
          {currency}
        </span>
        <span className="font-bold text-zinc-950">{whole}</span>
        <span className="font-medium text-zinc-400">.{decimal}</span>
      </span>
    );
  }
);

PriceDisplay.displayName = "PriceDisplay";
