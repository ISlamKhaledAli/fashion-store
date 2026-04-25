"use client";

import React, { useReducer, useEffect, useState, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/shop/ProductCard";
import { FilterSidebar, FilterState, FilterAction } from "@/components/shop/FilterSidebar";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { ActiveFilters } from "@/components/shop/ActiveFilters";
import { Button } from "@/components/ui/Button";
import { ProductSkeleton } from "@/components/shop/ProductSkeleton";
import { productApi } from "@/lib/api";
import { Product } from "@/types";
import { cn } from "@/lib/utils";
import { SlidersHorizontal, PackageX, MoveRight } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { motion } from "framer-motion";

const SORT_OPTIONS = [
  { label: "Newest Arrivals", value: "createdAt:desc" },
  { label: "Price Low-High", value: "price:asc" },
  { label: "Price High-Low", value: "price:desc" },
];

const initialState: FilterState = {
  category: [],
  brand: [],
  size: [],
  color: [],
  minPrice: 0,
  maxPrice: 2000,
  sort: "createdAt:desc",
};

// Removed redundant local Action type to use imported FilterAction

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isMoreLoading, setIsMoreLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const state: FilterState = React.useMemo(() => ({
    category: searchParams.get("category") ? searchParams.get("category")!.split(",") : [],
    brand: searchParams.get("brand") ? searchParams.get("brand")!.split(",") : [],
    color: searchParams.get("color") ? searchParams.get("color")!.split(",") : [],
    minPrice: 0,
    maxPrice: parseInt(searchParams.get("maxPrice") || "2000"),
    sort: searchParams.get("sort") || "createdAt:desc",
    size: []
  }), [searchParams]);

  const dispatch = useCallback((action: FilterAction) => {
    const params = new URLSearchParams(searchParams.toString());
    const currentCategory = params.get("category") ? params.get("category")!.split(",") : [];
    const currentBrand = params.get("brand") ? params.get("brand")!.split(",") : [];
    const currentColor = params.get("color") ? params.get("color")!.split(",") : [];

    switch (action.type) {
      case "toggle_category": {
        const newCat = currentCategory.includes(action.payload)
          ? currentCategory.filter(c => c !== action.payload)
          : [...currentCategory, action.payload];
        if (newCat.length) params.set("category", newCat.join(","));
        else params.delete("category");
        break;
      }
      case "toggle_brand": {
        const newBrand = currentBrand.includes(action.payload)
          ? currentBrand.filter(b => b !== action.payload)
          : [...currentBrand, action.payload];
        if (newBrand.length) params.set("brand", newBrand.join(","));
        else params.delete("brand");
        break;
      }
      case "toggle_color": {
        const payload = action.payload.toLowerCase().trim();
        const newColor = currentColor.includes(payload)
          ? currentColor.filter(c => c !== payload)
          : [...currentColor, payload];
        if (newColor.length) params.set("color", newColor.join(","));
        else params.delete("color");
        break;
      }
      case "set_max_price":
        params.set("maxPrice", action.payload.toString());
        break;
      case "set_sort":
        params.set("sort", action.payload);
        break;
      case "reset":
        params.delete("category");
        params.delete("brand");
        params.delete("color");
        params.delete("maxPrice");
        params.delete("sort");
        break;
      case "sync_from_url":
        break;
    }
    params.delete("page");
    setPage(1);
    router.push(`/search?${params.toString()}`);
  }, [searchParams, router]);

  const fetchProducts = useCallback(async (paramsToFetch: Record<string, unknown>, isLoadMore = false) => {
    if (isLoadMore) setIsMoreLoading(true);
    else setIsLoading(true);

    try {
      const res = await productApi.getAll(paramsToFetch);
      if (res.data.success) {
        if (isLoadMore) {
          setProducts((prev) => [...prev, ...res.data.data as Product[]]);
        } else {
          setProducts(res.data.data as Product[]);
          setTotalCount(res.data.pagination?.total || 0);
        }
      }
    } catch (error) {
      console.error("Search fetch error:", error);
    } finally {
      if (isLoadMore) setIsMoreLoading(false);
      else setTimeout(() => setIsLoading(false), 400);
    }
  }, []);

  // ONE effect that fetches when URL changes
  useEffect(() => {
    fetchProducts({
      search: query,
      category: state.category.join(","),
      brand: state.brand.join(","),
      color: state.color.join(","),
      maxPrice: state.maxPrice,
      sort: state.sort,
      page: 1,
      limit: 6,
    }, false);
  }, [query, state.category, state.brand, state.color, state.maxPrice, state.sort, fetchProducts]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts({
      search: query,
      category: state.category.join(","),
      brand: state.brand.join(","),
      color: state.color.join(","),
      maxPrice: state.maxPrice,
      sort: state.sort,
      page: nextPage,
      limit: 6,
    }, true);
  };

  return (
    <div className={cn("flex flex-col lg:flex-row min-h-screen bg-surface")}>
      <FilterSidebar state={state} dispatch={dispatch} />
      <FilterSidebar 
        state={state} 
        dispatch={dispatch} 
        isMobile 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      <section className={cn("flex-1 p-8 lg:p-16")}>
        <header className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-4 block">
              Search Results
            </span>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <h1 className="text-4xl md:text-6xl font-medium tracking-tighter text-on-surface leading-tight">
                Results for &ldquo;<span className="italic font-light italic-font">{query}</span>&rdquo; 
                <span className="text-on-surface-variant font-light ml-4">
                  — {isLoading ? "..." : totalCount} products
                </span>
              </h1>
              
              <div className="flex items-center gap-6">
                <Select 
                  labelPrefix="Sort:"
                  options={SORT_OPTIONS}
                  value={state.sort}
                  onChange={(val) => dispatch({ type: "set_sort", payload: val })}
                />
                <div className="flex items-center gap-3 border-l border-outline-variant/20 pl-6 lg:hidden">
                    <Button 
                        variant="icon" 
                        size="icon" 
                        onClick={() => setIsSidebarOpen(true)}
                        className="text-on-surface hover:text-primary"
                    >
                        <SlidersHorizontal size={20} strokeWidth={1.5} />
                    </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </header>

        <ActiveFilters state={state} dispatch={dispatch} />

        <div className="mt-8">
          {isLoading ? (
            <ProductGrid isLoading={true} viewMode={viewMode}>
              {Array(6).fill(0).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </ProductGrid>
          ) : products.length > 0 ? (
            <ProductGrid isLoading={false} viewMode={viewMode}>
              {products.map((product, index) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  variant="editorial"
                  delay={index * 0.05}
                />
              ))}
            </ProductGrid>
          ) : (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-32 flex flex-col items-center text-center max-w-md mx-auto"
            >
                <div className="w-24 h-24 bg-surface-container rounded-full flex items-center justify-center mb-8">
                    <PackageX size={40} className="text-on-surface-variant/40" strokeWidth={1} />
                </div>
                <h2 className="text-2xl font-medium tracking-tight mb-4 text-on-surface">No pieces found</h2>
                <p className="text-on-surface-variant text-sm leading-relaxed mb-8">
                    We couldn&apos;t find any products matching Your search for &ldquo;{query}&rdquo;. 
                    Try adjusting your filters or searching for something else.
                </p>
                <div className="flex flex-col gap-3 w-full">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Suggestions</h3>
                    {['Minimalist', 'Denim', 'Archives', 'Ceramics'].map((suggestion) => (
                        <Button
                            key={suggestion}
                            variant="none"
                            size="none"
                            onClick={() => router.push(`/search?q=${suggestion}`)}
                            className="flex items-center justify-between p-4 bg-surface-container-low hover:bg-surface-container transition-colors rounded-lg group w-full"
                        >
                            <span className="text-sm">{suggestion}</span>
                            <MoveRight size={16} className="text-outline-variant group-hover:text-primary transition-colors" />
                        </Button>
                    ))}
                </div>
            </motion.div>
          )}
        </div>

        {!isLoading && products.length > 0 && products.length < totalCount && (
          <div className="mt-24 flex flex-col items-center gap-6">
            <p className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
                Displaying {products.length} of {totalCount} products
            </p>
            <div className="w-64 h-[1px] bg-outline-variant/30 relative overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(products.length / totalCount) * 100}%` }}
                    className="absolute inset-y-0 left-0 bg-primary"
                    transition={{ duration: 0.8, ease: "circOut" }}
                />
            </div>
            <Button 
                variant="primary" 
                className="mt-4 px-12 h-14 uppercase tracking-widest font-bold text-xs"
                onClick={handleLoadMore}
                isLoading={isMoreLoading}
            >
                Load More Results
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-surface flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>}>
      <SearchContent />
    </Suspense>
  );
}
