"use client";

import React, { memo } from "react";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import type { HandleProductFieldChange } from "./types";
import { Clock, ShieldCheck, Tag, ShoppingBag, Sparkles } from "lucide-react";

export interface PricingSectionProps {
  price: number;
  comparePrice?: number;
  cost?: number;
  margin: string;
  isSaleable?: boolean;
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
    isSaleable = true,
    isRentable = false,
    rentalPrice,
    securityDeposit,
    maxRentalDays = 14,
    onFieldChange,
    errors,
  }: PricingSectionProps) => {
    // Current listing mode
    const listingMode: "SALE_ONLY" | "RENT_ONLY" | "BOTH" =
      isSaleable && isRentable
        ? "BOTH"
        : !isSaleable && isRentable
          ? "RENT_ONLY"
          : "SALE_ONLY";

    const handleModeChange = (mode: "SALE_ONLY" | "RENT_ONLY" | "BOTH") => {
      if (mode === "SALE_ONLY") {
        onFieldChange("isSaleable", true);
        onFieldChange("isRentable", false);
      } else if (mode === "RENT_ONLY") {
        onFieldChange("isSaleable", false);
        onFieldChange("isRentable", true);
      } else {
        onFieldChange("isSaleable", true);
        onFieldChange("isRentable", true);
      }
    };

    return (
      <section className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="h-[1px] flex-1 bg-zinc-100 dark:bg-zinc-800" />
          <h4 className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase">
            Pricing &amp; Availability Matrix
          </h4>
          <div
            className={cn(
              "rounded-full border px-3 py-1 text-[9px] font-black tracking-widest uppercase",
              Number(margin) > 40
                ? "border-green-100 bg-green-50 text-green-700 dark:border-green-900/50 dark:bg-green-950/40 dark:text-green-400"
                : "border-zinc-200 bg-zinc-50 text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900"
            )}
          >
            Margin: {margin}%
          </div>
          <div className="h-[1px] flex-1 bg-zinc-100 dark:bg-zinc-800" />
        </div>

        {/* Listing Mode Selector: Sale Only, Rent Only, or Both */}
        <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Transaction Mode
              </h5>
              <p className="text-[11px] text-zinc-500">
                Determine if customers can purchase to own, rent for events, or
                choose either
              </p>
            </div>
            <span className="rounded-md bg-zinc-200/80 px-2 py-0.5 text-[10px] font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {listingMode === "SALE_ONLY"
                ? "Sale Only"
                : listingMode === "RENT_ONLY"
                  ? "Rent Only"
                  : "Buy & Rent"}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {/* Sale Only */}
            <button
              type="button"
              onClick={() => handleModeChange("SALE_ONLY")}
              className={cn(
                "flex flex-col items-start rounded-lg border p-3.5 text-left transition-all",
                listingMode === "SALE_ONLY"
                  ? "border-zinc-900 bg-white shadow-xs ring-1 ring-zinc-900 dark:border-white dark:bg-zinc-800 dark:ring-white"
                  : "border-zinc-200 bg-white/60 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/60"
              )}
            >
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  <ShoppingBag className="h-3.5 w-3.5 text-zinc-700 dark:text-zinc-300" />
                  <span>Buy Only</span>
                </div>
                {listingMode === "SALE_ONLY" && (
                  <div className="h-2 w-2 rounded-full bg-zinc-900 dark:bg-white" />
                )}
              </div>
              <p className="mt-1 text-[11px] text-zinc-500">
                Standard retail purchase with add to cart &amp; checkout.
              </p>
            </button>

            {/* Rent Only */}
            <button
              type="button"
              onClick={() => handleModeChange("RENT_ONLY")}
              className={cn(
                "flex flex-col items-start rounded-lg border p-3.5 text-left transition-all",
                listingMode === "RENT_ONLY"
                  ? "border-zinc-900 bg-white shadow-xs ring-1 ring-zinc-900 dark:border-white dark:bg-zinc-800 dark:ring-white"
                  : "border-zinc-200 bg-white/60 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/60"
              )}
            >
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  <Clock className="h-3.5 w-3.5 text-zinc-700 dark:text-zinc-300" />
                  <span>Rent Only</span>
                </div>
                {listingMode === "RENT_ONLY" && (
                  <div className="h-2 w-2 rounded-full bg-zinc-900 dark:bg-white" />
                )}
              </div>
              <p className="mt-1 text-[11px] text-zinc-500">
                Archival piece reserved exclusively for scheduled bookings.
              </p>
            </button>

            {/* Both */}
            <button
              type="button"
              onClick={() => handleModeChange("BOTH")}
              className={cn(
                "flex flex-col items-start rounded-lg border p-3.5 text-left transition-all",
                listingMode === "BOTH"
                  ? "border-zinc-900 bg-white shadow-xs ring-1 ring-zinc-900 dark:border-white dark:bg-zinc-800 dark:ring-white"
                  : "border-zinc-200 bg-white/60 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/60"
              )}
            >
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  <Sparkles className="h-3.5 w-3.5 text-zinc-700 dark:text-zinc-300" />
                  <span>Buy &amp; Rent</span>
                </div>
                {listingMode === "BOTH" && (
                  <div className="h-2 w-2 rounded-full bg-zinc-900 dark:bg-white" />
                )}
              </div>
              <p className="mt-1 text-[11px] text-zinc-500">
                Customers can toggle between buying to own or renting.
              </p>
            </button>
          </div>
        </div>

        {/* Purchase Pricing (shown if isSaleable is true OR for retail comparison if rent only) */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <Input
            label={
              listingMode === "RENT_ONLY"
                ? "Retail / Valuation Value ($)"
                : "Purchase Price ($)"
            }
            type="number"
            value={price}
            onChange={(e) =>
              onFieldChange("price", parseFloat(e.target.value) || 0)
            }
            icon={<span className="text-xs font-bold">$</span>}
            error={errors?.price}
          />
          <Input
            label="Compare at Price ($)"
            type="number"
            value={comparePrice}
            onChange={(e) =>
              onFieldChange("comparePrice", parseFloat(e.target.value) || 0)
            }
            icon={<span className="text-xs font-bold">$</span>}
          />
          <Input
            label="Cost per Item ($)"
            type="number"
            value={cost}
            onChange={(e) =>
              onFieldChange("cost", parseFloat(e.target.value) || 0)
            }
            icon={<span className="text-xs font-bold">$</span>}
          />
        </div>

        {/* Luxury Rental Configuration (shown if isRentable is true) */}
        {isRentable && (
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800">
              <Clock className="h-4 w-4 text-zinc-900 dark:text-zinc-100" />
              <div>
                <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Rental Program Parameters
                </h5>
                <p className="text-[11px] text-zinc-500">
                  Configure daily rental rate, refundable deposit, and maximum
                  allowed duration
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div>
                <Input
                  label="Daily Rental Rate ($ / day)"
                  type="number"
                  min="1"
                  value={rentalPrice ?? 0}
                  onChange={(e) =>
                    onFieldChange(
                      "rentalPrice",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  icon={<span className="text-xs font-bold">$</span>}
                />
                <p className="mt-1 text-[11px] text-zinc-500">
                  Rate calculated per day selected by customer
                </p>
              </div>

              <div>
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
                  icon={
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  }
                />
                <p className="mt-1 text-[11px] text-zinc-500">
                  Held on customer card and refunded upon return
                </p>
              </div>

              <div>
                <Input
                  label="Max Rental Duration (Days)"
                  type="number"
                  min="1"
                  max="60"
                  value={maxRentalDays ?? 14}
                  onChange={(e) =>
                    onFieldChange(
                      "maxRentalDays",
                      parseInt(e.target.value) || 14
                    )
                  }
                  icon={<Tag className="h-3.5 w-3.5 text-zinc-400" />}
                />
                <p className="mt-1 text-[11px] text-zinc-500">
                  Customer has full freedom to pick 1, 2, 3... up to this max
                  limit
                </p>
              </div>
            </div>
          </div>
        )}
      </section>
    );
  }
);

PricingSection.displayName = "PricingSection";
