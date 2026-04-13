"use client";

import React, { useReducer, useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/shop/ProductCard";
import { FilterSidebar, FilterState } from "@/components/shop/FilterSidebar";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { ActiveFilters } from "@/components/shop/ActiveFilters";
import { Button } from "@/components/ui/Button";
import { ProductSkeleton } from "@/components/shop/ProductSkeleton";
import { productApi } from "@/lib/api";
import { Product } from "@/types";
import { cn } from "@/lib/utils";
import { Filter, LayoutGrid, List, ArrowLeft, ArrowRight } from "lucide-react";
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
    case "toggle_category":
      return {
        ...state,
        category: state.category.includes(action.payload)
          ? state.category.filter((c) => c !== action.payload)
          : [...state.category, action.payload],
      };
    case "toggle_brand":
      return {
        ...state,
        brand: state.brand.includes(action.payload)
          ? state.brand.filter((b) => b !== action.payload)
          : [...state.brand, action.payload],
      };
    case "toggle_color":
      return {
        ...state,
        color: state.color.includes(action.payload)
          ? state.color.filter((c) => c !== action.payload)
          : [...state.color, action.payload],
      };
    case "set_max_price":
      return { ...state, maxPrice: action.payload };
    case "set_sort":
      return { ...state, sort: action.payload };
    case "reset":
      return initialState;
    case "sync_from_url":
      return { ...state, ...action.payload };
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
  const isInitialMount = React.useRef(true);
  const fetchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // ... (maintain useEffects logic)
  // Reset page when filters change
  useEffect(() => {
    if (!isInitialMount.current) setPage(1);
  }, [state]);

  useEffect(() => {
    const params: Partial<FilterState> = {};
    const cat = searchParams.get("category");
    if (cat) params.category = cat.split(",");
    const brand = searchParams.get("brand");
    if (brand) params.brand = brand.split(",");
    const max = searchParams.get("maxPrice");
    if (max) params.maxPrice = parseInt(max);

    if (Object.keys(params).length > 0) {
      dispatch({ type: "sync_from_url", payload: params });
    }

    const fetchInitial = async () => {
      setIsLoading(true);
      try {
        const res = await productApi.getAll({
          category: cat || "",
          brand: brand || "",
          color: searchParams.get("color") || "",
          maxPrice: max ? parseInt(max) : 2000,
          sort: searchParams.get("sort") || "createdAt:desc",
          limit: 12,
          page: 1,
        });
        if (res.data.success) {
          setProducts(res.data.data);
          setTotalPages(res.data.pagination?.totalPages || 1);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setTimeout(() => setIsLoading(false), 300);
      }
    };

    fetchInitial().then(() => {
      isInitialMount.current = false;
    });
  }, [searchParams]);

  useEffect(() => {
    if (isInitialMount.current) return;
    if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
    fetchTimeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (state.category.length) params.set("category", state.category.join(","));
      if (state.brand.length) params.set("brand", state.brand.join(","));
      if (state.color.length) params.set("color", state.color.join(","));
      if (state.maxPrice < 2000) params.set("maxPrice", state.maxPrice.toString());
      params.set("sort", state.sort);
      router.replace(`/products?${params.toString()}`, { scroll: false });
      try {
        const res = await productApi.getAll({
          category: state.category.map((c) => c.trim()).join(","),
          brand: state.brand.map((b) => b.trim()).join(","),
          color: state.color.map((c) => c.trim()).join(","),
          maxPrice: state.maxPrice,
          sort: state.sort,
          limit: 12,
          page,
        });
        if (res.data.success) {
          setProducts(res.data.data);
          setTotalPages(res.data.pagination?.totalPages || 1);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setTimeout(() => setIsLoading(false), 300);
      }
    }, 150);
    return () => { if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current); };
  }, [state, page, router]);

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
              <span className="font-bold text-on-surface">{products.length} Products</span>
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
            products.map((product, index) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                variant="editorial" 
                isListView={viewMode === "list"}
                delay={index * 0.06} 
              />
            ))
          ) : (
            <div className="col-span-full py-32 text-center text-stone-400 font-medium tracking-wide">
              No pieces found matching your criteria.
            </div>
          )}
        </ProductGrid>

        {/* Pagination Integration */}
        {products.length > 0 && totalPages > 1 && (
          <footer className="mt-24 flex justify-center items-center gap-8 border-t border-outline-variant/20 pt-12">
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className={cn("gap-2 text-on-surface-variant hover:text-primary transition-opacity duration-300", page === 1 && "opacity-30 pointer-events-none")}
             >
              <ArrowLeft size={14} strokeWidth={1.5} /> Prev
            </Button>
            
            <div className="flex items-center gap-6 text-xs font-bold tracking-widest">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button 
                  key={p}
                  variant="none"
                  size="none"
                  onClick={() => setPage(p)}
                  className={cn(
                    "pb-1 transition-all cursor-pointer",
                    page === p 
                      ? "text-primary border-b border-primary" 
                      : "text-on-surface-variant hover:text-primary opacity-50 hover:opacity-100"
                  )}
                  aria-label={`Go to page ${p}`}
                >
                  {p.toString().padStart(2, '0')}
                </Button>
              ))}
            </div>

            <Button 
                 variant="ghost" 
                 size="sm" 
                 onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                 disabled={page === totalPages}
                 className={cn("gap-2 text-on-surface-variant hover:text-primary transition-opacity duration-300", page === totalPages && "opacity-30 pointer-events-none")}
            >
              Next <ArrowRight size={14} strokeWidth={1.5} />
            </Button>
          </footer>
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
