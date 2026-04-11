"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ProductCard } from "@/components/shop/ProductCard";
import { productApi, categoryApi } from "@/lib/api";
import { Product, Category } from "@/types";
import { Button } from "@/components/ui/Button";

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const currentCategory = searchParams.get("category");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          productApi.getAll({ category: currentCategory }),
          categoryApi.getAll(),
        ]);
        
        if (prodRes.data.success) setProducts(prodRes.data.data);
        if (catRes.data.success) setCategories(catRes.data.data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentCategory]);

  return (
    <div className="flex flex-col lg:flex-row gap-16">
      {/* Sidebar Filters */}
      <aside className="w-full lg:w-64 space-y-12">
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-[0.2em] mb-8 text-on-surface">
            Collections
          </h3>
          <ul className="space-y-4">
            <li>
              <Link 
                href="/products"
                className={cn(
                  "text-sm tracking-tight transition-colors hover:text-primary",
                  !currentCategory ? "text-primary font-bold" : "text-on-surface-variant"
                )}
              >
                All Artifacts
              </Link>
            </li>
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`/products?category=${cat.slug}`}
                  className={cn(
                    "text-sm tracking-tight transition-colors hover:text-primary",
                    currentCategory === cat.slug ? "text-primary font-bold" : "text-on-surface-variant"
                  )}
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-[0.2em] mb-8 text-on-surface">
            Sort By
          </h3>
          <select className="w-full bg-transparent border-none border-b border-outline-variant/30 py-2 text-sm focus:ring-0 focus:border-primary cinematic-ease transition-all">
            <option>Featured</option>
            <option>Newest</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
          </select>
        </div>
      </aside>

      {/* Product Grid */}
      <div className="flex-1">
        <div className="flex justify-between items-baseline mb-12">
          <h2 className="text-2xl font-medium tracking-tight">
            {currentCategory ? categories.find(c => c.slug === currentCategory)?.name : "All Artifacts"}
          </h2>
          <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
            {products.length} Items Found
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-surface-container-high animate-pulse" />
              ))
            ) : (
              products.map((product, index) => (
                <ProductCard key={product.id} product={product} delay={index * 0.05} />
              ))
            )}
          </AnimatePresence>
        </div>
        
        {!isLoading && products.length === 0 && (
          <div className="py-24 text-center space-y-4">
            <p className="text-on-surface-variant">No items found in this collection.</p>
            <Button variant="outline" onClick={() => window.history.back()}>Go Back</Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper components for routing context
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function ProductsPage() {
  return (
    <div className="pt-40 pb-32 px-8 max-w-[1600px] mx-auto min-h-screen">
      <Suspense fallback={<div>Loading Artifacts...</div>}>
        <ProductsContent />
      </Suspense>
    </div>
  );
}
