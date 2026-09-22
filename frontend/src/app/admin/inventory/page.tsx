"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  Package,
  Search,
  AlertTriangle,
  Boxes,
  TrendingUp,
  MoreHorizontal,
  X,
  Eye,
  Edit2,
  Archive,
  ArrowRight,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { adminApi } from "@/lib/api";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { useClickOutside } from "@/hooks/useClickOutside";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { TableImage } from "@/components/admin/TableImage";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { MetricCard } from "@/components/admin/MetricCard";

interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  image: string | null;
  category: string;
  size: string;
  color: string;
  colorHex: string | null;
  sku: string;
  stock: number;
  price: number;
  productStatus: string;
  updatedAt?: string;
}

export default function AdminInventoryPage() {
  const router = useRouter();
  const [inventoryRows, setInventoryRows] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<
    "ALL" | "LOW" | "OUT" | "IN" | "ARCHIVED"
  >("ALL");
  const [_error, setError] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // Quick Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [_isUpdating, setIsUpdating] = useState(false);

  // Menu State
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const pageTopRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef, () => setOpenMenuId(null));

  // Confirmation State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [discontinueTarget, setDiscontinueTarget] = useState<{
    id: string;
    isRestore: boolean;
  } | null>(null);
  const [isArchiveLoading, setIsArchiveLoading] = useState(false);

  const fetchInventory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminApi.getInventory();
      if (res.data.success) {
        const products = res.data.data || [];
        const rows = products.flatMap((product: Product) => {
          if (!product.variants || product.variants.length === 0) return [];
          return product.variants.map((variant) => ({
            id: variant.id,
            productId: product.id,
            productName: product.name,
            image:
              product.images?.find((img) => img.isMain)?.url ||
              product.images?.[0]?.url ||
              null,
            category: product.category?.name || "—",
            size: variant.size || "—",
            color: variant.color || "—",
            colorHex: variant.colorHex || "#ccc",
            sku: variant.sku || "—",
            stock: variant.stock ?? 0,
            price: product.price || 0,
            productStatus: product.status || "ACTIVE",
            updatedAt: variant.updatedAt,
          }));
        });
        setInventoryRows(rows);
      }
    } catch {
      setError("Failed to load inventory");
      toast.error("Telemetry failure. Sync impossible.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const stats = useMemo(() => {
    const activeRows = inventoryRows.filter(
      (i) => i.productStatus !== "ARCHIVED"
    );
    const archivedRows = inventoryRows.filter(
      (i) => i.productStatus === "ARCHIVED"
    );

    return {
      totalSKUs: activeRows.length,
      lowStock: activeRows.filter((i) => i.stock > 0 && i.stock < 5).length,
      outOfStock: activeRows.filter((i) => i.stock === 0).length,
      inStock: activeRows.filter((i) => i.stock >= 5).length,
      archived: archivedRows.length,
      totalValue: activeRows.reduce(
        (acc, curr) => acc + curr.stock * curr.price,
        0
      ),
    };
  }, [inventoryRows]);

  const filteredItems = useMemo(() => {
    return inventoryRows.filter((i) => {
      const matchesSearch =
        i.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.sku?.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesTab = true;
      if (activeTab === "ARCHIVED") {
        matchesTab = i.productStatus === "ARCHIVED";
      } else {
        if (i.productStatus === "ARCHIVED") return false;
        if (activeTab === "LOW") matchesTab = i.stock > 0 && i.stock < 5;
        if (activeTab === "OUT") matchesTab = i.stock === 0;
        if (activeTab === "IN") matchesTab = i.stock >= 5;
      }

      return matchesSearch && matchesTab;
    });
  }, [inventoryRows, searchQuery, activeTab]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  useEffect(() => {
    // Only scroll if we are not on the first render (optional, but usually desired on page clicks)
    if (currentPage > 0) {
      pageTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [currentPage]);

  const handleQuickEdit = (id: string, currentStock: number) => {
    setEditingId(id);
    setEditValue(currentStock.toString());
    setOpenMenuId(null);
  };

  const saveQuickEdit = async (id: string) => {
    const newValue = parseInt(editValue);
    if (isNaN(newValue) || newValue < 0) {
      toast.error("Invalid stock quantity");
      setEditingId(null);
      return;
    }
    setIsUpdating(true);
    try {
      await adminApi.updateStock(id, newValue);
      toast.success("Inventory updated");
      setInventoryRows((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, stock: newValue, updatedAt: new Date().toISOString() }
            : item
        )
      );
    } catch {
      toast.error("Update failed");
    } finally {
      setIsUpdating(false);
      setEditingId(null);
    }
  };

  const handleDiscontinueTrigger = (
    productId: string,
    isRestore: boolean = false
  ) => {
    setDiscontinueTarget({ id: productId, isRestore });
    setIsConfirmOpen(true);
    setOpenMenuId(null);
  };

  const confirmDiscontinue = async () => {
    if (!discontinueTarget) return;

    setIsArchiveLoading(true);
    try {
      const newStatus = discontinueTarget.isRestore ? "ACTIVE" : "ARCHIVED";
      await adminApi.updateProduct(discontinueTarget.id, { status: newStatus });
      toast.success(
        discontinueTarget.isRestore
          ? "Product restored to active catalog."
          : "Manifest archived and removed from active inventory."
      );
      fetchInventory();
      setIsConfirmOpen(false);
    } catch {
      toast.error("Telemetry error. Status remains unchanged.");
    } finally {
      setIsArchiveLoading(false);
      setDiscontinueTarget(null);
    }
  };

  return (
    <div className="space-y-10 pb-20" ref={pageTopRef}>
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <h2 className="text-4xl font-medium tracking-tight text-zinc-950">
              Inventory
            </h2>
            <div className="flex gap-2">
              {stats.lowStock > 0 && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-amber-700 uppercase">
                  {stats.lowStock} Low Stock
                </span>
              )}
              {stats.outOfStock > 0 && (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-red-700 uppercase">
                  {stats.outOfStock} Out
                </span>
              )}
            </div>
          </div>
          <p className="max-w-md font-medium text-zinc-500 italic">
            Refining the editorial stock across all global boutiques.
          </p>
        </div>
        <div className="flex w-full items-center gap-4 lg:w-auto">
          <div className="relative flex-1 lg:w-72">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search SKU or Product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-zinc-100 bg-zinc-50 py-2.5 pr-4 pl-10 text-sm transition-all outline-none focus:ring-1 focus:ring-zinc-950"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total SKUs"
          value={stats.totalSKUs}
          icon={<Boxes size={20} />}
          color="text-zinc-950"
        />
        <MetricCard
          title="Low Level"
          value={stats.lowStock}
          trendDirection={stats.lowStock > 0 ? "down" : "up"}
          icon={<AlertTriangle size={20} />}
          color="text-amber-600"
        />
        <MetricCard
          title="Stock Out"
          value={stats.outOfStock}
          icon={<X size={20} />}
          color="text-red-500"
        />
        <MetricCard
          title="Est. Value"
          value={stats.totalValue}
          prefix="$"
          icon={<TrendingUp size={20} />}
          color="text-zinc-950"
        />
      </div>

      <AdminTabs
        tabs={[
          { id: "ALL", label: "All Pieces", count: stats.totalSKUs },
          { id: "OUT", label: "Sold Out", count: stats.outOfStock },
          { id: "LOW", label: "Depleting", count: stats.lowStock },
          { id: "IN", label: "In Stock", count: stats.inStock },
          { id: "ARCHIVED", label: "Archived", count: stats.archived },
        ]}
        activeTab={activeTab}
        onTabChange={(id) => {
          setActiveTab(id as "ALL" | "LOW" | "OUT" | "IN" | "ARCHIVED");
          setCurrentPage(1);
        }}
        layoutId="inventoryTabUnderline"
      />

      {/* Inventory Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-zinc-100 bg-zinc-50/50">
              <tr>
                <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                  Piece & ID
                </th>
                <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                  Category
                </th>
                <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                  Description
                </th>
                <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                  Units
                </th>
                <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                  Last Sync
                </th>
                <th className="px-8 py-5 text-right text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-8 py-6">
                      <Skeleton className="h-12 w-full" />
                    </td>
                  </tr>
                ))
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-32 text-center opacity-30">
                    <Package size={64} className="mx-auto mb-4" />
                    <p className="text-sm font-bold tracking-widest uppercase">
                      Archive Void
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => (
                  <tr
                    key={item.id}
                    className="group transition-colors hover:bg-zinc-50/50"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <TableImage
                          src={item.image}
                          alt={item.productName}
                          containerClassName="w-12 h-14 rounded-lg border border-zinc-200 shadow-sm"
                        />
                        <div>
                          <p className="text-sm font-bold text-zinc-950">
                            {item.productName}
                          </p>
                          <p className="mt-1 font-mono text-[10px] text-zinc-400 uppercase">
                            # {item.sku}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-xs font-medium text-zinc-500">
                      {item.category}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-zinc-900">
                          {item.size}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: item.colorHex || "#ccc" }}
                          />
                          <span className="text-[9px] font-bold text-zinc-400 uppercase">
                            {item.color}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {editingId === item.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            autoFocus
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveQuickEdit(item.id);
                              if (e.key === "Escape") setEditingId(null);
                            }}
                            onBlur={() => saveQuickEdit(item.id)}
                            className="w-16 rounded border border-zinc-200 bg-white px-2 py-1 text-sm font-bold outline-none focus:ring-1 focus:ring-zinc-950"
                          />
                        </div>
                      ) : (
                        <div
                          onClick={() => handleQuickEdit(item.id, item.stock)}
                          className={cn(
                            "-ml-3 flex w-fit cursor-pointer items-center gap-3 rounded-lg border border-transparent px-3 py-1 transition-all hover:bg-zinc-100",
                            item.stock === 0
                              ? "font-black text-red-600"
                              : item.stock < 5
                                ? "font-black text-amber-600"
                                : "font-bold text-zinc-950"
                          )}
                        >
                          <span className="text-sm tabular-nums">
                            {item.stock}
                          </span>
                          <div
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              item.stock === 0
                                ? "bg-red-500"
                                : item.stock < 5
                                  ? "bg-amber-500"
                                  : "bg-green-500"
                            )}
                          />
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6 text-[10px] font-bold text-zinc-400 uppercase">
                      {item.updatedAt
                        ? new Date(item.updatedAt).toLocaleDateString()
                        : "Pending"}
                    </td>
                    <td className="relative px-8 py-6 text-right">
                      <Button
                        variant="none"
                        size="none"
                        onClick={() =>
                          setOpenMenuId(openMenuId === item.id ? null : item.id)
                        }
                        className="rounded-lg p-2 text-zinc-400 transition-all hover:bg-zinc-100 hover:text-zinc-950 active:scale-95"
                      >
                        <MoreHorizontal size={18} />
                      </Button>

                      <AnimatePresence>
                        {openMenuId === item.id && (
                          <motion.div
                            ref={menuRef}
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute top-full right-8 z-50 -mt-2 w-56 overflow-hidden rounded-xl border border-zinc-100 bg-white py-2 shadow-2xl"
                          >
                            <Button
                              variant="none"
                              size="none"
                              onClick={() =>
                                router.push(
                                  `/admin/products?edit=${item.productId}`
                                )
                              }
                              className="flex w-full items-center justify-between rounded-none border-b border-zinc-50 px-4 py-3 text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase transition-all hover:bg-zinc-50 hover:text-zinc-950"
                            >
                              <div className="flex items-center gap-3">
                                <Eye size={14} className="text-zinc-400" />
                                <span>View Details</span>
                              </div>
                              <ArrowRight
                                size={12}
                                className="opacity-0 group-hover:opacity-100"
                              />
                            </Button>
                            <Button
                              variant="none"
                              size="none"
                              onClick={() =>
                                handleQuickEdit(item.id, item.stock)
                              }
                              className="flex w-full items-center gap-3 rounded-none border-b border-zinc-50 px-4 py-3 text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase transition-all hover:bg-zinc-50 hover:text-zinc-950"
                            >
                              <Edit2 size={14} className="text-zinc-400" />
                              <span>Adjust Stock</span>
                            </Button>
                            {item.productStatus === "ARCHIVED" ? (
                              <Button
                                variant="none"
                                size="none"
                                onClick={() =>
                                  handleDiscontinueTrigger(item.productId, true)
                                }
                                className="flex w-full items-center gap-3 rounded-none px-4 py-3 text-[10px] font-black tracking-[0.2em] text-zinc-950 uppercase transition-all hover:bg-zinc-50"
                              >
                                <RotateCcw
                                  size={14}
                                  className="text-zinc-400"
                                />
                                <span>Restore Piece</span>
                              </Button>
                            ) : (
                              <Button
                                variant="none"
                                size="none"
                                onClick={() =>
                                  handleDiscontinueTrigger(item.productId)
                                }
                                className="flex w-full items-center gap-3 rounded-none px-4 py-3 text-[10px] font-black tracking-[0.2em] text-red-400 uppercase transition-all hover:bg-red-50 hover:text-red-600"
                              >
                                <Archive size={14} className="text-red-300" />
                                <span>Discontinue</span>
                              </Button>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-zinc-100 px-2 py-4 sm:flex-row">
          <p className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
            Showing{" "}
            <span className="text-zinc-950">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}
            </span>{" "}
            to{" "}
            <span className="text-zinc-950">
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredItems.length)}
            </span>{" "}
            of <span className="text-zinc-950">{filteredItems.length}</span>{" "}
            pieces
          </p>

          <div className="flex items-center gap-1 rounded-xl border border-zinc-100 bg-white p-1 shadow-sm">
            <Button
              variant="none"
              size="none"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-all hover:bg-zinc-50 hover:text-zinc-950 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronLeft size={14} />
            </Button>

            <div className="flex items-center px-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <Button
                  key={i}
                  variant="none"
                  size="none"
                  onClick={() => setCurrentPage(i + 1)}
                  className={cn(
                    "h-8 w-8 rounded-lg text-[10px] font-bold transition-all",
                    currentPage === i + 1
                      ? "bg-zinc-950 text-white shadow-md"
                      : "text-zinc-400 hover:bg-zinc-50 hover:text-zinc-950"
                  )}
                >
                  {i + 1}
                </Button>
              ))}
            </div>

            <Button
              variant="none"
              size="none"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-all hover:bg-zinc-50 hover:text-zinc-950 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDiscontinue}
        title={
          discontinueTarget?.isRestore
            ? "Restore Product"
            : "Discontinue Product"
        }
        description={
          discontinueTarget?.isRestore
            ? "Are you sure you want to restore this product? It will be returned to the active collection feeds."
            : "Are you sure you want to discontinue this product? It will be archived across all global inventory feeds."
        }
        confirmText={
          discontinueTarget?.isRestore ? "Restore Product" : "Archive Product"
        }
        cancelText={
          discontinueTarget?.isRestore ? "Keep Archived" : "Keep Active"
        }
        confirmBrand={discontinueTarget?.isRestore ? "primary" : "danger"}
        isLoading={isArchiveLoading}
      />
    </div>
  );
}
