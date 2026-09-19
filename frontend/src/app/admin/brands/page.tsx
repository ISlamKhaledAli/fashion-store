"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import type { Brand } from "@/types";
import { adminApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { Plus, Edit2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandForm } from "@/components/admin/BrandForm";
import { BrandsTabs } from "@/components/admin/BrandsTabs";
import { BrandLogo } from "@/components/admin/BrandLogo";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "ACTIVE" | "INACTIVE">(
    "ALL"
  );
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const fetchBrands = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getBrands();
      if (res.data.success) {
        setBrands(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch brands");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const stats = useMemo(() => {
    return {
      all: brands.length,
      active: brands.filter((b) => b.status === "ACTIVE").length,
      inactive: brands.filter((b) => b.status === "INACTIVE").length,
    };
  }, [brands]);

  const filteredBrands = useMemo(() => {
    let result = brands;

    // Status Filter
    if (activeTab === "ACTIVE")
      result = result.filter((b) => b.status === "ACTIVE");
    if (activeTab === "INACTIVE")
      result = result.filter((b) => b.status === "INACTIVE");

    // Search Filter
    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(lower) ||
          b.slug.toLowerCase().includes(lower)
      );
    }

    return result;
  }, [brands, searchQuery, activeTab]);

  const paginatedBrands = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredBrands.slice(start, start + itemsPerPage);
  }, [filteredBrands, page]);

  const totalPages = Math.ceil(filteredBrands.length / itemsPerPage);

  const handleBrandSelect = (brand: Brand) => {
    setSelectedBrand(brand);
    setIsAddingMode(false);
  };

  const handleAddNew = () => {
    setSelectedBrand(null);
    setIsAddingMode(true);
  };

  const handleFormSuccess = () => {
    fetchBrands();
    setSelectedBrand(null);
    setIsAddingMode(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="max-w-full overflow-x-hidden p-12 font-inter">
      {/* Header Section */}
      <div className="mb-12 flex items-end justify-between">
        <div>
          <h2 className="flex items-center gap-4 text-[24px] leading-none font-semibold text-on-surface">
            Brands
            {!isLoading && (
              <span className="rounded-sm bg-surface-container px-2 py-0.5 text-sm font-normal text-on-surface-variant">
                {brands.length} Total
              </span>
            )}
          </h2>
          <p className="mt-2 text-sm font-medium text-on-surface-variant italic">
            Manage the designer houses in your maison portfolio.
          </p>
        </div>
        <Button
          onClick={handleAddNew}
          className="flex h-[40px] items-center gap-2 rounded-sm bg-primary px-6 text-sm font-medium text-white"
          icon={<Plus size={18} />}
        >
          Add Brand
        </Button>
      </div>

      <div className="grid grid-cols-12 items-start gap-8">
        {/* Left Panel: Brand List (40%) */}
        <section className="col-span-12 space-y-8 lg:col-span-5">
          <div className="flex flex-col gap-6">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
              <input
                type="text"
                placeholder="Search brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-sm border-none bg-surface-container-low py-2.5 pr-4 pl-10 text-sm transition-all outline-none focus:bg-white focus:ring-1 focus:ring-primary"
              />
            </div>

            <BrandsTabs
              tabs={[
                { id: "ALL", label: "All", count: stats.all },
                { id: "ACTIVE", label: "Published", count: stats.active },
                { id: "INACTIVE", label: "Drafts", count: stats.inactive },
              ]}
              activeTab={activeTab}
              onTabChange={(id) =>
                setActiveTab(id as "ALL" | "ACTIVE" | "INACTIVE")
              }
            />
          </div>

          <div className="min-h-[400px] overflow-hidden rounded-[4px] border border-outline-variant/30 bg-white shadow-sm">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex h-[64px] animate-pulse items-center gap-4 border-b border-surface-container px-4 last:border-none"
                >
                  <div className="h-10 w-10 resize-none rounded-full bg-surface-container" />
                  <div className="flex-grow">
                    <div className="mb-1 h-4 w-1/3 rounded bg-surface-container" />
                    <div className="h-3 w-1/4 rounded bg-surface-container" />
                  </div>
                </div>
              ))
            ) : filteredBrands.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant/50">
                <Search size={48} className="mb-4 stroke-[1]" />
                <p className="text-sm font-medium tracking-widest uppercase">
                  No brands found
                </p>
                <Button variant="ghost" className="mt-4" onClick={handleAddNew}>
                  Create First Brand
                </Button>
              </div>
            ) : (
              paginatedBrands.map((brand) => {
                const isSelected = selectedBrand?.id === brand.id;
                return (
                  <div
                    key={brand.id}
                    onClick={() => handleBrandSelect(brand)}
                    className={cn(
                      "group flex h-[64px] cursor-pointer items-center justify-between border-l-[3px] px-4 transition-all duration-300",
                      isSelected
                        ? "border-primary bg-zinc-50"
                        : "border-transparent hover:bg-zinc-50/50"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <BrandLogo src={brand.logo} name={brand.name} size="md" />
                      <div>
                        <h4 className="text-[16px] leading-tight font-medium text-on-surface">
                          {brand.name}
                        </h4>
                        <p className="mt-0.5 text-[13px] font-medium text-on-surface-variant">
                          {brand._count?.products || 0} Products
                        </p>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "flex items-center gap-2 transition-opacity duration-300",
                        isSelected
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100"
                      )}
                    >
                      <Button
                        variant="icon"
                        size="icon"
                        className="h-9 w-9 text-on-surface-variant hover:bg-stone-200/50 hover:text-on-surface"
                      >
                        <Edit2 size={14} />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination Footer */}
          {filteredBrands.length > itemsPerPage && (
            <div className="flex flex-col items-center justify-between gap-6 border-t border-zinc-100 pt-4 sm:flex-row">
              <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                {Math.min(filteredBrands.length, (page - 1) * itemsPerPage + 1)}
                -{Math.min(filteredBrands.length, page * itemsPerPage)} of{" "}
                {filteredBrands.length}
              </span>
              <div className="flex gap-1.5">
                <Button
                  variant="none"
                  size="none"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 font-bold transition-all hover:bg-zinc-50 disabled:opacity-30"
                >
                  <ChevronLeft size={18} />
                </Button>
                {Array.from({ length: Math.min(3, totalPages) }).map((_, i) => (
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
                  disabled={page === totalPages || totalPages === 0}
                  onClick={() => setPage((p) => p + 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 font-bold transition-all hover:bg-zinc-50 disabled:opacity-30"
                >
                  <ChevronRight size={18} />
                </Button>
              </div>
            </div>
          )}
        </section>

        {/* Right Panel: Edit Form (60%) */}
        <section className="col-span-12 lg:col-span-7">
          <AnimatePresence mode="wait">
            {isAddingMode || selectedBrand ? (
              <motion.div
                key={selectedBrand?.id || "adding"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <BrandForm
                  brand={selectedBrand}
                  onSuccess={handleFormSuccess}
                  onCancel={() => {
                    setSelectedBrand(null);
                    setIsAddingMode(false);
                  }}
                />
              </motion.div>
            ) : (
              <div className="flex min-h-[600px] flex-col items-center justify-center rounded-[4px] border border-dashed border-outline-variant/50 bg-surface-container-lowest p-12 text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-surface-container">
                  <Plus className="text-on-surface-variant/40" size={32} />
                </div>
                <h3 className="mb-2 text-lg font-medium text-on-surface">
                  Editor Suite
                </h3>
                <p className="mx-auto max-w-xs text-sm leading-relaxed text-on-surface-variant">
                  Select a designer maison to manage its credentials or create a
                  new aesthetic identity.
                </p>
                <Button
                  variant="outline"
                  className="mt-8 h-12 px-10"
                  onClick={handleAddNew}
                >
                  Create New Identity
                </Button>
              </div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
}
