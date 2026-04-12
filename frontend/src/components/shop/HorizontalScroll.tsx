"use client";

import React, { useRef } from "react";
import { Product } from "@/types";
import { ProductCard } from "./ProductCard";
import { Button } from "../ui/Button";

interface HorizontalScrollProps {
  title: string;
  products: Product[];
}

export const HorizontalScroll = ({ title, products }: HorizontalScrollProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="bg-surface-container-low py-24 lg:py-32 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-8 lg:px-12">
        <div className="flex justify-between items-end mb-16">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant font-bold">Recommendations</p>
            <h2 className="text-4xl font-medium tracking-tight">{title}</h2>
          </div>
          <div className="hidden md:flex gap-4">
            <Button 
              variant="icon"
              size="icon"
              onClick={() => scroll("left")}
              className="rounded-full flex items-center justify-center hover:bg-white transition-all active:scale-95 group border border-outline-variant"
              aria-label="Scroll left"
              icon={
                <span className="material-symbols-outlined transition-transform group-hover:-translate-x-0.5">chevron_left</span>
              }
            />
            <Button 
              variant="icon"
              size="icon"
              onClick={() => scroll("right")}
              className="rounded-full flex items-center justify-center hover:bg-white transition-all active:scale-95 group border border-outline-variant"
              aria-label="Scroll right"
              icon={
                <span className="material-symbols-outlined transition-transform group-hover:translate-x-0.5">chevron_right</span>
              }
            />
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex gap-8 overflow-x-auto custom-scrollbar pb-12 snap-x"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product, idx) => (
            <div key={product.id} className="min-w-[320px] md:min-w-[400px] snap-start">
              <ProductCard 
                product={product} 
                variant="editorial" 
                delay={idx * 0.1} 
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
