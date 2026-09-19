"use client";

import React, { memo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";
import type { ProductFormData, HandleProductFieldChange } from "./types";

export interface IdentitySectionProps {
  name: string;
  slug: string;
  categoryId: string;
  brandId: string;
  status: ProductFormData["status"];
  categoryOptions: { label: string; value: string }[];
  brandOptions: { label: string; value: string }[];
  onNameChange: (val: string) => void;
  onFieldChange: HandleProductFieldChange;
  errors: Record<string, string>;
}

export const IdentitySection = memo(
  ({
    name,
    slug,
    categoryId,
    brandId,
    status,
    categoryOptions,
    brandOptions,
    onNameChange,
    onFieldChange,
    errors,
  }: IdentitySectionProps) => (
    <section className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="h-[1px] flex-1 bg-zinc-100" />
        <h4 className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase">
          Core Identity
        </h4>
        <div className="h-[1px] flex-1 bg-zinc-100" />
      </div>

      <div className="space-y-6">
        <Input
          label="Product Name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="e.g. Sculptural Trench Coat"
          error={errors?.name}
          required
        />

        <Input
          label="Custom Slug"
          value={slug}
          onChange={(e) => onFieldChange("slug", e.target.value)}
          placeholder="e.g. sculptural-trench-coat"
          error={errors?.slug}
        />

        <div className="grid grid-cols-2 items-end gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold tracking-widest text-zinc-400 uppercase">
              Classification
            </label>
            <Select
              options={categoryOptions}
              value={categoryId}
              onChange={(val) => onFieldChange("categoryId", val)}
              className="w-full"
              labelPrefix="In"
              error={errors?.categoryId}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold tracking-widest text-zinc-400 uppercase">
              Source / Brand
            </label>
            <Select
              options={brandOptions}
              value={brandId}
              onChange={(val) => onFieldChange("brandId", val)}
              className="w-full"
              labelPrefix="By"
              error={errors?.brandId}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-6 rounded-xl border border-zinc-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-1 flex-col">
            <h4 className="text-sm font-semibold tracking-wide text-zinc-950">
              Publication Status
            </h4>
            <p className="mt-1 text-xs leading-relaxed text-zinc-500">
              Toggle visibility on the main archival feed
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="none"
              size="none"
              onClick={() =>
                onFieldChange(
                  "status",
                  status === "ACTIVE" ? "DRAFT" : "ACTIVE"
                )
              }
              disabled={status === "ARCHIVED"}
              className={cn(
                "relative h-6 w-12 shrink-0 rounded-full transition-colors duration-200 focus:ring-2 focus:ring-black focus:ring-offset-2 focus:outline-none",
                status === "ACTIVE" ? "bg-black" : "bg-zinc-300",
                status === "ARCHIVED" && "cursor-not-allowed opacity-50"
              )}
            >
              <motion.div
                initial={false}
                animate={{ x: status === "ACTIVE" ? 24 : 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="pointer-events-none absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm"
              />
            </Button>

            <Button
              type="button"
              variant={status === "ARCHIVED" ? "primary" : "outline"}
              onClick={() =>
                onFieldChange(
                  "status",
                  status === "ARCHIVED" ? "DRAFT" : "ARCHIVED"
                )
              }
              className={cn(
                "h-9 shrink-0 rounded-lg px-4 py-2 text-[11px] font-bold tracking-widest uppercase transition",
                status === "ARCHIVED"
                  ? "border-stone-900 bg-stone-900 text-white hover:bg-stone-800"
                  : "border-zinc-200 hover:bg-zinc-50"
              )}
            >
              {status === "ARCHIVED" ? "Archived" : "Archive"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
);

IdentitySection.displayName = "IdentitySection";
