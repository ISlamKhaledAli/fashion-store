"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export const FilterSidebar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [price, setPrice] = useState(750);
  
  // Dummy data for visual fidelity
  const categories = ["All Products", "New Arrivals", "Clothing", "Accessories"];
  const colors = ["bg-stone-950", "bg-stone-100", "bg-stone-400", "bg-[#D2B48C]"];

  const handleApply = () => {
    // Basic implementation of filter application (in real app, this updates URL search params)
    const params = new URLSearchParams(searchParams.toString());
    params.set('maxPrice', price.toString());
    router.push(`/products?${params.toString()}`);
  };

  return (
    <aside className="sticky top-20 h-[calc(100vh-5rem)] w-64 flex-shrink-0 flex flex-col p-8 gap-6 bg-surface-container-lowest overflow-y-auto hidden lg:flex">
      <div className="space-y-1">
        <h2 className="font-headline text-sm uppercase tracking-widest text-on-surface font-bold">
          FILTER
        </h2>
        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">
          Refine Selection
        </p>
      </div>

      <div className="space-y-6">
        {/* Categories */}
        <section>
          <h3 className="text-[11px] font-bold uppercase tracking-widest mb-4">Categories</h3>
          <div className="flex flex-col gap-3">
            {categories.map((cat, idx) => (
              <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  defaultChecked={idx === 0}
                  className="w-4 h-4 border-outline-variant text-primary focus:ring-primary rounded-sm bg-transparent"
                />
                <span className={`text-xs uppercase tracking-wider transition-colors ${idx === 0 ? "text-on-surface group-hover:text-on-surface-variant" : "text-on-surface-variant group-hover:text-on-surface"}`}>
                  {cat}
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* Price Range */}
        <section>
          <h3 className="text-[11px] font-bold uppercase tracking-widest mb-4">Price Range</h3>
          <input 
            type="range"
            min="0"
            max="1000"
            value={price}
            onChange={(e) => setPrice(parseInt(e.target.value))}
            className="w-full h-1 bg-surface-container-highest rounded-full appearance-none cursor-pointer accent-primary" 
          />
          <div className="flex justify-between mt-2 text-[10px] text-on-surface-variant">
            <span>$0</span>
            <span>${price}+</span>
          </div>
        </section>

        {/* Color Swatches */}
        <section>
          <h3 className="text-[11px] font-bold uppercase tracking-widest mb-4">Colors</h3>
          <div className="flex flex-wrap gap-2">
            {colors.map((color, idx) => (
              <button 
                key={idx}
                className={`w-6 h-6 rounded-full ${color} ring-1 transition-transform hover:scale-110 ${color === "bg-stone-950" ? "ring-offset-2 ring-stone-950" : "ring-stone-200"}`}
              />
            ))}
          </div>
        </section>

        {/* Rating */}
        <section>
          <h3 className="text-[11px] font-bold uppercase tracking-widest mb-4">Rating</h3>
          <div className="flex flex-col gap-2">
            <button className="flex gap-1 text-primary hover:opacity-70">
              {[...Array(5)].map((_, i) => (
                <span 
                  key={i} 
                  className="material-symbols-outlined text-xs" 
                  style={{ fontVariationSettings: `'FILL' ${i < 4 ? 1 : 0}` }}
                >
                  star
                </span>
              ))}
              <span className="text-[10px] ml-1">&amp; Up</span>
            </button>
          </div>
        </section>
      </div>

      <button 
        onClick={handleApply}
        className="mt-auto py-4 bg-primary text-on-primary text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-primary/90 transition-all active:scale-95"
      >
        Apply Filters
      </button>
    </aside>
  );
};
