"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/shop/ProductCard";
import { productApi } from "@/lib/api";
import type { Product } from "@/types";
import Link from "next/link";
import { ProductSkeleton } from "@/components/shop/ProductSkeleton";

export const FeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await productApi.getFeatured();
        if (response.data.success && Array.isArray(response.data.data)) {
          setProducts(response.data.data);
        }
      } catch (err) {
        // Handled silently
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <section className="overflow-hidden bg-surface-container-lowest px-8 py-32">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-16 flex items-end justify-between">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
          >
            <p className="mb-4 font-label text-xs tracking-[0.2em] text-on-surface-variant uppercase">
              New Release
            </p>
            <h2 className="text-4xl font-medium tracking-tight text-on-surface md:text-5xl">
              The Core Collection
            </h2>
          </motion.div>

          <Link
            href="/products"
            className="border-b border-primary/20 pb-1 font-medium text-primary transition-all duration-300 hover:border-primary"
          >
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {isLoading
            ? [1, 2, 3].map((i) => <ProductSkeleton key={i} />)
            : products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  delay={index * 0.15}
                />
              ))}
        </div>
      </div>
    </section>
  );
};
