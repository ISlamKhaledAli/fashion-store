"use client";

import React, { memo } from "react";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import type { HandleProductFieldChange } from "./types";

export interface PricingSectionProps {
  price: number;
  comparePrice?: number;
  cost?: number;
  margin: string;
  onFieldChange: HandleProductFieldChange;
  errors: Record<string, string>;
}

export const PricingSection = memo(
  ({
    price,
    comparePrice,
    cost,
    margin,
    onFieldChange,
    errors,
  }: PricingSectionProps) => (
    <section className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="h-[1px] flex-1 bg-zinc-100" />
        <h4 className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase">
          Financial Matrix
        </h4>
        <div
          className={cn(
            "rounded-full border px-3 py-1 text-[9px] font-black tracking-widest uppercase",
            Number(margin) > 40
              ? "border-green-100 bg-green-50 text-green-700"
              : "border-zinc-200 bg-zinc-50 text-zinc-400"
          )}
        >
          Margin: {margin}%
        </div>
        <div className="h-[1px] flex-1 bg-zinc-100" />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Input
          label="Price"
          type="number"
          value={price}
          onChange={(e) =>
            onFieldChange("price", parseFloat(e.target.value) || 0)
          }
          icon={<span className="text-xs font-bold">$</span>}
          error={errors?.price}
        />
        <Input
          label="Compare"
          type="number"
          value={comparePrice}
          onChange={(e) =>
            onFieldChange("comparePrice", parseFloat(e.target.value) || 0)
          }
          icon={<span className="text-xs font-bold">$</span>}
        />
        <Input
          label="Cost"
          type="number"
          value={cost}
          onChange={(e) =>
            onFieldChange("cost", parseFloat(e.target.value) || 0)
          }
          icon={<span className="text-xs font-bold">$</span>}
        />
      </div>
    </section>
  )
);

PricingSection.displayName = "PricingSection";
