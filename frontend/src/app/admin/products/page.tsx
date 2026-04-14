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
import { 
  Search, 
  Plus, 
  Filter, 
  Edit, 
  Archive, 
  Trash2,
  Package,
  AlertTriangle,
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { ProductFormPanel } from "@/components/admin/ProductFormPanel";
import { toast } from "sonner";

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
      const res = await productApi.getAll({ limit: 100 });
      if (isMounted.current && res.data.success) {
        setProducts(res.data.data);
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
      const matchesTab = activeTab === "ALL" || (p as any).status === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [products, searchQuery, activeTab]);

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsPanelOpen(true);
  };

  const handleCreate = () => {
    setSelectedProduct(null);
    setIsPanelOpen(true);
  };

  const handleArchive = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "ARCHIVED" ? "ACTIVE" : "ARCHIVED";
    try {
      await adminApi.updateProduct(id, { status: newStatus });
      toast.success(`Entry ${newStatus.toLowerCase()}ized`);
      // Note: We don't strictly need cancellation logic for these fire-and-forget actions,
      // but fetchProducts will handle it when called.
      const isMounted = { current: true };
      fetchProducts(isMounted);
    } catch (err) {
      toast.error("Protocol error. Status locked.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this piece?")) return;
    try {
      await adminApi.deleteProduct(id);
      toast.success("Piece purged from archives");
      const isMounted = { current: true };
      fetchProducts(isMounted);
    } catch (err) {
      toast.error("Critical failure. Data persists.");
    }
  };

  const toggleAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map(p => p.id));
    }
  };

  const toggleOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Page Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8">
        <div className="space-y-2">
          <h2 className="text-5xl font-bold tracking-tight text-zinc-950">Products</h2>
          <div className="flex items-center gap-4">
             <Badge variant="surface" className="px-3 py-1 font-black">Archive Feed</Badge>
             <div className="h-4 w-[1px] bg-zinc-200" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
               {products.length} Items Indexed
             </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            className="rounded-lg border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-100 font-medium shadow-sm transition-all"
            icon={<Filter size={16} />}
          >
            Filters
          </Button>
          <Button 
            variant="primary" 
            size="sm"
            onClick={handleCreate}
            className="rounded-lg bg-zinc-900 text-white hover:opacity-90 font-medium px-6 shadow-md transition-all flex items-center gap-2"
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
            <button
              key={tab}
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
            </button>
          ))}
        </div>
        <div className="w-full lg:w-[400px]">
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
      <div className="bg-white rounded-xl border border-zinc-100 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.01)] group/table">
        <table className="w-full text-left border-collapse">
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
              filteredProducts.map((p) => {
                const totalStock = p.variants.reduce((acc, v) => acc + v.stock, 0);
                const isLowStock = totalStock <= 5 && totalStock > 0;
                const status = (p as any).status || "ACTIVE";
                
                return (
                  <tr 
                    key={p.id} 
                    onClick={() => handleEdit(p)}
                    className={cn(
                      "group/row hover:bg-zinc-50/50 transition-all cursor-pointer relative",
                      isLowStock && "border-l-4 border-amber-500"
                    )}
                  >
                    <td className="px-8 py-8" onClick={(e) => e.stopPropagation()}>
                      <Checkbox 
                        checked={selectedIds.includes(p.id)} 
                        onCheckedChange={() => toggleOne(p.id)}
                      />
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-20 bg-zinc-100 rounded-sm overflow-hidden flex-shrink-0 shadow-sm transition-all group-hover/row:scale-[1.05] group-hover/row:shadow-xl group-hover/row:z-10">
                           <img 
                            src={p.images.find(img => img.isMain)?.url || p.images[0]?.url || ""} 
                            className="w-full h-full object-cover transition-transform duration-700"
                            alt={p.name}
                          />
                        </div>
                        <div className="space-y-1">
                          <p className="text-base font-bold text-zinc-950 tracking-tight group-hover/row:translate-x-1 transition-transform">{p.name}</p>
                           <p className="text-[10px] font-bold font-mono text-zinc-400 tracking-widest uppercase">REF: {p.variants[0]?.sku || "N/A"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <Badge variant="surface" className="px-3 py-1 font-bold lowercase tracking-normal">
                        {p.category?.name || "Uncategorized"}
                      </Badge>
                    </td>
                    <td className="px-8 py-8 text-right">
                      <p className="text-base font-black text-zinc-950 tracking-tighter tabular-nums">{formatCurrency(p.price)}</p>
                    </td>
                    <td className="px-8 py-8 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <span className={cn(
                          "text-[10px] font-black tabular-nums tracking-[0.2em] px-3 py-1 rounded-full border shadow-sm transition-all",
                          totalStock === 0 ? "bg-red-50 text-red-600 border-red-100" : 
                          isLowStock ? "bg-amber-50 text-amber-600 border-amber-100 scale-110 shadow-amber-900/5" : 
                          "bg-zinc-50 text-zinc-950 border-zinc-100"
                        )}>
                          {totalStock.toString().padStart(2, '0')} UNITS
                        </span>
                        {isLowStock && (
                          <span className="flex items-center gap-1.5 text-[8px] font-black uppercase text-amber-600 tracking-widest animate-pulse">
                            <AlertTriangle size={10} /> Depleted
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <Badge 
                        variant={status === 'ACTIVE' ? "primary" : status === 'ARCHIVED' ? "error" : "surface"}
                        className="px-3 py-1 font-black"
                      >
                        {status}
                      </Badge>
                    </td>
                    <td className="px-8 py-8 text-right pr-12" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end items-center gap-1.5 opacity-0 group-hover/row:opacity-100 transition-all translate-x-4 group-hover/row:translate-x-0">
                        <Button 
                          variant="icon" 
                          size="none" 
                          onClick={() => handleEdit(p)}
                          className="hover:bg-zinc-100 transition-all p-2.5 text-zinc-400 hover:text-zinc-950 rounded-full" 
                          icon={<Edit size={18} />} 
                        />
                        <Button 
                          variant="icon" 
                          size="none" 
                          onClick={() => handleArchive(p.id, status)}
                          className="hover:bg-zinc-100 transition-all p-2.5 text-zinc-400 hover:text-zinc-950 rounded-full" 
                          icon={<Archive size={18} />} 
                        />
                        <Button 
                          variant="icon" 
                          size="none" 
                          onClick={() => handleDelete(p.id)}
                          className="hover:bg-red-50 transition-all p-2.5 text-zinc-400 hover:text-red-500 rounded-full" 
                          icon={<Trash2 size={18} />} 
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
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

      <ProductFormPanel 
        product={selectedProduct}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onSuccess={() => fetchProducts({ current: true })}
      />
    </div>
  );
}
