"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { X, LayoutGrid, List } from "lucide-react";
import { Button } from "../ui/Button";
import { Select } from "../ui/Select";

const SORT_OPTIONS = [
  { label: "Newest Arrivals", value: "createdAt:desc" },
  { label: "Price Low-High", value: "price:asc" },
  { label: "Price High-Low", value: "price:desc" },
  { label: "Best Rated", value: "rating:desc" },
];

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
  const [currentSort, setCurrentSort] = useState("createdAt:desc");
  
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
          <span className="w-8 h-1px bg-outline-variant hidden sm:block"></span>
          
          <div className="flex flex-wrap gap-2">
            {activeFilters.map(filter => (
              <span 
                key={filter.id} 
                className="bg-surface-container-low px-3 py-1 flex items-center gap-2 rounded-full"
              >
                {filter.label} 
                <button onClick={() => removeFilter(filter.id)} className="hover:text-primary transition-colors flex items-center justify-center cursor-pointer">
                  <X size={12} strokeWidth={2} />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center justify-between md:justify-end gap-x-8 gap-y-4 border-b border-outline-variant/30 pb-2 w-full md:w-auto">
        <Select 
          labelPrefix="Sort:"
          options={SORT_OPTIONS}
          value={currentSort}
          onChange={setCurrentSort}
        />
        
        <div className="flex items-center gap-4 shrink-0">
          <Button 
            variant="icon"
            size="icon"
            onClick={() => onViewChange?.(true)}
            isActive={isGridView}
            aria-label="Grid view"
          >
            <LayoutGrid size={20} strokeWidth={1.5} />
          </Button>
          <Button 
            variant="icon"
            size="icon"
            onClick={() => onViewChange?.(false)}
            isActive={!isGridView}
            aria-label="List view"
          >
            <List size={20} strokeWidth={1.5} />
          </Button>
        </div>
      </div>
    </header>
  );
};
