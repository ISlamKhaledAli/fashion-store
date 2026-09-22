"use client";

import React, { useState } from "react";
import {
  Code2,
  Copy,
  Check,
  LayoutGrid,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityDetailsViewerProps {
  details: Record<string, unknown>;
  action?: string;
  entity?: string;
}

// Map known keys to clean, human-friendly titles
const KEY_LABELS: Record<string, string> = {
  name: "Name",
  productName: "Product Name",
  title: "Title",
  price: "Price",
  oldPrice: "Previous Price",
  newPrice: "New Price",
  costPrice: "Cost Price",
  status: "Status",
  stock: "Stock Quantity",
  quantity: "Quantity",
  sku: "SKU",
  slug: "URL Slug",
  role: "User Role",
  email: "Email Address",
  phone: "Phone Number",
  discountPercent: "Discount",
  discountType: "Discount Type",
  discountValue: "Discount Value",
  code: "Promo Code",
  minSpend: "Minimum Spend",
  maxSpend: "Maximum Spend",
  usageLimit: "Usage Limit",
  timesUsed: "Times Used",
  category: "Category",
  categoryId: "Category ID",
  brand: "Brand",
  brandId: "Brand ID",
  shippingMethod: "Shipping Method",
  trackingNumber: "Tracking Number",
  carrier: "Carrier",
  paymentStatus: "Payment Status",
  paymentMethod: "Payment Method",
  orderTotal: "Order Total",
  totalAmount: "Total Amount",
  subtotal: "Subtotal",
  tax: "Tax",
  reason: "Reason",
  notes: "Notes",
  description: "Description",
  color: "Color",
  size: "Size",
  isActive: "Is Active",
  isFeatured: "Featured",
  isArchived: "Archived",
};

// Formatter for field keys
function formatKey(key: string): string {
  if (KEY_LABELS[key]) {
    return KEY_LABELS[key];
  }
  // Convert camelCase or snake_case to Title Case words
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

// Check if string is a status keyword
function isStatusKeyword(val: string): boolean {
  const upper = val.toUpperCase();
  return [
    "ACTIVE",
    "INACTIVE",
    "PENDING",
    "COMPLETED",
    "PAID",
    "UNPAID",
    "CANCELLED",
    "DRAFT",
    "ARCHIVED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "REFUNDED",
    "FAILED",
    "CONFIRMED",
    "BANNED",
    "ADMIN",
    "CUSTOMER",
  ].includes(upper);
}

// Status badge styling
function getStatusBadgeClass(val: string): string {
  const upper = val.toUpperCase();
  if (
    ["ACTIVE", "COMPLETED", "PAID", "DELIVERED", "CONFIRMED"].includes(upper)
  ) {
    return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
  }
  if (["PENDING", "PROCESSING", "DRAFT"].includes(upper)) {
    return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
  }
  if (
    ["INACTIVE", "CANCELLED", "REFUNDED", "FAILED", "BANNED"].includes(upper)
  ) {
    return "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20";
  }
  return "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border-zinc-500/20";
}

// Format currency
function isPriceKey(key: string): boolean {
  const lower = key.toLowerCase();
  return (
    lower.includes("price") ||
    lower.includes("amount") ||
    lower.includes("total") ||
    lower.includes("cost") ||
    lower.includes("subtotal") ||
    lower.includes("tax") ||
    lower.includes("spend") ||
    lower.includes("fee")
  );
}

// Format individual primitive value
function renderValue(key: string, value: unknown): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-zinc-400 italic">None</span>;
  }

  if (typeof value === "boolean") {
    return value ? (
      <span className="inline-flex items-center gap-1 rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
        <CheckCircle2 className="h-3 w-3" /> Yes
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 rounded border border-zinc-300 bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
        <XCircle className="h-3 w-3" /> No
      </span>
    );
  }

  if (typeof value === "number") {
    if (isPriceKey(key)) {
      return (
        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
          $
          {value.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      );
    }
    return (
      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
        {value.toLocaleString()}
      </span>
    );
  }

  if (typeof value === "string") {
    // Check if ISO date
    if (
      value.length >= 19 &&
      value.includes("T") &&
      !Number.isNaN(Date.parse(value))
    ) {
      return (
        <span className="inline-flex items-center gap-1 text-xs text-zinc-700 dark:text-zinc-300">
          <Clock className="h-3 w-3 text-zinc-400" />
          {new Date(value).toLocaleString()}
        </span>
      );
    }

    // Check status keyword
    if (isStatusKeyword(value)) {
      return (
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide uppercase",
            getStatusBadgeClass(value)
          )}
        >
          {value.replace(/_/g, " ")}
        </span>
      );
    }

    // Color hex code
    if (/^#([0-9A-F]{3}){1,2}$/i.test(value)) {
      return (
        <span className="inline-flex items-center gap-1.5 font-mono text-xs">
          <span
            className="h-3.5 w-3.5 rounded-full border border-black/10 shadow-inner"
            style={{ backgroundColor: value }}
          />
          {value}
        </span>
      );
    }

    return (
      <span className="font-medium text-zinc-900 dark:text-zinc-100">
        {value}
      </span>
    );
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-zinc-400 italic">Empty list</span>;
    }

    // If array of strings or numbers
    const isPrimitiveArray = value.every(
      (item) => typeof item === "string" || typeof item === "number"
    );

    if (isPrimitiveArray) {
      return (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {value.map((item, idx) => (
            <span
              key={idx}
              className="inline-flex items-center rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
            >
              {String(item)}
            </span>
          ))}
        </div>
      );
    }

    // Array of objects
    return (
      <div className="space-y-1.5 pt-1">
        {value.map((item, idx) => (
          <div
            key={idx}
            className="rounded border border-zinc-200/60 bg-zinc-50/70 p-2 text-xs dark:border-zinc-800/60 dark:bg-zinc-900/40"
          >
            {typeof item === "object" && item !== null ? (
              <div className="space-y-1">
                {Object.entries(item as Record<string, unknown>).map(
                  ([subKey, subVal]) => (
                    <div
                      key={subKey}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="text-zinc-500">
                        {formatKey(subKey)}:
                      </span>
                      <span className="font-medium text-zinc-800 dark:text-zinc-200">
                        {renderValue(subKey, subVal)}
                      </span>
                    </div>
                  )
                )}
              </div>
            ) : (
              String(item)
            )}
          </div>
        ))}
      </div>
    );
  }

  // Nested object
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) {
      return <span className="text-zinc-400 italic">Empty object</span>;
    }

    return (
      <div className="space-y-1.5 rounded-md border border-zinc-200/60 bg-zinc-50/60 p-2 text-xs dark:border-zinc-800/60 dark:bg-zinc-900/40">
        {entries.map(([nestedKey, nestedVal]) => (
          <div
            key={nestedKey}
            className="flex items-center justify-between gap-2 border-b border-zinc-100 pb-1 last:border-none last:pb-0 dark:border-zinc-800/50"
          >
            <span className="text-zinc-500">{formatKey(nestedKey)}</span>
            <span className="font-medium text-zinc-800 dark:text-zinc-200">
              {renderValue(nestedKey, nestedVal)}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return String(value);
}

export const ActivityDetailsViewer: React.FC<ActivityDetailsViewerProps> = ({
  details,
  action,
  entity,
}) => {
  const [viewMode, setViewMode] = useState<"formatted" | "raw">("formatted");
  const [copied, setCopied] = useState(false);

  const entries = Object.entries(details);

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(details, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard error
    }
  };

  return (
    <div className="mt-2.5 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50/50 shadow-xs dark:border-zinc-800 dark:bg-zinc-950/60">
      {/* Top action bar */}
      <div className="flex items-center justify-between border-b border-zinc-200/80 bg-zinc-100/60 px-3.5 py-2 dark:border-zinc-800/80 dark:bg-zinc-900/60">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
          <Sparkles className="h-3.5 w-3.5 text-zinc-500" />
          <span>Recorded Changes &amp; Event Details</span>
          {entity && (
            <span className="hidden text-[11px] font-normal text-zinc-500 sm:inline-block">
              ({entity} {action ? `• ${action.replace(/_/g, " ")}` : ""})
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* View mode toggle */}
          <div className="flex items-center rounded-lg border border-zinc-200 bg-white p-0.5 text-xs dark:border-zinc-700 dark:bg-zinc-800">
            <button
              type="button"
              onClick={() => setViewMode("formatted")}
              className={cn(
                "flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors",
                viewMode === "formatted"
                  ? "bg-zinc-950 text-white shadow-xs dark:bg-white dark:text-zinc-950"
                  : "text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100"
              )}
            >
              <LayoutGrid className="h-3 w-3" />
              <span>Details</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("raw")}
              className={cn(
                "flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors",
                viewMode === "raw"
                  ? "bg-zinc-950 text-white shadow-xs dark:bg-white dark:text-zinc-950"
                  : "text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100"
              )}
            >
              <Code2 className="h-3 w-3" />
              <span>JSON</span>
            </button>
          </div>

          {/* Copy button */}
          <button
            type="button"
            onClick={handleCopyJson}
            title="Copy raw JSON"
            className="flex h-7 items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 text-[11px] font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-600 dark:text-emerald-400">
                  Copied
                </span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-3.5">
        {viewMode === "formatted" ? (
          entries.length === 0 ? (
            <div className="py-4 text-center text-xs text-zinc-400">
              No detailed properties recorded.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {entries.map(([key, value]) => {
                const isComplex =
                  typeof value === "object" &&
                  value !== null &&
                  (!Array.isArray(value) ||
                    value.some((it) => typeof it === "object"));

                return (
                  <div
                    key={key}
                    className={cn(
                      "flex flex-col justify-between rounded-lg border border-zinc-200/80 bg-white p-3 shadow-2xs transition-all dark:border-zinc-800 dark:bg-zinc-900/60",
                      isComplex && "sm:col-span-2 lg:col-span-3"
                    )}
                  >
                    <div className="flex items-center justify-between pb-1.5">
                      <span className="flex items-center gap-1 text-[10px] font-bold tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
                        {isComplex && (
                          <Layers className="h-3 w-3 text-zinc-400" />
                        )}
                        {formatKey(key)}
                      </span>
                    </div>

                    <div className="text-sm leading-snug font-medium">
                      {renderValue(key, value)}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <pre className="overflow-x-auto rounded-lg border border-zinc-800 bg-neutral-950 p-3.5 font-mono text-xs text-neutral-200">
            {JSON.stringify(details, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};
