"use client";

import React, { memo, useEffect, useState } from "react";
import {
  MapPin,
  Check,
  CheckSquare,
  Square,
  Store,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { HandleProductFieldChange } from "./types";
import { rentalApi } from "@/lib/api";
import Link from "next/link";

export interface BranchPickupSectionProps {
  pickupLocations?: string[];
  onFieldChange: HandleProductFieldChange;
}

interface SalonBranch {
  name: string;
  address: string;
}

const DEFAULT_SALONS: SalonBranch[] = [
  { name: "Cairo Flagship Salon", address: "15 Brazil St, Zamalek, Cairo" },
  { name: "Alexandria Boutique", address: "Glim Bay, Alexandria" },
];

export const BranchPickupSection = memo(
  ({ pickupLocations = [], onFieldChange }: BranchPickupSectionProps) => {
    const [salons, setSalons] = useState<SalonBranch[]>(DEFAULT_SALONS);

    useEffect(() => {
      let isMounted = true;
      rentalApi
        .getSalons()
        .then((res) => {
          if (isMounted && res.data?.data && res.data.data.length > 0) {
            setSalons(res.data.data);
          }
        })
        .catch(() => {
          // Fallback to default salons
        });

      return () => {
        isMounted = false;
      };
    }, []);

    const selectedLocations = Array.isArray(pickupLocations)
      ? pickupLocations
      : [];

    const isSelected = (name: string) => selectedLocations.includes(name);

    const toggleLocation = (name: string) => {
      if (isSelected(name)) {
        onFieldChange(
          "pickupLocations",
          selectedLocations.filter((loc) => loc !== name)
        );
      } else {
        onFieldChange("pickupLocations", [...selectedLocations, name]);
      }
    };

    const handleSelectAll = () => {
      const allNames = salons.map((s) => s.name);
      onFieldChange("pickupLocations", allNames);
    };

    const handleClearAll = () => {
      onFieldChange("pickupLocations", []);
    };

    const allSelected =
      salons.length > 0 &&
      salons.every((s) => selectedLocations.includes(s.name));

    return (
      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-[1px] flex-1 bg-zinc-100 dark:bg-zinc-800" />
          <h4 className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase">
            Branch Pickup Matrix (فروع الاستلام المتاحة)
          </h4>
          <span
            className={cn(
              "rounded-full border px-3 py-1 text-[9px] font-black tracking-widest uppercase transition-colors",
              selectedLocations.length > 0
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400"
                : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-400"
            )}
          >
            {selectedLocations.length === 0
              ? "All Salons / Standard"
              : selectedLocations.length === 1
                ? "1 Branch Designated"
                : `${selectedLocations.length} Branches Designated`}
          </span>
          <div className="h-[1px] flex-1 bg-zinc-100 dark:bg-zinc-800" />
        </div>

        <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-6 dark:border-zinc-800 dark:bg-zinc-900/40">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-zinc-900 dark:text-zinc-100" />
                <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Salon Pickup Locations (فروع استلام المنتج)
                </h5>
              </div>
              <p className="mt-1 text-[11px] text-zinc-500">
                حدد الفروع المتاح فيها للعميل استلام هذا المنتج يدوياً. يمكن
                تحديد فرع واحد أو أكثر.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                disabled={allSelected}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-zinc-700 shadow-2xs transition-all hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                <CheckSquare className="h-3.5 w-3.5" />
                تحديد الكل
              </button>
              {selectedLocations.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-zinc-500 shadow-2xs transition-all hover:bg-zinc-100 hover:text-red-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                >
                  <Square className="h-3.5 w-3.5" />
                  إلغاء التحديد
                </button>
              )}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {salons.map((salon) => {
              const active = isSelected(salon.name);
              return (
                <div
                  key={salon.name}
                  onClick={() => toggleLocation(salon.name)}
                  className={cn(
                    "group relative flex cursor-pointer items-start gap-3.5 rounded-xl border p-4 transition-all duration-200",
                    active
                      ? "border-zinc-950 bg-white shadow-xs ring-1 ring-zinc-950 dark:border-white dark:bg-zinc-800 dark:ring-white"
                      : "border-zinc-200/80 bg-white/70 hover:border-zinc-300 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-700"
                  )}
                >
                  <div
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all",
                      active
                        ? "border-zinc-950 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-zinc-950"
                        : "border-zinc-300 bg-white group-hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800"
                    )}
                  >
                    {active && <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {salon.name}
                      </span>
                      {active && (
                        <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                          متاح
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                      <MapPin className="h-3 w-3 shrink-0 text-zinc-400" />
                      <span className="truncate">{salon.address}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-zinc-200/60 pt-3 text-[11px] text-zinc-500 dark:border-zinc-800">
            <span>
              {selectedLocations.length === 0
                ? "💡 في حال عدم تحديد فروع مخصصة، سيتم إتاحة الاستلام من جميع فروع الصالون المعتمدة افتراضياً."
                : `✓ تم تفعيل الاستلام في ${selectedLocations.length} فرع محدد لهذا المنتج.`}
            </span>
            <Link
              href="/admin/settings"
              target="_blank"
              className="inline-flex items-center gap-1 font-medium text-zinc-700 hover:text-zinc-950 hover:underline dark:text-zinc-300 dark:hover:text-white"
            >
              إدارة الفروع <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>
    );
  }
);

BranchPickupSection.displayName = "BranchPickupSection";
