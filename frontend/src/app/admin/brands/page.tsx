"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Brand } from "@/types";
import { adminApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Search, MoreVertical, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [activeTab, setActiveTab ] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
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
      active: brands.filter(b => b.status === "ACTIVE").length,
      inactive: brands.filter(b => b.status === "INACTIVE").length,
    };
  }, [brands]);

  const filteredBrands = useMemo(() => {
    let result = brands;
    
    // Status Filter
    if (activeTab === "ACTIVE") result = result.filter(b => b.status === "ACTIVE");
    if (activeTab === "INACTIVE") result = result.filter(b => b.status === "INACTIVE");

    // Search Filter
    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      result = result.filter(b => 
        b.name.toLowerCase().includes(lower) || b.slug.toLowerCase().includes(lower)
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
    <div className="p-12 font-inter max-w-full overflow-x-hidden">
      {/* Header Section */}
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-[24px] font-semibold text-on-surface leading-none flex items-center gap-4">
            Brands
            {!isLoading && (
              <span className="text-sm font-normal text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-sm">
                {brands.length} Total
              </span>
            )}
          </h2>
          <p className="text-on-surface-variant mt-2 text-sm italic font-medium">Manage the designer houses in your maison portfolio.</p>
        </div>
        <Button 
          onClick={handleAddNew}
          className="h-[40px] px-6 bg-primary text-white text-sm font-medium rounded-sm flex items-center gap-2"
          icon={<Plus size={18} />}
        >
          Add Brand
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-8 items-start">
        {/* Left Panel: Brand List (40%) */}
        <section className="col-span-12 lg:col-span-5 space-y-8">
          <div className="flex flex-col gap-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-container-low border-none rounded-sm pl-10 pr-4 py-2.5 text-sm focus:ring-1 focus:ring-primary focus:bg-white transition-all outline-none"
              />
            </div>

            <BrandsTabs
              tabs={[
                { id: "ALL", label: "All", count: stats.all },
                { id: "ACTIVE", label: "Published", count: stats.active },
                { id: "INACTIVE", label: "Drafts", count: stats.inactive },
              ]}
              activeTab={activeTab}
              onTabChange={(id) => setActiveTab(id as "ALL" | "ACTIVE" | "INACTIVE")}
            />
          </div>

          <div className="bg-white border border-outline-variant/30 rounded-[4px] overflow-hidden shadow-sm min-h-[400px]">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-[64px] px-4 flex items-center gap-4 border-b border-surface-container last:border-none animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-surface-container resize-none" />
                  <div className="flex-grow">
                    <div className="h-4 bg-surface-container rounded w-1/3 mb-1" />
                    <div className="h-3 bg-surface-container rounded w-1/4" />
                  </div>
                </div>
              ))
            ) : filteredBrands.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-on-surface-variant/50">
                <Search size={48} className="mb-4 stroke-[1]" />
                <p className="text-sm font-medium uppercase tracking-widest">No brands found</p>
                <Button variant="ghost" className="mt-4" onClick={handleAddNew}>Create First Brand</Button>
              </div>
            ) : (
              paginatedBrands.map((brand) => {
                const isSelected = selectedBrand?.id === brand.id;
                return (
                  <div 
                    key={brand.id}
                    onClick={() => handleBrandSelect(brand)}
                    className={cn(
                      "h-[64px] flex items-center justify-between px-4 border-l-[3px] cursor-pointer group transition-all duration-300",
                      isSelected 
                        ? "border-primary bg-zinc-50" 
                        : "border-transparent hover:bg-zinc-50/50"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <BrandLogo 
                        src={brand.logo} 
                        name={brand.name} 
                        size="md" 
                      />
                      <div>
                        <h4 className="text-[16px] font-medium text-on-surface leading-tight">{brand.name}</h4>
                        <p className="text-[13px] text-on-surface-variant font-medium mt-0.5">
                          {brand._count?.products || 0} Products
                        </p>
                      </div>
                    </div>
                    <div className={cn(
                      "flex items-center gap-2 transition-opacity duration-300",
                      isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    )}>
                      <Button 
                        variant="icon" 
                        size="icon"
                        className="w-9 h-9 text-on-surface-variant hover:text-on-surface hover:bg-stone-200/50"
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
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-4 border-t border-zinc-100">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                {Math.min(filteredBrands.length, (page - 1) * itemsPerPage + 1)}-{Math.min(filteredBrands.length, page * itemsPerPage)} of {filteredBrands.length}
              </span>
              <div className="flex gap-1.5">
                <Button 
                  variant="none"
                  size="none"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-zinc-200 hover:bg-zinc-50 disabled:opacity-30 transition-all font-bold"
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
                      "w-10 h-10 flex items-center justify-center rounded-lg text-xs font-bold transition-all",
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
                  onClick={() => setPage(p => p + 1)}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-zinc-200 hover:bg-zinc-50 disabled:opacity-30 transition-all font-bold"
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
            {(isAddingMode || selectedBrand) ? (
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
              <div className="bg-surface-container-lowest border border-dashed border-outline-variant/50 rounded-[4px] min-h-[600px] flex flex-col items-center justify-center p-12 text-center">
                <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mb-6">
                  <Plus className="text-on-surface-variant/40" size={32} />
                </div>
                <h3 className="text-lg font-medium text-on-surface mb-2">Editor Suite</h3>
                <p className="text-on-surface-variant text-sm max-w-xs mx-auto leading-relaxed">
                  Select a designer maison to manage its credentials or create a new aesthetic identity.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-8 px-10 h-12"
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
