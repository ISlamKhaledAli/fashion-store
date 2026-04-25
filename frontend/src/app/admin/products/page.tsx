"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Product } from "@/types";
import { productApi, adminApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Checkbox } from "@/components/ui/Checkbox";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { toast } from "sonner";
import { Search, Plus, Edit, Archive, Trash2, Package, ChevronLeft, ChevronRight } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { TableImage } from "@/components/admin/TableImage";
import { AdminTabs, AdminTab } from "@/components/admin/AdminTabs";
import { PriceDisplay } from "@/components/admin/PriceDisplay";

const ProductFormPanel = React.lazy(() => import("@/components/admin/ProductFormPanel").then(module => ({ default: module.ProductFormPanel })));

// Optimized Atomic Components
const ProductRow = React.memo(({ 
  product, 
  onEdit, 
  onArchive, 
  onDelete 
}: { 
  product: Product; 
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
        "group/row hover:bg-zinc-50/50 transition-all cursor-pointer relative border-b border-zinc-50",
        (totalStock === 0 || isLowStock) && "border-l-4 border-l-warning bg-warning/5 border-b-warning/30"
      )}
    >
      <td className="px-8 py-8">
        <div className="flex items-center gap-6">
          <TableImage 
            src={product.images.find(img => img.isMain)?.url || product.images[0]?.url}
            alt={product.name}
            containerClassName="w-16 h-20 rounded-sm shadow-sm group-hover/row:shadow-xl group-hover/row:z-10"
          />
          <div className="space-y-1">
            <p className="text-base font-bold text-zinc-950 tracking-tight group-hover/row:translate-x-1 transition-transform">{product.name}</p>
             <p className="text-[10px] font-bold font-mono text-zinc-400 tracking-widest uppercase">REF: {product.variants[0]?.sku || "N/A"}</p>
          </div>
        </div>
      </td>
      <td className="px-8 py-8">
        <div className="flex flex-col gap-1.5">
          <StatusBadge status="ARCHIVED" className="bg-zinc-50/50 w-fit">
            {product.category?.name || "Uncategorized"}
          </StatusBadge>
          {product.brand && (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-zinc-100 bg-white w-fit shadow-sm">
              <span className="text-[10px] font-bold text-zinc-400">BY</span>
              <span className="text-[10px] font-black uppercase text-zinc-950 tracking-tight">{product.brand.name}</span>
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
      <td className="px-8 py-8 text-right pr-12" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-end items-center gap-1.5 opacity-0 group-hover/row:opacity-100 transition-all translate-x-4 group-hover/row:translate-x-0">
          <Button 
            variant="icon" 
            size="none" 
            onClick={() => onEdit(product)}
            className="hover:bg-zinc-100 transition-all p-2.5 text-zinc-400 hover:text-zinc-950 rounded-full" 
            icon={<Edit size={18} />} 
          />
          <Button 
            variant="icon" 
            size="none" 
            onClick={() => onArchive(product.id, status)}
            className="hover:bg-zinc-100 transition-all p-2.5 text-zinc-400 hover:text-zinc-950 rounded-full" 
            icon={<Archive size={18} />} 
          />
          <Button 
            variant="icon" 
            size="none" 
            onClick={() => onDelete(product.id)}
            className="hover:bg-red-50 transition-all p-2.5 text-zinc-400 hover:text-red-500 rounded-full" 
            icon={<Trash2 size={18} />} 
          />
        </div>
      </td>
    </tr>
  );
});
ProductRow.displayName = "ProductRow";

const MobileProductRow = React.memo(({ 
  product, 
  onEdit 
}: { 
  product: Product; 
  onEdit: (p: Product) => void;
}) => {
  const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);
  const isLowStock = totalStock <= 5 && totalStock > 0;
  const status = product.status || "ACTIVE";

  return (
    <div 
      className={cn(
        "p-6 space-y-4 hover:bg-zinc-50/50 transition-colors cursor-pointer",
        (totalStock === 0 || isLowStock) && "border-l-4 border-l-warning bg-warning/5 border-b border-b-warning/20"
      )}
      onClick={() => onEdit(product)}
    >
      <div className="flex gap-4">
        <TableImage 
          src={product.images.find(img => img.isMain)?.url || product.images[0]?.url}
          alt={product.name}
          containerClassName="w-16 h-20 rounded-sm shadow-sm"
        />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <p className="text-sm font-bold text-zinc-950 truncate">{product.name}</p>
            <PriceDisplay amount={product.price} size="sm" />
          </div>
          <p className="text-[10px] font-bold font-mono text-zinc-400 tracking-widest uppercase mt-1">REF: {product.variants[0]?.sku || "N/A"}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge status="ARCHIVED" className="px-2 py-0.5 text-[9px]">
              {product.category?.name || "Uncategorized"}
            </StatusBadge>
            {product.brand && (
              <span className="px-2 py-0.5 rounded-md border border-zinc-100 bg-white text-[9px] font-bold text-zinc-950 shadow-sm uppercase tracking-tighter">
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
});
MobileProductRow.displayName = "MobileProductRow";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const TABS = ["ALL", "ACTIVE", "DRAFT", "ARCHIVED"];

export default function AdminProductsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const fetchProducts = async (isMounted: { current: boolean }) => {
    setLoading(true);
    try {
      const res = await adminApi.getProducts({ limit: 100, status: 'all' });
      if (isMounted.current && res.data.success) {
        setProducts(res.data.data as Product[]);
      }
    } catch (err) {
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
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.variants.some(v => v.sku?.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesTab = activeTab === "ALL" || p.status === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [products, searchQuery, activeTab]);

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, page]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const tabList: AdminTab[] = useMemo(() => [
    { id: "ALL",      label: "All",      count: products.length },
    { id: "ACTIVE",   label: "Active",   count: products.filter(p => p.status === "ACTIVE").length },
    { id: "DRAFT",    label: "Draft",    count: products.filter(p => p.status === "DRAFT").length },
    { id: "ARCHIVED", label: "Archived", count: products.filter(p => p.status === "ARCHIVED").length },
  ], [products]);

  const handleEdit = React.useCallback((product: Product) => {
    setSelectedProduct(product);
    setIsPanelOpen(true);
  }, []);

  const handleArchive = React.useCallback(async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "ARCHIVED" ? "ACTIVE" : "ARCHIVED";
    try {
      await adminApi.updateProduct(id, { status: newStatus });
      toast.success(`Entry ${newStatus.toLowerCase()}ized`);
      const isMounted = { current: true };
      fetchProducts(isMounted);
    } catch (err) {
      toast.error("Protocol error. Status locked.");
    }
  }, []);

  const handleDelete = React.useCallback(async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this piece? This action cannot be undone.")) return;
    try {
      await adminApi.deleteProduct(id);
      toast.success("Piece purged from archives");
      const isMounted = { current: true };
      fetchProducts(isMounted);
    } catch (err) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const errorMsg = axiosErr.response?.data?.message || "Critical failure. Data persists.";
      toast.error(errorMsg);
    }
  }, []);


  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Page Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-4 sm:gap-6 lg:gap-8">
        <div className="space-y-2">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-950">Products</h2>
          <div className="flex items-center gap-4">
             <Badge variant="surface" className="px-3 py-1 font-black">Archive Feed</Badge>
             <div className="h-4 w-[1px] bg-zinc-200" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
               {products.length} Items Indexed
             </span>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">

          <Button 
            variant="primary" 
            size="sm"
            onClick={handleCreate}
            className="rounded-lg bg-zinc-900 text-white hover:opacity-90 font-medium px-6 shadow-md transition-all flex items-center gap-2 flex-1 sm:flex-none"
            icon={<Plus size={16} />}
          >
            Manifest New Item
          </Button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
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
            className="bg-zinc-50/50 border-zinc-100 rounded-lg py-3 focus:bg-white transition-all shadow-inner"
            icon={<Search />}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-zinc-100 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="bg-zinc-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 border-b border-zinc-100">
              <tr>
                <th className="px-8 py-5">Piece Specification</th>
                <th className="px-8 py-5">Classification</th>
                <th className="px-8 py-5 text-right">Price</th>
                <th className="px-8 py-5">Stance</th>
                <th className="px-8 py-5 text-right pr-12">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {loading ? (
                Array(6).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td className="px-8 py-8 flex items-center gap-6">
                      <Skeleton className="w-16 h-20 rounded-md" />
                      <div className="space-y-3">
                         <Skeleton className="h-5 w-48" />
                         <Skeleton className="h-3 w-24 px-10" />
                      </div>
                    </td>
                    <td className="px-8 py-8"><Skeleton className="h-6 w-32 rounded-full" /></td>
                    <td className="px-8 py-8"><Skeleton className="h-5 w-16 ml-auto" /></td>
                    <td className="px-8 py-8"><Skeleton className="h-6 w-24 rounded-full" /></td>
                    <td className="px-8 py-8"><Skeleton className="h-5 w-12 ml-auto" /></td>
                  </tr>
                ))
              ) : paginatedProducts.length > 0 ? (
                paginatedProducts.map((p) => (
                  <ProductRow 
                    key={p.id}
                    product={p}
                    onEdit={handleEdit}
                    onArchive={handleArchive}
                    onDelete={handleDelete}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-44 text-center">
                    <div className="flex flex-col items-center gap-6 max-w-sm mx-auto">
                      <div className="p-8 bg-zinc-50 rounded-full shadow-inner">
                        <Package size={64} strokeWidth={1} className="text-zinc-200" />
                      </div>
                      <div className="space-y-2">
                         <h3 className="text-xl font-bold text-zinc-950 tracking-tight">Void detected in archive</h3>
                        <p className="text-[11px] text-zinc-400 leading-relaxed font-bold uppercase tracking-widest px-8">The editorial collection currently holds no entries for this manifestation.</p>
                      </div>
                      <Button 
                        variant="primary" 
                        onClick={handleCreate}
                        className="mt-6 rounded-lg bg-zinc-950 text-[10px] font-black uppercase tracking-[0.3em] px-12 py-4 shadow-2xl"
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
        <div className="md:hidden divide-y divide-zinc-50">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="p-6 space-y-4">
                <div className="flex gap-4">
                  <Skeleton className="w-16 h-20 rounded-md" />
                  <div className="space-y-2 flex-1">
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
              <MobileProductRow 
                key={p.id}
                product={p}
                onEdit={handleEdit}
              />
            ))
          ) : (
            <div className="p-12 text-center text-zinc-400 text-xs italic">
              No pieces found in archive
            </div>
          )}
        </div>
      </div>

      {/* Footer Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mt-8">
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
          Showing {Math.min(filteredProducts.length, (page - 1) * itemsPerPage + 1)} to {Math.min(filteredProducts.length, page * itemsPerPage)} of {filteredProducts.length.toLocaleString()} results
        </span>
        <div className="flex gap-2">
          <Button 
            variant="none"
            size="none"
            disabled={page === 1}
            onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-zinc-200 hover:bg-zinc-50 disabled:opacity-30 transition-all font-bold"
          >
            <ChevronLeft size={18} />
          </Button>
          {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => (
            <Button 
              variant="none"
              size="none"
              key={i}
              onClick={() => { setPage(i + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className={cn(
                "w-10 h-10 flex items-center justify-center rounded-lg font-bold text-xs transition-all",
                page === i + 1 ? "bg-zinc-900 text-white" : "text-zinc-500 hover:bg-zinc-50"
              )}
            >
              {i + 1}
            </Button>
          ))}
          <Button 
            variant="none"
            size="none"
            disabled={page === totalPages || totalPages === 0}
            onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-zinc-200 hover:bg-zinc-50 disabled:opacity-30 transition-all font-bold"
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
    </div>
  );
}
