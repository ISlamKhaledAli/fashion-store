"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { Product } from "@/types";
import { adminApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Checkbox } from "@/components/ui/Checkbox";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Edit,
  Archive,
  Trash2,
  Package,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  FileEdit,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TableImage } from "@/components/admin/TableImage";
import type { AdminTab } from "@/components/admin/AdminTabs";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { PriceDisplay } from "@/components/admin/PriceDisplay";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  BulkActionBar,
  type BulkActionItem,
} from "@/components/admin/BulkActionBar";
import { exportToCSV } from "@/lib/exportUtils";

const ProductFormPanel = React.lazy(() =>
  import("@/components/admin/ProductFormPanel").then((module) => ({
    default: module.ProductFormPanel,
  }))
);

const ProductRow = React.memo(
  ({
    product,
    isSelected,
    onToggleSelect,
    onEdit,
    onArchive,
    onDelete,
  }: {
    product: Product;
    isSelected: boolean;
    onToggleSelect: (id: string) => void;
    onEdit: (p: Product) => void;
    onArchive: (id: string, status: string) => void;
    onDelete: (id: string) => void;
  }) => {
    const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);
    const isLowStock = totalStock <= 5 && totalStock > 0;
    const status = product.status || "ACTIVE";

    return (
      <tr
        onClick={() => onEdit(product)}
        className={cn(
          "group/row relative cursor-pointer border-b border-zinc-50 transition-all hover:bg-zinc-50/50",
          isSelected && "bg-zinc-50/80",
          (totalStock === 0 || isLowStock) &&
            "border-l-4 border-b-warning/30 border-l-warning bg-warning/5"
        )}
      >
        <td
          className="w-12 px-6 py-8"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect(product.id);
          }}
        >
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelect(product.id)}
          />
        </td>
        <td className="px-8 py-8">
          <div className="flex items-center gap-6">
            <TableImage
              src={
                product.images.find((img) => img.isMain)?.url ||
                product.images[0]?.url
              }
              alt={product.name}
              containerClassName="w-16 h-20 rounded-sm shadow-sm group-hover/row:shadow-xl group-hover/row:z-10"
            />
            <div className="space-y-1">
              <p className="text-base font-bold tracking-tight text-zinc-950 transition-transform group-hover/row:translate-x-1">
                {product.name}
              </p>
              <p className="font-mono text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                REF: {product.variants[0]?.sku || "N/A"}
              </p>
            </div>
          </div>
        </td>
        <td className="px-8 py-8">
          <div className="flex flex-col gap-1.5">
            <StatusBadge status="ARCHIVED" className="w-fit bg-zinc-50/50">
              {product.category?.name || "Uncategorized"}
            </StatusBadge>
            {product.brand && (
              <div className="flex w-fit items-center gap-1.5 rounded-full border border-zinc-100 bg-white px-2.5 py-0.5 shadow-sm">
                <span className="text-[10px] font-bold text-zinc-400">BY</span>
                <span className="text-[10px] font-black tracking-tight text-zinc-950 uppercase">
                  {product.brand.name}
                </span>
              </div>
            )}
          </div>
        </td>
        <td className="px-8 py-8 text-right">
          <PriceDisplay amount={product.price} />
        </td>
        <td className="px-8 py-8">
          <StatusBadge status={status} />
        </td>
        <td
          className="px-8 py-8 pr-12 text-right"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex translate-x-4 items-center justify-end gap-1.5 opacity-0 transition-all group-hover/row:translate-x-0 group-hover/row:opacity-100">
            <Button
              variant="icon"
              size="none"
              onClick={() => onEdit(product)}
              className="rounded-full p-2.5 text-zinc-400 transition-all hover:bg-zinc-100 hover:text-zinc-950"
              icon={<Edit size={18} />}
            />
            <Button
              variant="icon"
              size="none"
              onClick={() => onArchive(product.id, status)}
              className="rounded-full p-2.5 text-zinc-400 transition-all hover:bg-zinc-100 hover:text-zinc-950"
              icon={<Archive size={18} />}
            />
            <Button
              variant="icon"
              size="none"
              onClick={() => onDelete(product.id)}
              className="rounded-full p-2.5 text-zinc-400 transition-all hover:bg-red-50 hover:text-red-500"
              icon={<Trash2 size={18} />}
            />
          </div>
        </td>
      </tr>
    );
  }
);
ProductRow.displayName = "ProductRow";

const MobileProductRow = React.memo(
  ({ product, onEdit }: { product: Product; onEdit: (p: Product) => void }) => {
    const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);
    const isLowStock = totalStock <= 5 && totalStock > 0;
    const status = product.status || "ACTIVE";

    return (
      <div
        className={cn(
          "cursor-pointer space-y-4 p-6 transition-colors hover:bg-zinc-50/50",
          (totalStock === 0 || isLowStock) &&
            "border-b border-l-4 border-b-warning/20 border-l-warning bg-warning/5"
        )}
        onClick={() => onEdit(product)}
      >
        <div className="flex gap-4">
          <TableImage
            src={
              product.images.find((img) => img.isMain)?.url ||
              product.images[0]?.url
            }
            alt={product.name}
            containerClassName="w-16 h-20 rounded-sm shadow-sm"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="truncate text-sm font-bold text-zinc-950">
                {product.name}
              </p>
              <PriceDisplay amount={product.price} size="sm" />
            </div>
            <p className="mt-1 font-mono text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
              REF: {product.variants[0]?.sku || "N/A"}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge status="ARCHIVED" className="px-2 py-0.5 text-[9px]">
                {product.category?.name || "Uncategorized"}
              </StatusBadge>
              {product.brand && (
                <span className="rounded-md border border-zinc-100 bg-white px-2 py-0.5 text-[9px] font-bold tracking-tighter text-zinc-950 uppercase shadow-sm">
                  {product.brand.name}
                </span>
              )}
              <StatusBadge status={status} className="px-2 py-0.5 text-[9px]" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-zinc-50 pt-4">
          <div />
          <div className="flex items-center gap-2">
            <Edit size={16} className="text-zinc-400" />
          </div>
        </div>
      </div>
    );
  }
);
MobileProductRow.displayName = "MobileProductRow";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default function AdminProductsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const fetchProducts = async (isMounted: { current: boolean }) => {
    setLoading(true);
    try {
      const res = await adminApi.getProducts({ limit: 100, status: "all" });
      if (isMounted.current && res.data.success) {
        setProducts(res.data.data as Product[]);
      }
    } catch {
      if (isMounted.current) {
        toast.error("Telemetry failure. Catalog inaccessible.");
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const handleCreate = React.useCallback(() => {
    setSelectedProduct(null);
    setIsPanelOpen(true);
  }, []);

  useEffect(() => {
    const isMounted = { current: true };

    fetchProducts(isMounted);

    if (searchParams.get("open") === "true") {
      handleCreate();
    }

    return () => {
      isMounted.current = false;
    };
  }, [searchParams, handleCreate]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.variants.some((v) =>
          v.sku?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      const matchesTab = activeTab === "ALL" || p.status === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [products, searchQuery, activeTab]);

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, page]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const tabList: AdminTab[] = useMemo(
    () => [
      { id: "ALL", label: "All", count: products.length },
      {
        id: "ACTIVE",
        label: "Active",
        count: products.filter((p) => p.status === "ACTIVE").length,
      },
      {
        id: "DRAFT",
        label: "Draft",
        count: products.filter((p) => p.status === "DRAFT").length,
      },
      {
        id: "ARCHIVED",
        label: "Archived",
        count: products.filter((p) => p.status === "ARCHIVED").length,
      },
    ],
    [products]
  );

  const handleEdit = React.useCallback((product: Product) => {
    setSelectedProduct(product);
    setIsPanelOpen(true);
  }, []);

  const handleArchive = React.useCallback(
    async (id: string, currentStatus: string) => {
      const newStatus = currentStatus === "ARCHIVED" ? "ACTIVE" : "ARCHIVED";
      try {
        await adminApi.updateProduct(id, { status: newStatus });
        toast.success(`Entry ${newStatus.toLowerCase()}ized`);
        const isMounted = { current: true };
        fetchProducts(isMounted);
      } catch {
        toast.error("Protocol error. Status locked.");
      }
    },
    []
  );

  const handleDelete = React.useCallback((id: string) => {
    setProductToDelete(id);
  }, []);

  const executeDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await adminApi.deleteProduct(productToDelete);
      toast.success("Piece purged from archives");
      const isMounted = { current: true };
      fetchProducts(isMounted);
    } catch (err) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const errorMsg =
        axiosErr.response?.data?.message || "Critical failure. Data persists.";
      toast.error(errorMsg);
    } finally {
      setIsDeleting(false);
      setProductToDelete(null);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    const pageIds = paginatedProducts.map((p) => p.id);
    const allSelected = pageIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleBulkAction = async (actionId: string) => {
    if (selectedIds.length === 0) return;

    if (actionId === "delete") {
      setIsBulkConfirmOpen(true);
      return;
    }

    if (actionId === "export") {
      const selectedProducts = products.filter((p) =>
        selectedIds.includes(p.id)
      );
      const rows = selectedProducts.map((p) => {
        const totalStock =
          p.variants?.reduce((sum, v) => sum + v.stock, 0) ?? 0;
        return {
          "Product ID": p.id,
          Title: p.name,
          Slug: p.slug,
          Category: p.category?.name || "Uncategorized",
          Brand: p.brand?.name || "None",
          "Price ($)": p.price,
          Status: p.status,
          "Total Stock": totalStock,
          "SKUs Count": p.variants?.length || 0,
        };
      });
      exportToCSV(
        rows,
        `selected-products-${new Date().toISOString().split("T")[0]}.csv`
      );
      toast.success(`Exported ${rows.length} products to CSV`);
      return;
    }

    const statusMap: Record<string, "ACTIVE" | "DRAFT" | "ARCHIVED"> = {
      active: "ACTIVE",
      draft: "DRAFT",
      archive: "ARCHIVED",
    };

    const targetStatus = statusMap[actionId];
    if (targetStatus) {
      try {
        await adminApi.bulkUpdateProductStatus(selectedIds, targetStatus);
        toast.success(
          `Updated ${selectedIds.length} pieces to ${targetStatus}`
        );
        setSelectedIds([]);
        fetchProducts({ current: true });
      } catch {
        toast.error("Failed to update pieces in bulk");
      }
    }
  };

  const executeBulkDelete = async () => {
    setIsBulkDeleting(true);
    try {
      const res = await adminApi.bulkDeleteProducts(selectedIds);
      toast.success(
        res.data.message || `Processed ${selectedIds.length} pieces`
      );
      setSelectedIds([]);
      setIsBulkConfirmOpen(false);
      fetchProducts({ current: true });
    } catch {
      toast.error("Failed to delete pieces");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const productBulkActions: BulkActionItem[] = [
    { id: "active", label: "Set Active", icon: <CheckCircle2 size={16} /> },
    { id: "draft", label: "Set Draft", icon: <FileEdit size={16} /> },
    { id: "archive", label: "Archive", icon: <Archive size={16} /> },
    { id: "export", label: "Export CSV", icon: <Download size={16} /> },
    {
      id: "delete",
      label: "Delete",
      variant: "danger",
      icon: <Trash2 size={16} />,
    },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-1000 sm:space-y-8 lg:space-y-12">
      {/* Page Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:gap-6 lg:gap-8 xl:flex-row xl:items-end">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl lg:text-5xl">
            Products
          </h2>
          <div className="flex items-center gap-4">
            <Badge variant="surface" className="px-3 py-1 font-black">
              Archive Feed
            </Badge>
            <div className="h-4 w-[1px] bg-zinc-200" />
            <span className="text-[10px] font-black tracking-[0.2em] text-zinc-400 uppercase">
              {products.length} Items Indexed
            </span>
          </div>
        </div>
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <Button
            variant="primary"
            size="sm"
            onClick={handleCreate}
            className="flex flex-1 items-center gap-2 rounded-lg bg-zinc-900 px-6 font-medium text-white shadow-md transition-all hover:opacity-90 sm:flex-none"
            icon={<Plus size={16} />}
          >
            Manifest New Item
          </Button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col items-center justify-between gap-4 lg:flex-row">
        <AdminTabs
          tabs={tabList}
          activeTab={activeTab}
          onTabChange={(id) => setActiveTab(id)}
          layoutId="productsTabUnderline"
          className="flex-1 lg:flex-none"
        />
        <div className="w-full lg:w-[320px] xl:w-[400px]">
          <Input
            placeholder="Search by name, SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-lg border-zinc-100 bg-zinc-50/50 py-3 shadow-inner transition-all focus:bg-white"
            icon={<Search />}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-hidden rounded-xl border border-zinc-100 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
        {/* Desktop View */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead className="border-b border-zinc-100 bg-zinc-50/50 text-[10px] font-black tracking-[0.2em] text-zinc-400 uppercase">
              <tr>
                <th className="w-12 px-6 py-5">
                  <Checkbox
                    checked={
                      paginatedProducts.length > 0 &&
                      paginatedProducts.every((p) => selectedIds.includes(p.id))
                    }
                    onCheckedChange={handleToggleSelectAll}
                  />
                </th>
                <th className="px-8 py-5">Piece Specification</th>
                <th className="px-8 py-5">Classification</th>
                <th className="px-8 py-5 text-right">Price</th>
                <th className="px-8 py-5">Stance</th>
                <th className="px-8 py-5 pr-12 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {loading ? (
                Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i}>
                      <td className="flex items-center gap-6 px-8 py-8">
                        <Skeleton className="h-20 w-16 rounded-md" />
                        <div className="space-y-3">
                          <Skeleton className="h-5 w-48" />
                          <Skeleton className="h-3 w-24 px-10" />
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <Skeleton className="h-6 w-32 rounded-full" />
                      </td>
                      <td className="px-8 py-8">
                        <Skeleton className="ml-auto h-5 w-16" />
                      </td>
                      <td className="px-8 py-8">
                        <Skeleton className="h-6 w-24 rounded-full" />
                      </td>
                      <td className="px-8 py-8">
                        <Skeleton className="ml-auto h-5 w-12" />
                      </td>
                    </tr>
                  ))
              ) : paginatedProducts.length > 0 ? (
                paginatedProducts.map((p) => (
                  <ProductRow
                    key={p.id}
                    product={p}
                    isSelected={selectedIds.includes(p.id)}
                    onToggleSelect={handleToggleSelect}
                    onEdit={handleEdit}
                    onArchive={handleArchive}
                    onDelete={handleDelete}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-44 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-6">
                      <div className="rounded-full bg-zinc-50 p-8 shadow-inner">
                        <Package
                          size={64}
                          strokeWidth={1}
                          className="text-zinc-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold tracking-tight text-zinc-950">
                          Void detected in archive
                        </h3>
                        <p className="px-8 text-[11px] leading-relaxed font-bold tracking-widest text-zinc-400 uppercase">
                          The editorial collection currently holds no entries
                          for this manifestation.
                        </p>
                      </div>
                      <Button
                        variant="primary"
                        onClick={handleCreate}
                        className="mt-6 rounded-lg bg-zinc-950 px-12 py-4 text-[10px] font-black tracking-[0.3em] uppercase shadow-2xl"
                      >
                        Initialize Archive
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Stacked View */}
        <div className="divide-y divide-zinc-50 md:hidden">
          {loading ? (
            Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="space-y-4 p-6">
                  <div className="flex gap-4">
                    <Skeleton className="h-20 w-16 rounded-md" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                </div>
              ))
          ) : paginatedProducts.length > 0 ? (
            paginatedProducts.map((p) => (
              <MobileProductRow key={p.id} product={p} onEdit={handleEdit} />
            ))
          ) : (
            <div className="p-12 text-center text-xs text-zinc-400 italic">
              No pieces found in archive
            </div>
          )}
        </div>
      </div>

      {/* Footer Pagination */}
      <div className="mt-8 flex flex-col items-center justify-between gap-6 sm:flex-row">
        <span className="text-xs font-bold tracking-widest text-zinc-400 uppercase">
          Showing{" "}
          {Math.min(filteredProducts.length, (page - 1) * itemsPerPage + 1)} to{" "}
          {Math.min(filteredProducts.length, page * itemsPerPage)} of{" "}
          {filteredProducts.length.toLocaleString()} results
        </span>
        <div className="flex gap-2">
          <Button
            variant="none"
            size="none"
            disabled={page === 1}
            onClick={() => {
              setPage((p) => p - 1);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 font-bold transition-all hover:bg-zinc-50 disabled:opacity-30"
          >
            <ChevronLeft size={18} />
          </Button>
          {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => (
            <Button
              variant="none"
              size="none"
              key={i}
              onClick={() => {
                setPage(i + 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold transition-all",
                page === i + 1
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-500 hover:bg-zinc-50"
              )}
            >
              {i + 1}
            </Button>
          ))}
          <Button
            variant="none"
            size="none"
            disabled={page === totalPages || totalPages === 0}
            onClick={() => {
              setPage((p) => p + 1);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 font-bold transition-all hover:bg-zinc-50 disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </Button>
        </div>
      </div>

      <React.Suspense fallback={null}>
        <ProductFormPanel
          product={selectedProduct}
          isOpen={isPanelOpen}
          onClose={() => setIsPanelOpen(false)}
          onSuccess={() => fetchProducts({ current: true })}
        />
      </React.Suspense>

      <ConfirmDialog
        isOpen={Boolean(productToDelete)}
        onClose={() => setProductToDelete(null)}
        onConfirm={executeDelete}
        title="Purge Piece from Catalog?"
        description="Are you sure you want to permanently delete this piece? All variants, images, and inventory records will be permanently removed."
        confirmBrand="danger"
        confirmText="Purge Piece"
        cancelText="Cancel"
        isLoading={isDeleting}
      />

      <ConfirmDialog
        isOpen={isBulkConfirmOpen}
        onClose={() => setIsBulkConfirmOpen(false)}
        onConfirm={executeBulkDelete}
        title={`Purge ${selectedIds.length} Pieces from Catalog?`}
        description="Are you sure you want to delete these pieces? Pieces attached to prior customer orders will be archived safely, and remaining pieces will be deleted."
        confirmBrand="danger"
        confirmText={`Delete (${selectedIds.length})`}
        cancelText="Cancel"
        isLoading={isBulkDeleting}
      />

      <BulkActionBar
        selectedCount={selectedIds.length}
        label="Pieces Selected"
        actions={productBulkActions}
        onClear={() => setSelectedIds([])}
        onAction={handleBulkAction}
      />
    </div>
  );
}
