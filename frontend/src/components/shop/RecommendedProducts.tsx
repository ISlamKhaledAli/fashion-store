"use client";

import React, { useEffect, useState } from "react";
import { Product } from "@/types";
import { productApi } from "@/lib/api";
import { ProductCard } from "./ProductCard";
import { Sparkles } from "lucide-react";

interface RecommendedProductsProps {
  currentProductId: string;
}

export const RecommendedProducts: React.FC<RecommendedProductsProps> = ({ currentProductId }) => {
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
          console.log("[RECOMMENDATIONS] Loaded recommendations. Source:", response.data.source);
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
      <section className="bg-transparent border-t border-surface-container/30 py-24 sm:py-32">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-12">
          {/* Skeleton Title */}
          <div className="flex flex-col items-center justify-center mb-12 space-y-3">
            <div className="h-3 w-40 bg-surface-container-low rounded animate-pulse" />
            <div className="h-2 w-28 bg-surface-container-low rounded animate-pulse" />
          </div>
          
          {/* Skeleton Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col space-y-4">
                <div className="aspect-[4/5] bg-surface-container-low rounded-lg animate-pulse" />
                <div className="h-3 w-2/3 bg-surface-container-low rounded animate-pulse" />
                <div className="h-3 w-1/3 bg-surface-container-low rounded animate-pulse" />
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
    <section className="bg-transparent border-t border-surface-container/30 py-24 sm:py-32">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-12">
        
        {/* Title and Badge */}
        <div className="flex flex-col items-center justify-center mb-12 space-y-2 text-center">
          <h2 className="text-xs tracking-[0.2em] uppercase text-on-surface-variant font-bold">
            You might also like
          </h2>
          
          {source !== "fallback" && (
            <div className="flex items-center gap-1 bg-stone-900 text-stone-100 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full animate-fade-in shadow-sm border border-stone-800">
              <Sparkles size={10} className="text-stone-300 animate-pulse" />
              <span>✦ Picked for you</span>
            </div>
          )}
        </div>

        {/* Mobile Horizontal Scroll, Desktop Responsive Grid */}
        <div className="flex overflow-x-auto pb-4 gap-6 snap-x snap-mandatory scrollbar-none sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-8 sm:pb-0 sm:overflow-visible">
          {recommendations.slice(0, 4).map((product: Product, idx: number) => (
            <div 
              key={product.id} 
              className="min-w-[240px] w-[280px] sm:min-w-0 sm:w-auto snap-start"
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
