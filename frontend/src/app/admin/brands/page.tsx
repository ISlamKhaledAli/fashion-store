"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Search, Plus, Edit2, Trash2, 
  LayoutGrid, List, Image as LucideImage
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Brand } from "@/types";
import { cn } from "@/lib/utils";
import { BrandDrawer } from "@/components/admin/BrandDrawer";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { adminApi } from "@/lib/api";

export default function AdminBrandsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBrands = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getBrands(); // Note: I should ensure getBrands is in adminApi or use brandApi.getAll()
      if (res.data?.success) {
        setBrands(res.data.data as Brand[]);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load brands");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const filteredBrands = useMemo(() => {
    if (!searchQuery) return brands;
    const searchLower = searchQuery.toLowerCase();
    return brands.filter(brand => 
      brand.name.toLowerCase().includes(searchLower) || 
      brand.slug.toLowerCase().includes(searchLower)
    );
  }, [brands, searchQuery]);

  const handleSave = async (data: Partial<Brand>) => {
    try {
      setIsSubmitting(true);
      if (editingBrand) {
        await adminApi.updateBrand(editingBrand.id, data);
        toast.success("Brand updated successfully");
      } else {
        await adminApi.createBrand(data);
        toast.success("Brand created successfully");
      }
      setIsDrawerOpen(false);
      setEditingBrand(null);
      fetchBrands();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save brand");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!brandToDelete) return;
    try {
      setIsSubmitting(true);
      await adminApi.deleteBrand(brandToDelete.id);
      toast.success("Brand removed from archive");
      setIsDeleteDialogOpen(false);
      setBrandToDelete(null);
      fetchBrands();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete brand");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950">Maisons & Brands</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Manage the luxury brands and designer houses in your portfolio.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => { setEditingBrand(null); setIsDrawerOpen(true); }}
            className="rounded-xl px-6 bg-zinc-950 hover:bg-zinc-900 shadow-lg text-sm h-11"
          >
            <Plus size={16} className="mr-2" />
            ADD BRAND
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
            <Input
              placeholder="Search maisons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white border-zinc-200 rounded-xl w-full text-sm h-10 shadow-sm focus:border-zinc-300 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-zinc-100 p-1 rounded-xl shrink-0">
              <button
                onClick={() => setViewMode("table")}
                className={cn("p-1.5 rounded-lg transition-all", viewMode === "table" ? "bg-white shadow-sm text-zinc-950" : "text-zinc-500 hover:text-zinc-900")}
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={cn("p-1.5 rounded-lg transition-all", viewMode === "grid" ? "bg-white shadow-sm text-zinc-950" : "text-zinc-500 hover:text-zinc-900")}
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="w-full overflow-x-auto min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-4">
              <div className="w-8 h-8 border-4 border-zinc-200 border-t-zinc-950 rounded-full animate-spin" />
              <p className="text-sm font-medium">Loading portfolio...</p>
            </div>
          ) : filteredBrands.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-zinc-50 border border-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="h-6 w-6 text-zinc-300" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-950 mb-1">No brands found</h3>
              <p className="text-sm text-zinc-500">{searchQuery ? `Nothing matching "${searchQuery}"` : "Your portfolio is currently empty."}</p>
            </div>
          ) : viewMode === "table" ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 bg-white">
                  <th className="py-4 px-6 text-xs font-bold text-zinc-500 uppercase tracking-wider w-[50%]">Brand Maison</th>
                  <th className="py-4 px-6 text-xs font-bold text-zinc-500 uppercase tracking-wider w-[20%]">Catalog Count</th>
                  <th className="py-4 px-6 text-xs font-bold text-zinc-500 uppercase tracking-wider w-[15%]">Status</th>
                  <th className="py-4 px-6 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right w-[15%]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBrands.map((brand) => (
                  <tr 
                    key={brand.id}
                    onClick={() => { setEditingBrand(brand); setIsDrawerOpen(true); }}
                    className="group border-b border-zinc-100 last:border-none hover:bg-zinc-50 cursor-pointer transition-all duration-300"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl border border-zinc-200 bg-white p-2 flex items-center justify-center overflow-hidden shrink-0 shadow-sm group-hover:border-zinc-300 transition-colors">
                          {brand.logo ? (
                            <img src={brand.logo} alt={brand.name} className="max-w-full max-h-full object-contain" />
                          ) : (
                            <LucideImage size={18} className="text-zinc-300" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-zinc-950 group-hover:text-zinc-900">{brand.name}</p>
                          <p className="text-[10px] text-zinc-400 font-mono mt-0.5 tracking-tight">BRAND_REF_{brand.id.slice(-6).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-zinc-600 font-medium">
                      {(brand as any)._count?.products || 0} <span className="text-zinc-400 font-normal">Products</span>
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={(brand as any).status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE'} />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); setEditingBrand(brand); setIsDrawerOpen(true); }}
                          className="h-8 w-8 p-0 rounded-lg hover:scale-110 active:scale-95 transition-all"
                        >
                          <Edit2 size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); setBrandToDelete(brand); setIsDeleteDialogOpen(true); }}
                          className="h-8 w-8 p-0 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 border-transparent hover:border-red-100 hover:scale-110 active:scale-95 transition-all"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredBrands.map(brand => (
                <div 
                  key={brand.id} 
                  onClick={() => { setEditingBrand(brand); setIsDrawerOpen(true); }} 
                  className="group border border-zinc-200 rounded-[2.5rem] p-8 bg-white hover:shadow-[0_40px_80px_rgba(0,0,0,0.06)] hover:border-zinc-300 hover:-translate-y-2 transition-all duration-700 flex flex-col justify-between cursor-pointer"
                >
                  <div className="space-y-8">
                    <div className="w-full aspect-[3/4] rounded-3xl bg-zinc-50 overflow-hidden border border-zinc-100 relative flex items-center justify-center p-12">
                      {brand.logo ? (
                        <img 
                          src={brand.logo} 
                          alt={brand.name} 
                          className="max-w-full max-h-full object-contain transition-transform duration-1000 group-hover:scale-110" 
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-zinc-300 gap-4">
                          <LucideImage size={48} strokeWidth={1} />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-950 text-xl tracking-tight text-center">{brand.name}</h3>
                      <p className="text-sm text-zinc-400 mt-2 line-clamp-2 text-center italic font-serif leading-relaxed px-4">
                        {(brand as any).description || 'No curated mission statement available for this maison.'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-50">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">{(brand as any)._count?.products || 0} Pieces</span>
                    <StatusBadge status={(brand as any).status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE'} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BrandDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        onSave={handleSave} 
        editingBrand={editingBrand} 
      />
      
      <ConfirmDialog 
        isOpen={isDeleteDialogOpen} 
        onClose={() => setIsDeleteDialogOpen(false)} 
        onConfirm={confirmDelete} 
        isLoading={isSubmitting} 
        title="Remove Brand" 
        description={`Are you sure you want to remove ${brandToDelete?.name}? This will unassign any products currently associated with this maison.`} 
        confirmText="Remove" 
        cancelText="Cancel" 
        confirmBrand="danger" 
      />
    </div>
  );
}
