"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import type { Category } from "@/types";
import { adminApi } from "@/lib/api";
import { CategoryTree } from "@/components/admin/CategoryTree";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const fetchCategories = useCallback(
    async (isMounted: { current: boolean }) => {
      try {
        const res = await adminApi.getCategories();
        if (isMounted.current && res.data.success) {
          setCategories(res.data.data as Category[]);
        }
      } catch {
        if (isMounted.current) {
          toast.error("Failed to load category hierarchy.");
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    },
    []
  );

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
      toast.error(
        axiosErr.response?.data?.message || "Failed to save category"
      );
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
      toast.error(
        axiosErr.response?.data?.message || "Failed to delete category"
      );
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-12 flex items-end justify-between">
        <div>
          <span className="mb-2 block text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase">
            Catalog Management
          </span>
          <h2 className="text-5xl leading-none font-extrabold tracking-tighter text-zinc-900">
            Categories
          </h2>
        </div>
        <Button
          variant="primary"
          className="rounded-md px-8 py-3 text-sm font-medium shadow-md transition-transform duration-300 hover:scale-[0.98]"
          onClick={() => setActiveCategory(null)}
        >
          Add Category
        </Button>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
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
          {categories.filter((c) => !c.parentId).length > itemsPerPage && (
            <div className="mt-8 flex flex-col items-center justify-between gap-6 rounded-xl border border-zinc-100 bg-white px-8 py-5 shadow-sm sm:flex-row">
              <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                {Math.min(
                  categories.filter((c) => !c.parentId).length,
                  (page - 1) * itemsPerPage + 1
                )}
                -
                {Math.min(
                  categories.filter((c) => !c.parentId).length,
                  page * itemsPerPage
                )}{" "}
                of {categories.filter((c) => !c.parentId).length} Root
                Collections
              </span>
              <div className="flex gap-2">
                <Button
                  variant="none"
                  size="none"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 font-bold transition-all hover:bg-zinc-50 disabled:opacity-30"
                >
                  <ChevronLeft size={18} />
                </Button>
                {Array.from({
                  length: Math.ceil(
                    categories.filter((c) => !c.parentId).length / itemsPerPage
                  ),
                }).map((_, i) => (
                  <Button
                    variant="none"
                    size="none"
                    key={i}
                    onClick={() => setPage(i + 1)}
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
                  disabled={
                    page ===
                    Math.ceil(
                      categories.filter((c) => !c.parentId).length /
                        itemsPerPage
                    )
                  }
                  onClick={() => setPage((p) => p + 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 font-bold transition-all hover:bg-zinc-50 disabled:opacity-30"
                >
                  <ChevronRight size={18} />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Form */}
        <div className="relative h-full lg:col-span-5">
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
