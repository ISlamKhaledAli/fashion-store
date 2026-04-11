"use client";

import React, { useReducer, useEffect, useState, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/shop/ProductCard";
import { FilterSidebar, FilterState } from "@/components/shop/FilterSidebar";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { ActiveFilters } from "@/components/shop/ActiveFilters";
import { ProductSkeleton } from "@/components/shop/ProductSkeleton";
import { productApi } from "@/lib/api";
import { Product } from "@/types";

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

  // Sync URL to state on mount
  useEffect(() => {
    const params: Partial<FilterState> = {};
    const cat = searchParams.get("category");
    if (cat) params.category = cat.split(",");
    const max = searchParams.get("maxPrice");
    if (max) params.maxPrice = parseInt(max);
    // Add other sync bits here...

    if (Object.keys(params).length > 0) {
      dispatch({ type: "sync_from_url", payload: params });
    }
  }, [searchParams]);

  // Fetch products and update URL on state change
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    
    // Update URL
    const params = new URLSearchParams();
    if (state.category.length) params.set("category", state.category.join(","));
    if (state.color.length) params.set("color", state.color.join(","));
    if (state.maxPrice < 2000) params.set("maxPrice", state.maxPrice.toString());
    params.set("sort", state.sort);
    
    router.push(`/products?${params.toString()}`, { scroll: false });

    try {
      const res = await productApi.getAll({
        category: state.category.join(","),
        color: state.color.join(","),
        maxPrice: state.maxPrice,
        sort: state.sort,
        limit: 12,
      });
      
      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      // Small artificial delay to show transition if it's too fast
      setTimeout(() => setIsLoading(false), 300);
    }
  }, [state, router]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Sidebar - Desktop */}
      <FilterSidebar state={state} dispatch={dispatch} />
      
      {/* Sidebar - Mobile Drawer */}
      <FilterSidebar 
        state={state} 
        dispatch={dispatch} 
        isMobile 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      <section className="flex-1 p-8 lg:p-12">
        {/* Header Tools */}
        <header className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div className="space-y-4 w-full">
            <h1 className="text-4xl lg:text-6xl font-medium tracking-tighter">
              Collections
            </h1>
            <div className="flex items-center gap-4 text-xs uppercase tracking-widest text-on-surface-variant">
              <span className="font-bold text-on-surface">{products.length} Products</span>
              <span className="w-8 h-1px bg-outline-variant"></span>
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden flex items-center gap-2 font-bold text-primary"
              >
                <span className="material-symbols-outlined text-sm">filter_list</span>
                Filters
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-8 border-b border-outline-variant/30 pb-2 w-full md:w-auto overflow-x-auto">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest shrink-0">
              <span className="text-on-surface-variant">Sort:</span>
              <select 
                value={state.sort}
                onChange={(e) => dispatch({ type: "set_sort", payload: e.target.value })}
                className="bg-transparent border-none focus:ring-0 p-0 pr-6 text-on-surface font-bold text-xs uppercase tracking-widest cursor-pointer outline-none"
              >
                <option value="createdAt:desc">Newest Arrivals</option>
                <option value="price:asc">Price Low-High</option>
                <option value="price:desc">Price High-Low</option>
                <option value="createdAt:asc">Oldest First</option>
              </select>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <button className="text-primary"><span className="material-symbols-outlined text-xl">grid_view</span></button>
              <button className="text-on-surface-variant hover:text-primary transition-colors"><span className="material-symbols-outlined text-xl">view_list</span></button>
            </div>
          </div>
        </header>

        {/* Active Filters Row */}
        <ActiveFilters state={state} dispatch={dispatch} />

        {/* Animated Product Grid */}
        <ProductGrid isLoading={isLoading}>
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
                delay={index * 0.06} // Exactly 60ms stagger per item
              />
            ))
          ) : (
            <div className="col-span-full py-32 text-center text-stone-400 font-medium tracking-wide">
              No pieces found matching your criteria.
            </div>
          )}
        </ProductGrid>

        {/* Simple Pagination Mock */}
        {products.length > 0 && (
          <footer className="mt-24 flex justify-center items-center gap-8 border-t border-outline-variant/20 pt-12">
            <button className="text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">west</span> Prev
            </button>
            <div className="flex items-center gap-6 text-xs font-bold tracking-widest">
              <span className="text-primary border-b border-primary pb-1">01</span>
              <span className="text-on-surface-variant cursor-not-allowed opacity-50">02</span>
            </div>
            <button className="text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary flex items-center gap-2">
              Next <span className="material-symbols-outlined text-sm">east</span>
            </button>
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
