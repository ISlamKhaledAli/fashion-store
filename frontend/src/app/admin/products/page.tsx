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
import { Search, Plus, Edit, Archive, Trash2, Package } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";

const ProductFormPanel = React.lazy(() => import("@/components/admin/ProductFormPanel").then(module => ({ default: module.ProductFormPanel })));

// Optimized Atomic Components
const ProductRow = React.memo(({ 
  product, 
  isSelected, 
  onToggle, 
  onEdit, 
  onArchive, 
  onDelete 
}: { 
  product: Product; 
  isSelected: boolean; 
  onToggle: (id: string) => void; 
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
      <td className="px-8 py-8" onClick={(e) => e.stopPropagation()}>
        <Checkbox 
          checked={isSelected} 
          onCheckedChange={() => onToggle(product.id)}
        />
      </td>
      <td className="px-8 py-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-20 bg-zinc-100 rounded-sm overflow-hidden flex-shrink-0 shadow-sm transition-all group-hover/row:scale-[1.05] group-hover/row:shadow-xl group-hover/row:z-10">
             <img 
              src={product.images.find(img => img.isMain)?.url || product.images[0]?.url || ""} 
              className="w-full h-full object-cover transition-transform duration-700"
              alt={product.name}
            />
          </div>
          <div className="space-y-1">
            <p className="text-base font-bold text-zinc-950 tracking-tight group-hover/row:translate-x-1 transition-transform">{product.name}</p>
             <p className="text-[10px] font-bold font-mono text-zinc-400 tracking-widest uppercase">REF: {product.variants[0]?.sku || "N/A"}</p>
          </div>
        </div>
      </td>
      <td className="px-8 py-8">
        <StatusBadge status="ARCHIVED" className="bg-zinc-50/50">
          {product.category?.name || "Uncategorized"}
        </StatusBadge>
      </td>
      <td className="px-8 py-8 text-right">
        <p className="text-base font-black text-zinc-950 tracking-tighter tabular-nums">{formatCurrency(product.price)}</p>
      </td>
      <td className="px-8 py-8 text-center">
        {totalStock === 0 ? (
          <StatusBadge status="OUT_OF_STOCK" />
        ) : isLowStock ? (
          <StatusBadge status="DEPLETING" className="text-sm font-medium tracking-wide">
            {totalStock.toString().padStart(2, '0')} UNITS
          </StatusBadge>
        ) : (
          <StatusBadge status="ACTIVE" className="bg-zinc-50 border-zinc-100 text-zinc-950 text-sm font-medium tracking-wide">
            {totalStock.toString().padStart(2, '0')} UNITS
          </StatusBadge>
        )}
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
        <div className="w-16 h-20 bg-zinc-100 rounded-sm overflow-hidden flex-shrink-0 shadow-sm">
          <img 
            src={product.images.find(img => img.isMain)?.url || product.images[0]?.url || ""} 
            className="w-full h-full object-cover"
            alt={product.name}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <p className="text-sm font-bold text-zinc-950 truncate">{product.name}</p>
            <p className="text-sm font-black text-zinc-950 tabular-nums">{formatCurrency(product.price)}</p>
          </div>
          <p className="text-[10px] font-bold font-mono text-zinc-400 tracking-widest uppercase mt-1">REF: {product.variants[0]?.sku || "N/A"}</p>
          <div className="mt-2 flex items-center gap-2">
            <StatusBadge status="ARCHIVED" className="px-2 py-0.5 text-[9px]">
              {product.category?.name || "Uncategorized"}
            </StatusBadge>
            <StatusBadge status={status} className="px-2 py-0.5 text-[9px]" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-zinc-50 pt-4">
        <div className="flex items-center gap-1">
          {totalStock === 0 ? (
            <StatusBadge status="OUT_OF_STOCK" className="px-2 py-1 text-[10px] font-medium" />
          ) : isLowStock ? (
            <StatusBadge status="DEPLETING" className="px-2 py-1 text-[10px] font-medium">
               {totalStock} UNITS
            </StatusBadge>
          ) : (
            <StatusBadge status="ACTIVE" className="px-2 py-1 text-[10px] font-medium bg-zinc-50 text-zinc-950">
              {totalStock} UNITS
            </StatusBadge>
          )}
        </div>
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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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

  useEffect(() => {
    const isMounted = { current: true };
    
    fetchProducts(isMounted);
    
    if (searchParams.get("open") === "true") {
      handleCreate();
    }

    return () => {
      isMounted.current = false;
    };
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.variants.some(v => v.sku?.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesTab = activeTab === "ALL" || p.status === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [products, searchQuery, activeTab]);

  const handleEdit = React.useCallback((product: Product) => {
    setSelectedProduct(product);
    setIsPanelOpen(true);
  }, []);

  const handleCreate = React.useCallback(() => {
    setSelectedProduct(null);
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
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Critical failure. Data persists.";
      toast.error(errorMsg);
    }
  }, []);

  const toggleAll = React.useCallback(() => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map(p => p.id));
    }
  }, [selectedIds, filteredProducts]);

  const toggleOne = React.useCallback((id: string) => {
    setSelectedIds((prev) => 
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
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
      <div className="flex flex-col lg:flex-row justify-between items-center gap-8 border-b border-zinc-100 pb-4">
        <div className="flex gap-x-12 w-full lg:w-auto overflow-x-auto no-scrollbar scroll-smooth">
          {TABS.map((tab) => (
            <Button
              key={tab}
              variant="none"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "pb-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative whitespace-nowrap group",
                activeTab === tab ? "text-zinc-950" : "text-zinc-400 hover:text-zinc-600"
              )}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-950" />
              )}
              <div className={cn(
                "absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-200 scale-x-0 group-hover:scale-x-100 transition-transform origin-left",
                activeTab === tab && "hidden"
              )} />
            </Button>
          ))}
        </div>
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
                <th className="px-8 py-5 w-20">
                  <Checkbox 
                    checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0} 
                    onCheckedChange={toggleAll}
                  />
                </th>
                <th className="px-8 py-5">Piece Specification</th>
                <th className="px-8 py-5">Classification</th>
                <th className="px-8 py-5 text-right">Value</th>
                <th className="px-8 py-5 text-center">Availability</th>
                <th className="px-8 py-5">Stance</th>
                <th className="px-8 py-5 text-right pr-12">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {loading ? (
                Array(6).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td className="px-8 py-8"><Skeleton className="h-5 w-5 rounded-md" /></td>
                    <td className="px-8 py-8 flex items-center gap-6">
                      <Skeleton className="w-16 h-20 rounded-md" />
                      <div className="space-y-3">
                         <Skeleton className="h-5 w-48" />
                         <Skeleton className="h-3 w-24 px-10" />
                      </div>
                    </td>
                    <td className="px-8 py-8"><Skeleton className="h-6 w-32 rounded-full" /></td>
                    <td className="px-8 py-8"><Skeleton className="h-5 w-16 ml-auto" /></td>
                    <td className="px-8 py-8"><Skeleton className="h-5 w-16 mx-auto" /></td>
                    <td className="px-8 py-8"><Skeleton className="h-6 w-24 rounded-full" /></td>
                    <td className="px-8 py-8"><Skeleton className="h-5 w-12 ml-auto" /></td>
                  </tr>
                ))
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((p) => (
                  <ProductRow 
                    key={p.id}
                    product={p}
                    isSelected={selectedIds.includes(p.id)}
                    onToggle={toggleOne}
                    onEdit={handleEdit}
                    onArchive={handleArchive}
                    onDelete={handleDelete}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-8 py-44 text-center">
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
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((p) => (
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
