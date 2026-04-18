"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Category } from "@/types";
import { adminApi } from "@/lib/api";
import { CategoryTree } from "@/components/admin/CategoryTree";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";


export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const fetchCategories = useCallback(async (isMounted: { current: boolean }) => {
    try {
      const res = await adminApi.getCategories();
      if (isMounted.current && res.data.success) {
        setCategories(res.data.data as Category[]);
      }
    } catch (err) {
      if (isMounted.current) {
        toast.error("Failed to load category hierarchy.");
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const isMounted = { current: true };
    fetchCategories(isMounted);
    return () => {
      isMounted.current = false;
    };
  }, [fetchCategories]);

  const handleSave = async (data: Partial<Category>) => {
    try {
      if (activeCategory) {
        await adminApi.updateCategory(activeCategory.id, data);
        toast.success("Category updated successfully");
      } else {
        await adminApi.createCategory(data);
        toast.success("New category created");
      }
      setActiveCategory(null);
      await fetchCategories({ current: true });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr.response?.data?.message || "Failed to save category");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminApi.deleteCategory(id);
      toast.success("Category permanently deleted");
      setActiveCategory(null);
      await fetchCategories({ current: true });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr.response?.data?.message || "Failed to delete category");
    }
  };

  return (
    <div>
            
            {/* Page Header */}
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold mb-2 block">Catalog Management</span>
                <h2 className="text-5xl font-extrabold text-zinc-900 tracking-tighter leading-none">Categories</h2>
              </div>
              <Button 
                variant="primary" 
                className="px-8 py-3 rounded-md font-medium text-sm hover:scale-[0.98] transition-transform duration-300 shadow-md"
                onClick={() => setActiveCategory(null)}
              >
                Add Category
              </Button>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              
              {/* Left Column: Tree */}
              <div className="lg:col-span-7">
                <CategoryTree 
                  categories={categories}
                  activeCategoryId={activeCategory?.id || null}
                  onEdit={(cat) => setActiveCategory(cat)}
                  isLoading={loading}
                  onAdd={() => setActiveCategory(null)}
                  page={page}
                  itemsPerPage={itemsPerPage}
                />

                {/* Pagination Footer */}
                {categories.filter(c => !c.parentId).length > itemsPerPage && (
                  <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-6 px-8 py-5 bg-white rounded-xl border border-zinc-100 shadow-sm">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      {Math.min(categories.filter(c => !c.parentId).length, (page - 1) * itemsPerPage + 1)}-{Math.min(categories.filter(c => !c.parentId).length, page * itemsPerPage)} of {categories.filter(c => !c.parentId).length} Root Collections
                    </span>
                    <div className="flex gap-2">
                      <Button 
                        variant="none"
                        size="none"
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-zinc-200 hover:bg-zinc-50 disabled:opacity-30 transition-all font-bold"
                      >
                         <ChevronLeft size={18} />
                      </Button>
                      {Array.from({ length: Math.ceil(categories.filter(c => !c.parentId).length / itemsPerPage) }).map((_, i) => (
                         <Button 
                          variant="none"
                          size="none"
                          key={i}
                          onClick={() => setPage(i + 1)}
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
                        disabled={page === Math.ceil(categories.filter(c => !c.parentId).length / itemsPerPage)}
                        onClick={() => setPage(p => p + 1)}
                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-zinc-200 hover:bg-zinc-50 disabled:opacity-30 transition-all font-bold"
                      >
                         <ChevronRight size={18} />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Form */}
              <div className="lg:col-span-5 relative h-full">
                <CategoryForm 
                  activeCategory={activeCategory}
                  allCategories={categories}
                  onSave={handleSave}
                  onCancel={() => setActiveCategory(null)}
                  onDelete={handleDelete}
                />
              </div>

            </div>
    </div>
  );
}
