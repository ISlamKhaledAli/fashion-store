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
  onViewChange,
}: ProductGridHeaderProps) => {
  const searchParams = useSearchParams();
  const maxPrice = searchParams.get("maxPrice");
  const [currentSort, setCurrentSort] = useState("createdAt:desc");

  const [activeFilters, setActiveFilters] = useState([
    { id: "1", label: "Clothing" },
    ...(maxPrice ? [{ id: "2", label: `Under $${maxPrice}` }] : []),
  ]);

  const removeFilter = (id: string) => {
    setActiveFilters((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <header className="mb-12 flex flex-col items-end justify-between gap-6 md:flex-row">
      <div>
        <h1 className="mb-4 text-4xl font-medium tracking-tighter capitalize lg:text-6xl">
          {categoryName.replace("-", " ")}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-xs tracking-widest text-on-surface-variant uppercase">
          <span className="font-bold text-on-surface">
            {totalProducts} Products
          </span>
          <span className="h-1px hidden w-8 bg-outline-variant sm:block"></span>

          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter) => (
              <span
                key={filter.id}
                className="flex items-center gap-2 rounded-full bg-surface-container-low px-3 py-1"
              >
                {filter.label}
                <Button
                  variant="ghost"
                  size="none"
                  onClick={() => removeFilter(filter.id)}
                  className="flex cursor-pointer items-center justify-center p-0.5 transition-colors hover:text-primary"
                  aria-label={`Remove filter ${filter.label}`}
                >
                  <X size={12} strokeWidth={2} />
                </Button>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex w-full flex-wrap items-center justify-between gap-x-8 gap-y-4 border-b border-outline-variant/30 pb-2 md:w-auto md:justify-end">
        <Select
          labelPrefix="Sort:"
          options={SORT_OPTIONS}
          value={currentSort}
          onChange={setCurrentSort}
        />

        <div className="flex shrink-0 items-center gap-4">
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
