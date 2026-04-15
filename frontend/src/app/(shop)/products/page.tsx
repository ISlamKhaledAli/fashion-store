"use client";

import React, { useReducer, useEffect, useState, Suspense, useMemo, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import { ProductCard } from "@/components/shop/ProductCard";
import { FilterSidebar, FilterState } from "@/components/shop/FilterSidebar";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { ActiveFilters } from "@/components/shop/ActiveFilters";
import { Button } from "@/components/ui/Button";
import { ProductSkeleton } from "@/components/shop/ProductSkeleton";
import { productApi } from "@/lib/api";
import { Product } from "@/types";
import { cn } from "@/lib/utils";
import { Filter, LayoutGrid, List, Loader2 } from "lucide-react";
import { Select } from "@/components/ui/Select";

const SORT_OPTIONS = [
  { label: "Newest Arrivals", value: "createdAt:desc" },
  { label: "Price Low-High", value: "price:asc" },
  { label: "Price High-Low", value: "price:desc" },
  { label: "Oldest First", value: "createdAt:asc" },
];

type Action =
  | { type: "toggle_category"; payload: string }
  | { type: "toggle_brand"; payload: string }
  | { type: "toggle_color"; payload: string }
  | { type: "set_max_price"; payload: number }
  | { type: "set_sort"; payload: string }
  | { type: "reset" }
  | { type: "sync_from_url"; payload: Partial<FilterState> };

const initialState: FilterState = {
  category: [],
  brand: [],
  size: [],
  color: [],
  minPrice: 0,
  maxPrice: 2000,
  sort: "createdAt:desc",
};

function filterReducer(state: FilterState, action: Action): FilterState {
  switch (action.type) {
    case "toggle_category": {
      const category = state.category.includes(action.payload)
        ? state.category.filter((c) => c !== action.payload)
        : [...state.category, action.payload];
      return { ...state, category };
    }
    case "toggle_brand": {
      const brand = state.brand.includes(action.payload)
        ? state.brand.filter((b) => b !== action.payload)
        : [...state.brand, action.payload];
      return { ...state, brand };
    }
    case "toggle_color": {
      const color = state.color.includes(action.payload)
        ? state.color.filter((c) => c !== action.payload)
        : [...state.color, action.payload];
      return { ...state, color };
    }
    case "set_max_price":
      if (state.maxPrice === action.payload) return state;
      return { ...state, maxPrice: action.payload };
    case "set_sort":
      if (state.sort === action.payload) return state;
      return { ...state, sort: action.payload };
    case "reset":
      return initialState;
    case "sync_from_url": {
      const isDifferent = JSON.stringify(state) !== JSON.stringify({ ...state, ...action.payload });
      return isDifferent ? { ...state, ...action.payload } : state;
    }
    default:
      return state;
  }
}

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, dispatch] = useReducer(filterReducer, initialState);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const isInitialMount = React.useRef(true);
  const observer = useRef<IntersectionObserver | null>(null);

  const lastItemRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading || isFetchingMore) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && page < totalPages) {
        setPage(prevPage => prevPage + 1);
      }
    });

    if (node) observer.current.observe(node);
  }, [isLoading, isFetchingMore, page, totalPages]);

  // ... (maintain useEffects logic)
  // Memoize stable filters to prevent unnecessary re-renders
  const stableFilters = useMemo(() => ({
    category: state.category,
    brand: state.brand,
    color: state.color,
    maxPrice: state.maxPrice,
    sort: state.sort
  }), [state.category, state.brand, state.color, state.maxPrice, state.sort]);

  const debouncedFilters = useDebounce(stableFilters, 300);

  // Reset products and page when filters change
  useEffect(() => {
    if (!isInitialMount.current) {
      setPage(1);
      setProducts([]);
    }
  }, [debouncedFilters]);

  // Sync state FROM URL ONLY on mount or when back/forward navigation occurs
  useEffect(() => {
    const params: Partial<FilterState> = {};
    const cat = searchParams.get("category");
    if (cat) params.category = cat.split(",");
    const brand = searchParams.get("brand");
    if (brand) params.brand = brand.split(",");
    const color = searchParams.get("color");
    if (color) params.color = color.split(",");
    const max = searchParams.get("maxPrice");
    if (max) params.maxPrice = parseInt(max);
    const sort = searchParams.get("sort");
    if (sort) params.sort = sort;

    // Only dispatch if values have actually changed from URL
    dispatch({ type: "sync_from_url", payload: params });
  }, [searchParams]);

  // Main fetch effect - driven by debounced state and page
  useEffect(() => {
    const fetchProducts = async () => {
      if (page === 1) setIsLoading(true);
      else setIsFetchingMore(true);
      
      try {
        const res = await productApi.getAll({
          category: debouncedFilters.category.join(","),
          brand: debouncedFilters.brand.join(","),
          color: debouncedFilters.color.join(","),
          maxPrice: debouncedFilters.maxPrice,
          sort: debouncedFilters.sort,
          limit: 12,
          page,
        });

        if (res.data.success) {
          if (page === 1) {
            setProducts(res.data.data);
          } else {
            setProducts(prev => [...prev, ...res.data.data]);
          }
          setTotalPages(res.data.pagination?.totalPages || 1);
          setTotalProducts(res.data.pagination?.total || 0);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setTimeout(() => {
          setIsLoading(false);
          setIsFetchingMore(false);
        }, 300);
      }
    };

    fetchProducts();
    
    // Update URL to match state (Side Effect of state change)
    if (!isInitialMount.current) {
      const params = new URLSearchParams();
      if (debouncedFilters.category.length) params.set("category", debouncedFilters.category.join(","));
      if (debouncedFilters.brand.length) params.set("brand", debouncedFilters.brand.join(","));
      if (debouncedFilters.color.length) params.set("color", debouncedFilters.color.join(","));
      if (debouncedFilters.maxPrice < 2000) params.set("maxPrice", debouncedFilters.maxPrice.toString());
      params.set("sort", debouncedFilters.sort);
      
      const newUrl = `/products?${params.toString()}`;
      if (window.location.search !== `?${params.toString()}`) {
        router.replace(newUrl, { scroll: false });
      }
    }
    
    isInitialMount.current = false;
  }, [debouncedFilters, page, router]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <FilterSidebar state={state} dispatch={dispatch} />
      <FilterSidebar 
        state={state} 
        dispatch={dispatch} 
        isMobile 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      <section className="flex-1 p-8 lg:p-12">
        <header className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div className="space-y-4 w-full">
            <h1 className="text-4xl lg:text-6xl font-medium tracking-tighter">
              Collections
            </h1>
            <div className="flex items-center gap-4 text-xs uppercase tracking-widest text-on-surface-variant">
              <span className="font-bold text-on-surface">{totalProducts} Products</span>
              <span className="w-8 h-1px bg-outline-variant"></span>
              <Button 
                variant="none"
                size="none"
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden flex items-center gap-2 font-bold text-primary"
                aria-label="Open filters"
                icon={<Filter size={14} strokeWidth={2} />}
              >
                Filters
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-between md:justify-end gap-x-8 gap-y-4 border-b border-outline-variant/30 pb-2 w-full md:w-auto">
            <Select 
              labelPrefix="Sort:"
              options={SORT_OPTIONS}
              value={state.sort}
              onChange={(val) => dispatch({ type: "set_sort", payload: val })}
            />
            <div className="flex items-center gap-4 shrink-0">
              <Button 
                variant="icon"
                size="icon"
                onClick={() => setViewMode("grid")}
                isActive={viewMode === "grid"}
                aria-label="Grid view"
              >
                <LayoutGrid size={20} strokeWidth={1.5} />
              </Button>
              <Button 
                variant="icon"
                size="icon"
                onClick={() => setViewMode("list")}
                isActive={viewMode === "list"}
                aria-label="List view"
              >
                <List size={20} strokeWidth={1.5} />
              </Button>
            </div>
          </div>
        </header>

        <ActiveFilters state={state} dispatch={dispatch} />

        <ProductGrid isLoading={isLoading} viewMode={viewMode}>
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <ProductSkeleton key={i} />
            ))
          ) : products.length > 0 ? (
            <>
              {products.map((product, index) => (
                <ProductCard 
                  key={`${product.id}-${index}`} // Use combination for stability with appending
                  product={product} 
                  variant="editorial" 
                  isListView={viewMode === "list"}
                  delay={index % 12 * 0.06} // Reset animation delay per page load
                />
              ))}
              {/* Sentinel for Infinite Scroll */}
              <div ref={lastItemRef} className="col-span-full h-10 invisible" />
            </>
          ) : (
            <div className="col-span-full py-32 text-center text-stone-400 font-medium tracking-wide">
              No pieces found matching your criteria.
            </div>
          )}
        </ProductGrid>

        {/* Loading Indicator for Infinite Scroll */}
        {isFetchingMore && (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
          </div>
        )}
      </section>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-surface" />}>
      <ProductsContent />
    </Suspense>
  );
}
