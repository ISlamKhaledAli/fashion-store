"use client";

import React, { memo } from "react";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import type { HandleProductFieldChange } from "./types";
import { Clock, ShieldCheck } from "lucide-react";

export interface PricingSectionProps {
  price: number;
  comparePrice?: number;
  cost?: number;
  margin: string;
  isRentable?: boolean;
  rentalPrice?: number;
  securityDeposit?: number;
  maxRentalDays?: number;
  onFieldChange: HandleProductFieldChange;
  errors: Record<string, string>;
}

export const PricingSection = memo(
  ({
    price,
    comparePrice,
    cost,
    margin,
    isRentable,
    rentalPrice,
    securityDeposit,
    maxRentalDays,
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
          label="Purchase Price"
          type="number"
          value={price}
          onChange={(e) =>
            onFieldChange("price", parseFloat(e.target.value) || 0)
          }
          icon={<span className="text-xs font-bold">$</span>}
          error={errors?.price}
        />
        <Input
          label="Compare at Price"
          type="number"
          value={comparePrice}
          onChange={(e) =>
            onFieldChange("comparePrice", parseFloat(e.target.value) || 0)
          }
          icon={<span className="text-xs font-bold">$</span>}
        />
        <Input
          label="Cost per Item"
          type="number"
          value={cost}
          onChange={(e) =>
            onFieldChange("cost", parseFloat(e.target.value) || 0)
          }
          icon={<span className="text-xs font-bold">$</span>}
        />
      </div>

      {/* Luxury Rental Configuration */}
      <div className="rounded-xl border border-zinc-200/90 bg-zinc-50/60 p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-600" />
            <div>
              <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Luxury Rental Program
              </h5>
              <p className="text-[11px] text-zinc-500">
                Enable customers to reserve and wear this item for scheduled
                dates
              </p>
            </div>
          </div>

          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={Boolean(isRentable)}
              onChange={(e) => onFieldChange("isRentable", e.target.checked)}
              className="peer sr-only"
            />
            <div className="peer h-5 w-9 rounded-full bg-zinc-200 peer-checked:bg-amber-600 peer-focus:ring-2 peer-focus:ring-amber-500 after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white dark:bg-zinc-700" />
          </label>
        </div>

        {isRentable && (
          <div className="mt-5 grid grid-cols-1 gap-5 border-t border-zinc-200/80 pt-4 sm:grid-cols-3 dark:border-zinc-800">
            <Input
              label="Base Rental Price ($/day or period)"
              type="number"
              min="1"
              value={rentalPrice ?? 0}
              onChange={(e) =>
                onFieldChange("rentalPrice", parseFloat(e.target.value) || 0)
              }
              icon={<span className="text-xs font-bold">$</span>}
            />
            <Input
              label="Refundable Security Deposit ($)"
              type="number"
              min="0"
              value={securityDeposit ?? 0}
              onChange={(e) =>
                onFieldChange(
                  "securityDeposit",
                  parseFloat(e.target.value) || 0
                )
              }
              icon={<ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />}
            />
            <Input
              label="Max Rental Duration (Days)"
              type="number"
              min="1"
              value={maxRentalDays ?? 14}
              onChange={(e) =>
                onFieldChange("maxRentalDays", parseInt(e.target.value) || 14)
              }
            />
          </div>
        )}
      </div>
    </section>
  )
);

PricingSection.displayName = "PricingSection";
