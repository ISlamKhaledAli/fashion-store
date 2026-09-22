"use client";

import React, { useEffect, useState, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/shop/ProductCard";
import type {
  FilterState,
  FilterAction,
} from "@/components/shop/FilterSidebar";
import { FilterSidebar } from "@/components/shop/FilterSidebar";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { ActiveFilters } from "@/components/shop/ActiveFilters";
import { Button } from "@/components/ui/Button";
import { ProductSkeleton } from "@/components/shop/ProductSkeleton";
import { productApi } from "@/lib/api";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";
import { SlidersHorizontal, PackageX, MoveRight } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { motion } from "framer-motion";

const SORT_OPTIONS = [
  { label: "Newest Arrivals", value: "createdAt:desc" },
  { label: "Price Low-High", value: "price:asc" },
  { label: "Price High-Low", value: "price:desc" },
];

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
  const viewMode: "grid" | "list" = "grid";

  const state: FilterState = React.useMemo(
    () => ({
      category: searchParams.get("category")
        ? searchParams.get("category")!.split(",")
        : [],
      brand: searchParams.get("brand")
        ? searchParams.get("brand")!.split(",")
        : [],
      color: searchParams.get("color")
        ? searchParams.get("color")!.split(",")
        : [],
      minPrice: 0,
      maxPrice: parseInt(searchParams.get("maxPrice") || "2000"),
      sort: searchParams.get("sort") || "createdAt:desc",
      size: [],
    }),
    [searchParams]
  );

  const dispatch = useCallback(
    (action: FilterAction) => {
      const params = new URLSearchParams(searchParams.toString());
      const currentCategory = params.get("category")
        ? params.get("category")!.split(",")
        : [];
      const currentBrand = params.get("brand")
        ? params.get("brand")!.split(",")
        : [];
      const currentColor = params.get("color")
        ? params.get("color")!.split(",")
        : [];

      switch (action.type) {
        case "toggle_category": {
          const newCat = currentCategory.includes(action.payload)
            ? currentCategory.filter((c) => c !== action.payload)
            : [...currentCategory, action.payload];
          if (newCat.length) params.set("category", newCat.join(","));
          else params.delete("category");
          break;
        }
        case "toggle_brand": {
          const newBrand = currentBrand.includes(action.payload)
            ? currentBrand.filter((b) => b !== action.payload)
            : [...currentBrand, action.payload];
          if (newBrand.length) params.set("brand", newBrand.join(","));
          else params.delete("brand");
          break;
        }
        case "toggle_color": {
          const payload = action.payload.toLowerCase().trim();
          const newColor = currentColor.includes(payload)
            ? currentColor.filter((c) => c !== payload)
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
    },
    [searchParams, router]
  );

  const fetchProducts = useCallback(
    async (paramsToFetch: Record<string, unknown>, isLoadMore = false) => {
      if (isLoadMore) setIsMoreLoading(true);
      else setIsLoading(true);

      try {
        const res = await productApi.getAll(paramsToFetch);
        if (res.data.success) {
          if (isLoadMore) {
            setProducts((prev) => [...prev, ...(res.data.data as Product[])]);
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
    },
    []
  );

  // ONE effect that fetches when URL changes
  useEffect(() => {
    fetchProducts(
      {
        search: query,
        category: state.category.join(","),
        brand: state.brand.join(","),
        color: state.color.join(","),
        maxPrice: state.maxPrice,
        sort: state.sort,
        page: 1,
        limit: 6,
      },
      false
    );
  }, [
    query,
    state.category,
    state.brand,
    state.color,
    state.maxPrice,
    state.sort,
    fetchProducts,
  ]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(
      {
        search: query,
        category: state.category.join(","),
        brand: state.brand.join(","),
        color: state.color.join(","),
        maxPrice: state.maxPrice,
        sort: state.sort,
        page: nextPage,
        limit: 6,
      },
      true
    );
  };

  return (
    <div className={cn("flex min-h-screen flex-col bg-surface lg:flex-row")}>
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
            <span className="mb-4 block text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase">
              Search Results
            </span>
            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
              <h1 className="text-4xl leading-tight font-medium tracking-tighter text-on-surface md:text-6xl">
                Results for &ldquo;
                <span className="italic-font font-light italic">{query}</span>
                &rdquo;
                <span className="ml-4 font-light text-on-surface-variant">
                  — {isLoading ? "..." : totalCount} products
                </span>
              </h1>

              <div className="flex items-center gap-6">
                <Select
                  labelPrefix="Sort:"
                  options={SORT_OPTIONS}
                  value={state.sort}
                  onChange={(val) =>
                    dispatch({ type: "set_sort", payload: val })
                  }
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
              {Array(6)
                .fill(0)
                .map((_, i) => (
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
              className="mx-auto flex max-w-md flex-col items-center py-32 text-center"
            >
              <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-surface-container">
                <PackageX
                  size={40}
                  className="text-on-surface-variant/40"
                  strokeWidth={1}
                />
              </div>
              <h2 className="mb-4 text-2xl font-medium tracking-tight text-on-surface">
                No pieces found
              </h2>
              <p className="mb-8 text-sm leading-relaxed text-on-surface-variant">
                We couldn&apos;t find any products matching Your search for
                &ldquo;{query}&rdquo;. Try adjusting your filters or searching
                for something else.
              </p>
              <div className="flex w-full flex-col gap-3">
                <h3 className="mb-2 text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
                  Suggestions
                </h3>
                {["Minimalist", "Denim", "Archives", "Ceramics"].map(
                  (suggestion) => (
                    <Button
                      key={suggestion}
                      variant="none"
                      size="none"
                      onClick={() => router.push(`/search?q=${suggestion}`)}
                      className="group flex w-full items-center justify-between rounded-lg bg-surface-container-low p-4 transition-colors hover:bg-surface-container"
                    >
                      <span className="text-sm">{suggestion}</span>
                      <MoveRight
                        size={16}
                        className="text-outline-variant transition-colors group-hover:text-primary"
                      />
                    </Button>
                  )
                )}
              </div>
            </motion.div>
          )}
        </div>

        {!isLoading && products.length > 0 && products.length < totalCount && (
          <div className="mt-24 flex flex-col items-center gap-6">
            <p className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
              Displaying {products.length} of {totalCount} products
            </p>
            <div className="relative h-[1px] w-64 overflow-hidden bg-outline-variant/30">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(products.length / totalCount) * 100}%` }}
                className="absolute inset-y-0 left-0 bg-primary"
                transition={{ duration: 0.8, ease: "circOut" }}
              />
            </div>
            <Button
              variant="primary"
              className="mt-4 h-14 px-12 text-xs font-bold tracking-widest uppercase"
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
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-surface">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
