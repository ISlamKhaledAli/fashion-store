"use client";

import React from "react";
import { X } from "lucide-react";
import { FilterState, FilterAction } from "./FilterSidebar";

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

  state.color.forEach((color) => {
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
    <div className="flex flex-wrap gap-2 mb-8 items-center">
      <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mr-2">
        Active:
      </span>
      {activeItems.map((item, idx) => (
        <span 
          key={idx} 
          className="bg-surface-container-low px-3 py-1 flex items-center gap-2 rounded-full text-[10px] uppercase tracking-wider text-on-surface font-medium border border-outline-variant/10"
        >
          {item.label}
          <button 
            onClick={item.onRemove} 
            className="hover:text-primary transition-colors flex items-center justify-center p-0.5"
          >
            <X size={10} strokeWidth={2.5} />
          </button>
        </span>
      ))}
      <button 
        onClick={() => dispatch({ type: "reset" })}
        className="text-[10px] uppercase underline tracking-widest text-stone-400 hover:text-primary ml-2"
      >
        Clear All
      </button>
    </div>
  );
};
