import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { categoryApi, brandApi, productApi } from "@/lib/api";
import type { Category } from "@/types";
import { Button } from "../ui/Button";
import { Checkbox } from "../ui/Checkbox";

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

export const FilterSidebar = ({
  state,
  dispatch,
  isOpen,
  onClose,
  isMobile,
}: FilterSidebarProps) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<
    { id: string; name: string; slug: string }[]
  >([]);
  const [colors, setColors] = useState<
    { name: string; class: string; hex: string }[]
  >([]);

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        // Fetch Categories
        const catRes = await categoryApi.getAll();
        if (catRes.data.success) {
          const uniqueNames = Array.from(
            new Set(catRes.data.data.map((c: Category) => c.name.trim()))
          );
          setCategories(uniqueNames);
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
          const uniqueColors = rawColors.filter(
            (
              color: { name: string; hex: string },
              index: number,
              self: { name: string; hex: string }[]
            ) =>
              index ===
              self.findIndex(
                (c: { name: string; hex: string }) =>
                  c.name.toLowerCase().trim() ===
                  color.name.toLowerCase().trim()
              )
          );

          setColors(
            uniqueColors.map((c: { name: string; hex: string }) => ({
              name: c.name,
              class: "",
              hex: c.hex,
            }))
          );
        }
      } catch (error) {
        console.error("Failed to fetch filter data:", error);
      }
    };
    fetchFilterData();
  }, []);

  const content = (
    <div className="flex h-full flex-col space-y-8 pb-6">
      <div className="space-y-1">
        <h2 className="text-on-surface-stone-900 font-headline text-sm font-bold tracking-widest text-stone-50 uppercase">
          FILTER
        </h2>
        <p className="text-[10px] tracking-widest text-stone-400 uppercase">
          Refine Selection
        </p>
      </div>

      <div className="flex-1 space-y-8">
        {/* Categories */}
        <section>
          <h3 className="mb-4 text-[11px] font-bold tracking-widest uppercase">
            Categories
          </h3>
          <div className="flex flex-col gap-3">
            {categories.map((cat) => (
              <Checkbox
                key={cat}
                checked={state.category.includes(cat)}
                onCheckedChange={() =>
                  dispatch({ type: "toggle_category", payload: cat })
                }
                label={
                  <span
                    className={cn(
                      "text-xs tracking-wider uppercase transition-colors",
                      state.category.includes(cat)
                        ? "text-stone-900 dark:text-stone-50"
                        : "text-stone-400 group-hover:text-stone-900"
                    )}
                  >
                    {cat}
                  </span>
                }
              />
            ))}
          </div>
        </section>

        {/* Brands */}
        {brands.length > 0 && (
          <section>
            <h3 className="mb-4 text-[11px] font-bold tracking-widest uppercase">
              Brands
            </h3>
            <div className="flex flex-col gap-3">
              {brands.map((brand) => (
                <Checkbox
                  key={brand.id}
                  checked={state.brand.includes(brand.slug)}
                  onCheckedChange={() =>
                    dispatch({ type: "toggle_brand", payload: brand.slug })
                  }
                  label={
                    <span
                      className={cn(
                        "text-xs tracking-wider uppercase transition-colors",
                        state.brand.includes(brand.slug)
                          ? "text-stone-900 dark:text-stone-50"
                          : "text-stone-400 group-hover:text-stone-900"
                      )}
                    >
                      {brand.name}
                    </span>
                  }
                />
              ))}
            </div>
          </section>
        )}

        {/* Price Range */}
        <section>
          <h3 className="mb-4 text-[11px] font-bold tracking-widest uppercase">
            Price Range
          </h3>
          <input
            type="range"
            min="0"
            max="2000"
            value={state.maxPrice}
            onChange={(e) =>
              dispatch({
                type: "set_max_price",
                payload: parseInt(e.target.value),
              })
            }
            className="h-1 w-full cursor-pointer appearance-none rounded-full bg-surface-container-highest accent-primary"
          />
          <div className="mt-2 flex justify-between text-[10px] text-stone-500">
            <span>$0</span>
            <span>${state.maxPrice}+</span>
          </div>
        </section>

        {/* Colors */}
        <section className="max-w-full pb-4">
          <h3 className="mb-4 text-[11px] font-bold tracking-widest uppercase">
            Colors
          </h3>
          <div className="flex flex-wrap gap-3 p-1">
            {colors.map((color) => {
              const isSelected = state.color.some(
                (c) =>
                  c.toLowerCase().trim() === color.name.toLowerCase().trim()
              );
              return (
                <Button
                  key={color.name}
                  variant="none"
                  size="none"
                  onClick={() =>
                    dispatch({ type: "toggle_color", payload: color.name })
                  }
                  className={cn(
                    "h-6 w-6 cursor-pointer rounded-full ring-1 transition-all hover:scale-110",
                    isSelected ? "ring-primary ring-offset-2" : "ring-stone-200"
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
              className="fixed inset-0 z-60 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 z-70 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-surface p-8"
            >
              {content}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <aside className="premium-scrollbar sticky top-20 hidden h-[calc(100vh-5rem)] w-64 shrink-0 flex-col gap-6 overflow-y-auto border-none bg-stone-50 p-8 lg:flex dark:bg-stone-900">
      {content}
    </aside>
  );
};
