"use client";

import React, { useEffect, useState } from "react";
import type { Product } from "@/types";
import { productApi } from "@/lib/api";
import { ProductCard } from "./ProductCard";
import { Sparkles } from "lucide-react";

interface RecommendedProductsProps {
  currentProductId: string;
}

export const RecommendedProducts: React.FC<RecommendedProductsProps> = ({
  currentProductId,
}) => {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [source, setSource] = useState<string>("fallback");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const response = await productApi.getRecommendations(currentProductId);
        if (active && response.data?.success) {
          setRecommendations(response.data.recommendations || []);
          setSource(response.data.source || "fallback");
        }
      } catch (err) {
        console.error("Failed to load product recommendations:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchRecommendations();

    return () => {
      active = false;
    };
  }, [currentProductId]);

  if (loading) {
    return (
      <section className="border-t border-surface-container/30 bg-transparent py-24 sm:py-32">
        <div className="mx-auto max-w-[1440px] px-6 sm:px-12">
          {/* Skeleton Title */}
          <div className="mb-12 flex flex-col items-center justify-center space-y-3">
            <div className="h-3 w-40 animate-pulse rounded bg-surface-container-low" />
            <div className="h-2 w-28 animate-pulse rounded bg-surface-container-low" />
          </div>

          {/* Skeleton Grid */}
          <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col space-y-4">
                <div className="aspect-[4/5] animate-pulse rounded-lg bg-surface-container-low" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-surface-container-low" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-surface-container-low" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (recommendations.length === 0) {
    return null; // Render nothing if empty or failures occur
  }

  return (
    <section className="border-t border-surface-container/30 bg-transparent py-24 sm:py-32">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-12">
        {/* Title and Badge */}
        <div className="mb-12 flex flex-col items-center justify-center space-y-2 text-center">
          <h2 className="text-xs font-bold tracking-[0.2em] text-on-surface-variant uppercase">
            You might also like
          </h2>

          {source !== "fallback" && (
            <div className="animate-fade-in flex items-center gap-1 rounded-full border border-stone-800 bg-stone-900 px-2.5 py-1 text-[10px] font-bold tracking-widest text-stone-100 uppercase shadow-sm">
              <Sparkles size={10} className="animate-pulse text-stone-300" />
              <span>✦ Picked for you</span>
            </div>
          )}
        </div>

        {/* Mobile Horizontal Scroll, Desktop Responsive Grid */}
        <div className="scrollbar-none flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 sm:grid sm:grid-cols-2 sm:gap-8 sm:overflow-visible sm:pb-0 lg:grid-cols-4">
          {recommendations.slice(0, 4).map((product: Product, idx: number) => (
            <div
              key={product.id}
              className="w-[280px] min-w-[240px] snap-start sm:w-auto sm:min-w-0"
            >
              <ProductCard
                product={product}
                delay={idx * 0.1}
                variant="editorial"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
