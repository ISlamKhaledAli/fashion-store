"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { adminApi } from "@/lib/api";
import { exportToCSV } from "@/lib/exportUtils";
import { toast } from "sonner";
import { FileSpreadsheet, Download, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ReportType = "orders" | "products" | "customers" | "inventory";

const REPORT_TYPES: {
  id: ReportType;
  title: string;
  desc: string;
}[] = [
  {
    id: "orders",
    title: "Orders & Financials",
    desc: "Order IDs, customer emails, total, discounts, status, and payment",
  },
  {
    id: "products",
    title: "Product Catalog",
    desc: "Catalog list with SKU counts, pricing, categories, and stock status",
  },
  {
    id: "customers",
    title: "Customer Directory",
    desc: "Customer profiles, aggregate spend, total orders, and join date",
  },
  {
    id: "inventory",
    title: "Stock & Inventory",
    desc: "Variants, SKU stock levels, and replenishment status",
  },
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedType, setSelectedType] = useState<ReportType>("orders");
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "all">("30d");
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const timestamp = new Date().toISOString().split("T")[0];

      if (selectedType === "orders") {
        const res = await adminApi.getOrders({ limit: 500 });
        const orders = res.data.data;
        if (!orders || orders.length === 0) {
          toast.error("No orders found to export");
          return;
        }

        const rows = orders.map((o) => ({
          "Order ID": o.id,
          "Created Date": new Date(o.createdAt).toLocaleDateString(),
          "Customer Name": o.user?.name || "Guest",
          "Customer Email": o.user?.email || "N/A",
          Status: o.status,
          "Payment Status": o.paymentStatus,
          "Subtotal ($)": o.subtotal,
          "Discount ($)": o.discount,
          "Tax ($)": o.tax,
          "Shipping ($)": o.shipping,
          "Total ($)": o.total,
          "Items Count": o.items?.length || 0,
          "Tracking Number": o.trackingNumber || "",
          Carrier: o.carrier || "",
        }));

        exportToCSV(rows, `the-curator-orders-${timestamp}.csv`);
        toast.success(`Exported ${rows.length} orders successfully`);
      } else if (selectedType === "products") {
        const res = await adminApi.getProducts({ limit: 1000 });
        const products = res.data.data;
        if (!products || products.length === 0) {
          toast.error("No products found to export");
          return;
        }

        const rows = products.map((p) => {
          const totalStock =
            p.variants?.reduce((sum, v) => sum + v.stock, 0) ?? 0;
          return {
            "Product ID": p.id,
            Title: p.name,
            Slug: p.slug,
            Category: p.category?.name || "Uncategorized",
            Brand: p.brand?.name || "None",
            "Price ($)": p.price,
            "Compare Price ($)": p.comparePrice || p.price,
            Status: p.status,
            "Total Stock": totalStock,
            "Variants Count": p.variants?.length || 0,
            Featured: p.featured ? "Yes" : "No",
            "Created Date": new Date(p.createdAt).toLocaleDateString(),
          };
        });

        exportToCSV(rows, `the-curator-products-${timestamp}.csv`);
        toast.success(`Exported ${rows.length} products successfully`);
      } else if (selectedType === "customers") {
        const res = await adminApi.getCustomers({ limit: 1000 });
        const customers = res.data.data;
        if (!customers || customers.length === 0) {
          toast.error("No customers found to export");
          return;
        }

        const rows = customers.map((c) => ({
          "Customer ID": c.id,
          Name: c.name,
          Email: c.email,
          Phone: c.phone || "",
          Status: c.status,
          "Total Orders": c.totalOrders,
          "Total Spent ($)": c.totalSpent,
          "Member Since": new Date(c.joinDate).toLocaleDateString(),
        }));

        exportToCSV(rows, `the-curator-customers-${timestamp}.csv`);
        toast.success(`Exported ${rows.length} customer records successfully`);
      } else if (selectedType === "inventory") {
        const res = await adminApi.getInventory();
        const products = res.data.data;
        if (!products || products.length === 0) {
          toast.error("No inventory data found to export");
          return;
        }

        const rows: Record<string, unknown>[] = [];
        for (const p of products) {
          for (const v of p.variants || []) {
            rows.push({
              "Product Name": p.name,
              "Product ID": p.id,
              SKU: v.sku || "N/A",
              Size: v.size,
              Color: v.color,
              "Stock Level": v.stock,
              "Stock Status":
                v.stock <= 0
                  ? "OUT_OF_STOCK"
                  : v.stock < 5
                    ? "LOW_STOCK"
                    : "IN_STOCK",
              "Unit Price ($)": p.price,
            });
          }
        }

        exportToCSV(rows, `the-curator-inventory-${timestamp}.csv`);
        toast.success(
          `Exported ${rows.length} variant stock rows successfully`
        );
      }

      onClose();
    } catch {
      toast.error("Failed to generate report");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generate Analytics & Audit Report"
    >
      <div className="space-y-6 pt-2">
        {/* Report selection */}
        <div>
          <label className="text-muted-foreground mb-2 block text-xs font-semibold tracking-wider uppercase">
            Select Data Domain
          </label>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {REPORT_TYPES.map((rt) => {
              const isSelected = selectedType === rt.id;
              return (
                <button
                  key={rt.id}
                  type="button"
                  onClick={() => setSelectedType(rt.id)}
                  className={cn(
                    "flex flex-col rounded-xl border p-3 text-left transition-all",
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border/60 hover:border-border hover:bg-muted/30"
                  )}
                >
                  <div className="mb-1 flex w-full items-center justify-between">
                    <span className="text-sm font-medium">{rt.title}</span>
                    {isSelected && (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                    )}
                  </div>
                  <span className="text-muted-foreground line-clamp-2 text-xs">
                    {rt.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date scope */}
        <div>
          <label className="text-muted-foreground mb-2 block text-xs font-semibold tracking-wider uppercase">
            Time Scope
          </label>
          <div className="flex gap-2">
            {[
              { id: "7d", label: "Past 7 Days" },
              { id: "30d", label: "Past 30 Days" },
              { id: "all", label: "All Time (Complete)" },
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDateRange(d.id as "7d" | "30d" | "all")}
                className={cn(
                  "flex-1 rounded-lg border px-3 py-2 text-center text-xs font-medium transition-colors",
                  dateRange === d.id
                    ? "bg-foreground border-foreground font-semibold text-background"
                    : "border-border/60 text-muted-foreground hover:bg-muted/40"
                )}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Format notice */}
        <div className="bg-muted/40 text-muted-foreground border-border/40 flex items-start gap-2 rounded-lg border p-3 text-xs">
          <FileSpreadsheet className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>
            Generates RFC 4180 standard UTF-8 CSV compatible with Excel, Apple
            Numbers, and Google Sheets.
          </span>
        </div>

        {/* Modal actions */}
        <div className="border-border/40 flex items-center justify-end gap-2 border-t pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={exporting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleExport}
            disabled={exporting}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            {exporting ? "Compiling..." : "Export CSV"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
