import React from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { Variant } from "@/types";
import { ProductVariantsTable } from "../ProductVariantsTable";

export interface ColorOption {
  name: string;
  hex: string;
}

export const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

export const COMMON_COLORS: ColorOption[] = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Navy", hex: "#1B2A4A" },
  { name: "Grey", hex: "#808080" },
  { name: "Beige", hex: "#D2B48C" },
  { name: "Brown", hex: "#8B4513" },
  { name: "Red", hex: "#CC0000" },
  { name: "Green", hex: "#2D6A2D" },
  { name: "Blue", hex: "#1A4B8C" },
  { name: "Camel", hex: "#C19A6B" },
];

interface VariantGeneratorSectionProps {
  selectedSizes: string[];
  selectedColors: ColorOption[];
  baseStock: number;
  onToggleSize: (size: string) => void;
  onToggleColor: (color: ColorOption) => void;
  onAddCustomColor: () => void;
  onBaseStockChange: (stock: number) => void;
  onGenerateVariants: () => void;
  variants: Partial<Variant>[];
  onVariantsChange: (variants: Partial<Variant>[]) => void;
  errors?: Record<string, string>;
}

export const VariantGeneratorSection: React.FC<
  VariantGeneratorSectionProps
> = ({
  selectedSizes,
  selectedColors,
  baseStock,
  onToggleSize,
  onToggleColor,
  onAddCustomColor,
  onBaseStockChange,
  onGenerateVariants,
  variants,
  onVariantsChange,
  errors,
}) => {
  return (
    <section className="space-y-8">
      <div className="mt-6 border-t border-zinc-100 pt-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold tracking-widest text-zinc-900 uppercase">
              Curate Color Palette
            </h3>
            <p className="mt-1 text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase">
              Select archival shades and sizes to manifest all combinations
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8 rounded-2xl border border-zinc-100 bg-zinc-50/50 p-8">
        {/* Size Selection */}
        <div className="space-y-3">
          <label className="block text-[10px] font-black tracking-widest text-zinc-400 uppercase">
            Select Archival Sizes
          </label>
          <div className="flex flex-wrap gap-2">
            {SIZE_OPTIONS.map((size) => (
              <Button
                type="button"
                variant="none"
                size="none"
                key={size}
                onClick={() => onToggleSize(size)}
                className={cn(
                  "rounded-lg border px-4 py-2 text-[10px] font-bold tracking-widest uppercase transition-all duration-300",
                  selectedSizes.includes(size)
                    ? "scale-105 border-black bg-black text-white shadow-md"
                    : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-400 hover:bg-zinc-50"
                )}
              >
                {size}
              </Button>
            ))}
          </div>
        </div>

        {/* Color Selection */}
        <div className="space-y-3">
          <label className="block text-[10px] font-black tracking-widest text-zinc-400 uppercase">
            Curate Color Palette
          </label>
          <div className="flex flex-wrap gap-2">
            {COMMON_COLORS.map((color) => (
              <Button
                type="button"
                variant="none"
                size="none"
                key={color.name}
                onClick={() => onToggleColor(color)}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-all duration-300",
                  selectedColors.find((c) => c.name === color.name)
                    ? "scale-105 border-black bg-white text-black shadow-md"
                    : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-400"
                )}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full border border-zinc-200"
                  style={{ backgroundColor: color.hex }}
                />
                {color.name}
              </Button>
            ))}
          </div>

          {/* Custom color input */}
          <div className="flex gap-3 pt-2">
            <input
              type="text"
              placeholder="Custom label..."
              className="flex-1 rounded-lg border border-zinc-200 px-4 py-2 text-[10px] font-bold tracking-widest uppercase outline-none focus:ring-1 focus:ring-black"
              id="custom-color-name"
            />
            <input
              type="color"
              className="h-10 w-10 cursor-pointer rounded-lg border border-zinc-200 p-1"
              id="custom-color-hex"
              defaultValue="#000000"
            />
            <Button
              type="button"
              variant="outline"
              onClick={onAddCustomColor}
              className="h-10 px-4 text-[10px] font-bold tracking-widest uppercase"
            >
              Add
            </Button>
          </div>
        </div>

        {/* Generator Action */}
        <div className="flex items-center gap-4 border-t border-zinc-100 pt-4">
          <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-2">
            <label className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">
              Inventory base:
            </label>
            <input
              type="number"
              min="0"
              value={baseStock}
              onChange={(e) => onBaseStockChange(parseInt(e.target.value) || 0)}
              className="w-12 border-none p-0 text-center text-xs font-bold outline-none focus:ring-0"
            />
          </div>
          <Button
            type="button"
            variant="primary"
            onClick={onGenerateVariants}
            disabled={selectedSizes.length === 0 || selectedColors.length === 0}
            className="h-11 flex-1 py-4 text-[10px] font-black tracking-[0.2em] uppercase shadow-xl shadow-black/5"
          >
            Manifest {selectedSizes.length * selectedColors.length} Variations
          </Button>
        </div>
      </div>

      <ProductVariantsTable
        variants={variants}
        onChange={onVariantsChange}
        errors={errors}
      />
    </section>
  );
};
