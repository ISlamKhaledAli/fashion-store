"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";

interface ProductGridHeaderProps {
  totalProducts?: number;
  categoryName?: string;
  isGridView?: boolean;
  onViewChange?: (isGrid: boolean) => void;
}

export const ProductGridHeader = ({ 
  totalProducts = 0, 
  categoryName = "Summer Editorial",
  isGridView = true,
  onViewChange
}: ProductGridHeaderProps) => {
  const searchParams = useSearchParams();
  const maxPrice = searchParams.get('maxPrice');
  
  const [activeFilters, setActiveFilters] = useState([
    { id: "1", label: "Clothing" },
    ...(maxPrice ? [{ id: "2", label: `Under $${maxPrice}` }] : [])
  ]);

  const removeFilter = (id: string) => {
    setActiveFilters(prev => prev.filter(f => f.id !== id));
  };

  return (
    <header className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
      <div>
        <h1 className="text-4xl lg:text-6xl font-medium tracking-tighter mb-4 capitalize">
          {categoryName.replace('-', ' ')}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-widest text-on-surface-variant">
          <span className="font-bold text-on-surface">{totalProducts} Products</span>
          <span className="w-8 h-[1px] bg-outline-variant hidden sm:block"></span>
          
          <div className="flex flex-wrap gap-2">
            {activeFilters.map(filter => (
              <span 
                key={filter.id} 
                className="bg-surface-container-low px-3 py-1 flex items-center gap-2 rounded-full"
              >
                {filter.label} 
                <button onClick={() => removeFilter(filter.id)} className="hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-xs">close</span>
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-8 border-b border-outline-variant/30 pb-2 w-full md:w-auto overflow-x-auto">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest shrink-0">
          <span className="text-on-surface-variant">Sort:</span>
          <select className="bg-transparent border-none focus:ring-0 p-0 pr-6 text-on-surface font-bold text-xs uppercase tracking-widest cursor-pointer outline-none">
            <option>Newest Arrivals</option>
            <option>Price Low-High</option>
            <option>Price High-Low</option>
            <option>Best Rated</option>
          </select>
        </div>
        
        <div className="flex items-center gap-4 shrink-0">
          <button 
            onClick={() => onViewChange?.(true)}
            className={`transition-colors ${isGridView ? "text-primary opacity-100" : "text-on-surface-variant hover:text-primary"}`}
            aria-label="Grid view"
          >
            <span className="material-symbols-outlined text-xl">grid_view</span>
          </button>
          <button 
            onClick={() => onViewChange?.(false)}
            className={`transition-colors ${!isGridView ? "text-primary opacity-100" : "text-on-surface-variant hover:text-primary"}`}
            aria-label="List view"
          >
            <span className="material-symbols-outlined text-xl">view_list</span>
          </button>
        </div>
      </div>
    </header>
  );
};
