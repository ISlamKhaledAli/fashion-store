"use client";

import React from "react";
import { X } from "lucide-react";
import type { FilterState, FilterAction } from "./FilterSidebar";
import { Button } from "../ui/Button";

interface ActiveFiltersProps {
  state: FilterState;
  dispatch: React.Dispatch<FilterAction>;
}

export const ActiveFilters = ({ state, dispatch }: ActiveFiltersProps) => {
  const activeItems: { label: string; onRemove: () => void }[] = [];

  state.category.forEach((cat) => {
    activeItems.push({
      label: cat,
      onRemove: () => dispatch({ type: "toggle_category", payload: cat }),
    });
  });

  state.brand.forEach((brand) => {
    activeItems.push({
      label: brand,
      onRemove: () => dispatch({ type: "toggle_brand", payload: brand }),
    });
  });

  const uniqueSelectedColors = Array.from(
    new Set(state.color.map((c) => c.toLowerCase().trim()))
  );

  uniqueSelectedColors.forEach((color) => {
    activeItems.push({
      label: color,
      onRemove: () => dispatch({ type: "toggle_color", payload: color }),
    });
  });

  if (state.maxPrice < 2000) {
    activeItems.push({
      label: `Under $${state.maxPrice}`,
      onRemove: () => dispatch({ type: "set_max_price", payload: 2000 }),
    });
  }

  if (activeItems.length === 0) return null;

  return (
    <div className="mb-8 flex flex-wrap items-center gap-2">
      <span className="mr-2 text-[10px] font-bold tracking-widest text-stone-400 uppercase">
        Active:
      </span>
      {activeItems.map((item, idx) => (
        <span
          key={idx}
          className="flex items-center gap-2 rounded-full border border-outline-variant/10 bg-surface-container-low px-3 py-1 text-[10px] font-medium tracking-wider text-on-surface uppercase"
        >
          {item.label}
          <Button
            variant="ghost"
            size="none"
            onClick={item.onRemove}
            className="flex items-center justify-center p-0.5 transition-colors hover:text-primary"
            aria-label={`Remove filter ${item.label}`}
          >
            <X size={10} strokeWidth={2.5} />
          </Button>
        </span>
      ))}
      <Button
        variant="ghost"
        size="none"
        onClick={() => dispatch({ type: "reset" })}
        className="ml-2 text-[10px] tracking-widest text-stone-400 uppercase underline hover:text-primary"
      >
        Clear All
      </Button>
    </div>
  );
};
