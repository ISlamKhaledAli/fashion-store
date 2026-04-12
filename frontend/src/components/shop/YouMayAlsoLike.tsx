"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { productApi } from "@/lib/api";
import { Product } from "@/types";
import { ProductCard } from "./ProductCard";
import Skeleton from "@/components/ui/Skeleton";

interface YouMayAlsoLikeProps {
  categoryId: string;
}

export const YouMayAlsoLike = ({ categoryId }: YouMayAlsoLikeProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    console.log("YouMayAlsoLike: categoryId received:", categoryId);
    if (!categoryId) return;

    const fetchRelated = async () => {
      setLoading(true);
      console.log("YouMayAlsoLike: Making API call for category:", categoryId);
      try {
        const res = await productApi.getAll({ 
          category: categoryId,
          limit: 4 
        });
        
        console.log("YouMayAlsoLike: Products returned:", res.data.data);
        if (res.data.success && isMounted) {
          setProducts(res.data.data.slice(0, 4));
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchRelated();
    
    return () => { isMounted = false; };
  }, [categoryId]);

  if (loading) {
    return (
      <section className="bg-surface-container-lowest py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-4 w-32 mb-12" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="aspect-3/4" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="bg-surface-container-lowest py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-on-surface mb-12">
          You May Also Like
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
          {products.map((p, idx) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ delay: idx * 0.08, duration: 0.6 }}
            >
              <ProductCard 
                product={p} 
                variant="editorial" 
                delay={0}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
