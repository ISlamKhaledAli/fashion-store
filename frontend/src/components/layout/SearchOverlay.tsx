"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Variants } from "framer-motion";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Clock, ExternalLink } from "lucide-react";
import { useSearchStore } from "@/store/searchStore";
import { productApi, categoryApi } from "@/lib/api";
import type { Product, Category } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Image from "next/image";
import Link from "next/link";

export const SearchOverlay = () => {
  const { isOpen, onClose } = useSearchStore();
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentSearces, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }

    const fetchCategories = async () => {
      try {
        const res = await categoryApi.getAll();
        if (res.data.success) {
          setCategories(res.data.data.slice(0, 5));
        }
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    fetchCategories();
  }, []);

  // Autofocus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery("");
      setProducts([]);
      setSelectedIndex(-1);
    }
  }, [isOpen]);

  // Live search with debounce
  useEffect(() => {
    if (!query.trim()) {
      setProducts([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await productApi.getAll({ search: query, limit: 3 });
        if (res.data.success) {
          setProducts(res.data.data);
        }
      } catch (error) {
        console.error("Search fetch failed", error);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [query]);

  const handleSearch = useCallback(
    (searchTerm: string) => {
      if (!searchTerm.trim()) return;

      // Save to recent searches
      const updated = [
        searchTerm,
        ...recentSearces.filter((s) => s !== searchTerm),
      ].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem("recentSearches", JSON.stringify(updated));

      onClose();
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    },
    [recentSearces, onClose, router]
  );

  const removeRecent = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    const updated = recentSearces.filter((s) => s !== term);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      }

      const totalItems =
        products.length +
        categories.length +
        (query ? 0 : recentSearces.length);

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : prev));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (selectedIndex === -1) {
          handleSearch(query);
        } else {
          const items = [
            ...categories.map((c) => ({ type: "category" as const, data: c })),
            ...(!query
              ? recentSearces.map((s) => ({ type: "recent" as const, data: s }))
              : []),
            ...products.map((p) => ({ type: "product" as const, data: p })),
          ];
          const item = items[selectedIndex];
          if (!item) {
            handleSearch(query);
          } else if (item.type === "category") {
            onClose();
            router.push(`/products?category=${(item.data as Category).name}`);
          } else if (item.type === "recent") {
            setQuery(item.data as string);
            handleSearch(item.data as string);
          } else if (item.type === "product") {
            onClose();
            router.push(`/products/${(item.data as Product).id}`);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isOpen,
    products,
    categories,
    recentSearces,
    query,
    selectedIndex,
    handleSearch,
    onClose,
    router,
  ]);

  const containerVariants: Variants = {
    hidden: { height: 0, opacity: 0 },
    visible: {
      height: "auto",
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1] as const,
        when: "beforeChildren",
        staggerChildren: 0.03,
      },
    },
    exit: {
      height: 0,
      opacity: 0,
      transition: { duration: 0.2, ease: "easeInOut" },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black backdrop-blur-sm"
          />

          {/* Search Panel */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-0 left-0 z-[101] w-full overflow-hidden bg-surface shadow-2xl"
          >
            <div className="mx-auto max-w-7xl px-8 py-10">
              {/* Header / Input Area */}
              <div className="flex items-center justify-between gap-12">
                <div className="max-w-3xl flex-1">
                  <Input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search products, collections, or materials..."
                    icon={<Search />}
                    className="w-full"
                  />
                </div>
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="group flex items-center gap-2 transition-all"
                >
                  <span className="text-xs font-bold tracking-[0.2em] uppercase transition-colors group-hover:text-primary">
                    Close
                  </span>
                  <motion.div
                    whileHover="hover"
                    whileTap="tap"
                    initial="initial"
                    className="flex items-center justify-center rounded-full p-2 hover:bg-zinc-100/50"
                  >
                    <motion.div
                      variants={{
                        initial: { rotate: 0, scale: 1 },
                        hover: { rotate: 90, scale: 1.1 },
                        tap: { scale: 0.9 },
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                    >
                      <X size={18} />
                    </motion.div>
                  </motion.div>
                </Button>
              </div>

              {/* Dynamic Results Content */}
              <div className="grid min-h-[400px] grid-cols-1 gap-16 py-12 md:grid-cols-12">
                {/* Left Column: Categories and Recent */}
                <div className="space-y-12 md:col-span-3">
                  <motion.section variants={itemVariants}>
                    <h3 className="mb-6 text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase">
                      Categories
                    </h3>
                    <div className="flex flex-col gap-4">
                      {categories.map((cat, idx) => (
                        <Link
                          key={cat.id}
                          href={`/products?category=${cat.name}`}
                          onClick={onClose}
                          className={cn(
                            "group -mx-2 flex items-center justify-between rounded-lg px-2 py-1 transition-colors",
                            selectedIndex === idx
                              ? "bg-surface-container-high"
                              : ""
                          )}
                        >
                          <span className="text-sm transition-transform duration-500 group-hover:translate-x-1">
                            {cat.name}
                          </span>
                          <ExternalLink
                            size={14}
                            className={cn(
                              "text-outline-variant transition-opacity",
                              selectedIndex === idx
                                ? "opacity-100"
                                : "opacity-0 group-hover:opacity-100"
                            )}
                          />
                        </Link>
                      ))}
                    </div>
                  </motion.section>

                  {recentSearces.length > 0 && !query && (
                    <motion.section
                      variants={itemVariants}
                      className="border-t border-outline-variant/10 pt-8"
                    >
                      <h3 className="mb-6 text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase">
                        Recent Searches
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {recentSearces.map((term, idx) => {
                          const isSelected =
                            selectedIndex === categories.length + idx;
                          return (
                            <div
                              key={term}
                              onClick={() => handleSearch(term)}
                              className={cn(
                                "group flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-xs transition-colors hover:bg-surface-container-high",
                                isSelected
                                  ? "bg-surface-container-high ring-1 ring-outline"
                                  : "bg-surface-container-low"
                              )}
                            >
                              <Clock
                                size={12}
                                className="text-on-surface-variant"
                              />
                              <span>{term}</span>
                              <Button
                                variant="none"
                                size="none"
                                onClick={(e) => removeRecent(e, term)}
                                className={cn(
                                  "transition-opacity hover:text-error",
                                  isSelected
                                    ? "opacity-100"
                                    : "opacity-0 group-hover:opacity-100"
                                )}
                              >
                                <X size={12} />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </motion.section>
                  )}
                </div>

                {/* Right Column: Products */}
                <div className="md:col-span-9">
                  <motion.div
                    variants={itemVariants}
                    className="mb-8 flex items-center justify-between"
                  >
                    <h3 className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase">
                      {query ? "Product Results" : "Featured Pieces"}
                    </h3>
                    {products.length > 0 && (
                      <Button
                        variant="none"
                        size="none"
                        onClick={() => handleSearch(query)}
                        className="border-b border-on-surface pb-1 text-[10px] font-bold tracking-widest uppercase transition-colors hover:text-primary"
                      >
                        View All
                      </Button>
                    )}
                  </motion.div>

                  <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    {isLoading ? (
                      Array(3)
                        .fill(0)
                        .map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="mb-4 aspect-[3/4] bg-surface-container-low" />
                            <div className="mb-2 h-4 w-3/4 bg-surface-container-low" />
                            <div className="h-4 w-1/4 bg-surface-container-low" />
                          </div>
                        ))
                    ) : products.length > 0 ? (
                      products.map((product, idx) => {
                        const isSelected =
                          selectedIndex ===
                          categories.length +
                            (!query ? recentSearces.length : 0) +
                            idx;
                        return (
                          <motion.div
                            key={product.id}
                            variants={itemVariants}
                            className={cn(
                              "group -m-4 cursor-pointer rounded-xl p-4 transition-all",
                              isSelected
                                ? "bg-surface-container-low ring-1 ring-outline"
                                : ""
                            )}
                            onClick={() => {
                              onClose();
                              router.push(`/products/${product.id}`);
                            }}
                          >
                            <div className="relative mb-4 flex aspect-[3/4] items-center justify-center overflow-hidden rounded-md bg-surface-container">
                              {product.images?.find((img) => img.isMain)?.url ||
                              product.images?.[0]?.url ? (
                                <Image
                                  src={
                                    product.images?.find((img) => img.isMain)
                                      ?.url ||
                                    product.images?.[0]?.url ||
                                    ""
                                  }
                                  alt={product.name}
                                  fill
                                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                                />
                              ) : (
                                <span className="material-symbols-outlined text-3xl text-zinc-400">
                                  checkroom
                                </span>
                              )}
                            </div>
                            <h4 className="mb-1 text-sm font-medium tracking-tight transition-colors group-hover:text-primary">
                              {product.name}
                            </h4>
                            <p className="mb-2 text-xs text-on-surface-variant">
                              {product.category?.name}
                            </p>
                            <p className="text-sm font-semibold">
                              ${product.price.toFixed(2)}
                            </p>
                          </motion.div>
                        );
                      })
                    ) : query ? (
                      <div className="col-span-full py-12 text-center text-on-surface-variant">
                        No products found for &ldquo;{query}&rdquo;
                      </div>
                    ) : (
                      <div className="group col-span-full flex flex-col items-center justify-between gap-8 rounded-xl bg-surface-container-low p-8 md:flex-row">
                        <div className="max-w-md">
                          <span className="mb-2 block text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
                            Editorial Focus
                          </span>
                          <h4 className="mb-2 text-xl font-medium tracking-tight">
                            Modern Utility: The 2024 Archive
                          </h4>
                          <p className="text-sm leading-relaxed text-on-surface-variant">
                            Discover our new editorial focus on longevity,
                            featuring biodegradable materials and local
                            craftsmanship.
                          </p>
                        </div>
                        <Button
                          variant="primary"
                          className="bg-primary px-8 py-3 text-[10px] font-bold tracking-widest text-on-primary uppercase transition-transform duration-500 hover:scale-[0.98]"
                        >
                          Read Archive
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
