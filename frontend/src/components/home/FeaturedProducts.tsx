"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/shop/ProductCard";
import { productApi } from "@/lib/api";
import { Product } from "@/types";

export const FeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productApi.getFeatured();
        if (response.data.success) {
          setProducts(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch featured products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <section className="py-32 px-8 bg-surface-container-lowest overflow-hidden">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex justify-between items-end mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
          >
            <p className="text-on-surface-variant font-label text-xs tracking-[0.2em] uppercase mb-4">
              Seasonal Focus
            </p>
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-on-surface">
              Artifacts of Utility
            </h2>
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm font-bold uppercase tracking-widest border-b border-primary hover:pb-1 transition-all duration-300"
          >
            View All Series
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-surface-container-high animate-pulse" />
            ))
          ) : (
            products.map((product, index) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                delay={index * 0.15} 
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
};
