import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { categoryApi, brandApi, productApi } from "@/lib/api";
import { Category } from "@/types";
import { Button } from "../ui/Button";

export interface FilterState {
  category: string[];
  brand: string[];
  size: string[];
  color: string[];
  minPrice: number;
  maxPrice: number;
  sort: string;
}

export type FilterAction =
  | { type: "toggle_category"; payload: string }
  | { type: "toggle_brand"; payload: string }
  | { type: "toggle_color"; payload: string }
  | { type: "set_max_price"; payload: number }
  | { type: "set_sort"; payload: string }
  | { type: "reset" }
  | { type: "sync_from_url"; payload: Partial<FilterState> };


interface FilterSidebarProps {
  state: FilterState;
  dispatch: React.Dispatch<FilterAction>;
  isOpen?: boolean;
  onClose?: () => void;
  isMobile?: boolean;
}

export const FilterSidebar = ({ state, dispatch, isOpen, onClose, isMobile }: FilterSidebarProps) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [colors, setColors] = useState<{ name: string; class: string; hex: string }[]>([]);
  
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        // Fetch Categories
        const catRes = await categoryApi.getAll();
        if (catRes.data.success) {
          setCategories(catRes.data.data.map((c: Category) => c.name));
        }

        // Fetch Brands
        const brandRes = await brandApi.getAll();
        if (brandRes.data.success) {
          setBrands(brandRes.data.data);
        }

        // Fetch Product Filters (Colors)
        const filterRes = await productApi.getFilters();
        if (filterRes.data.success) {
          const rawColors = filterRes.data.data.colors;
          // Deduplicate by normalized color name as requested
          const uniqueColors = rawColors.filter((color: { name: string; hex: string }, index: number, self: { name: string; hex: string }[]) => 
            index === self.findIndex((c: { name: string; hex: string }) => 
              c.name.toLowerCase().trim() === color.name.toLowerCase().trim()
            )
          );
          
          setColors(uniqueColors.map((c: { name: string; hex: string }) => ({
            name: c.name,
            class: "",
            hex: c.hex
          })));
        }
      } catch (error) {
        console.error("Failed to fetch filter data:", error);
      }
    };
    fetchFilterData();
  }, []);

  const content = (
    <div className="space-y-8 flex flex-col h-full pb-6">
      <div className="space-y-1">
        <h2 className="font-headline text-sm uppercase tracking-widest text-on-surface-stone-900 font-bold text-stone-50">
          FILTER
        </h2>
        <p className="text-[10px] uppercase tracking-widest text-stone-400">
          Refine Selection
        </p>
      </div>

      <div className="space-y-8 flex-1">
        {/* Categories */}
        <section>
          <h3 className="text-[11px] font-bold uppercase tracking-widest mb-4">Categories</h3>
          <div className="flex flex-col gap-3">
            {categories.map((cat) => (
              <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={state.category.includes(cat)}
                  onChange={() => dispatch({ type: "toggle_category", payload: cat })}
                  className="w-4 h-4 border-outline-variant text-primary focus:ring-primary rounded-sm bg-transparent"
                />
                <span className={cn(
                  "text-xs uppercase tracking-wider transition-colors",
                  state.category.includes(cat) ? "text-stone-900 dark:text-stone-50" : "text-stone-400 group-hover:text-stone-900"
                )}>
                  {cat}
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* Brands */}
        {brands.length > 0 && (
          <section>
            <h3 className="text-[11px] font-bold uppercase tracking-widest mb-4">Brands</h3>
            <div className="flex flex-col gap-3">
              {brands.map((brand) => (
                <label key={brand.id} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={state.brand.includes(brand.slug)}
                    onChange={() => dispatch({ type: "toggle_brand", payload: brand.slug })}
                    className="w-4 h-4 border-outline-variant text-primary focus:ring-primary rounded-sm bg-transparent"
                  />
                  <span className={cn(
                    "text-xs uppercase tracking-wider transition-colors",
                    state.brand.includes(brand.slug) ? "text-stone-900 dark:text-stone-50" : "text-stone-400 group-hover:text-stone-900"
                  )}>
                    {brand.name}
                  </span>
                </label>
              ))}
            </div>
          </section>
        )}

        {/* Price Range */}
        <section>
          <h3 className="text-[11px] font-bold uppercase tracking-widest mb-4">Price Range</h3>
          <input 
            type="range"
            min="0"
            max="2000"
            value={state.maxPrice}
            onChange={(e) => dispatch({ type: "set_max_price", payload: parseInt(e.target.value) })}
            className="w-full h-1 bg-surface-container-highest rounded-full appearance-none cursor-pointer accent-primary" 
          />
          <div className="flex justify-between mt-2 text-[10px] text-stone-500">
            <span>$0</span>
            <span>${state.maxPrice}+</span>
          </div>
        </section>

        {/* Colors */}
        <section className="max-w-full pb-4">
          <h3 className="text-[11px] font-bold uppercase tracking-widest mb-4">Colors</h3>
          <div className="flex flex-wrap gap-3 p-1">
            {colors.map((color) => {
              const isSelected = state.color.some(c => c.toLowerCase().trim() === color.name.toLowerCase().trim());
              return (
                <Button 
                  key={color.name}
                  variant="none"
                  size="none"
                  onClick={() => dispatch({ type: "toggle_color", payload: color.name })}
                  className={cn(
                    "w-6 h-6 rounded-full ring-1 transition-all hover:scale-110 cursor-pointer",
                    isSelected ? "ring-offset-2 ring-primary" : "ring-stone-200"
                  )}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                  aria-label={`Filter by color ${color.name}`}
                />
              );
            })}
          </div>
        </section>
      </div>


    </div>
  );

  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-60"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 bg-surface z-70 rounded-t-3xl p-8 max-h-[85vh] overflow-y-auto"
            >
              {content}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <aside className="sticky top-20 h-[calc(100vh-5rem)] w-64 shrink-0 flex-col p-8 gap-6 bg-stone-50 dark:bg-stone-900 border-none hidden lg:flex overflow-y-auto premium-scrollbar">
      {content}
    </aside>
  );
};
