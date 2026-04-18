"use client";

import React from "react";
import { Variant } from "@/types";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Trash2, Plus } from "lucide-react";
import ColorPicker from "./ColorPicker";

interface ProductVariantsTableProps {
  variants: Partial<Variant>[];
  onChange: (variants: Partial<Variant>[]) => void;
  errors?: Record<string, string>;
}

const VariantRow = ({ variant, index, onUpdate, onRemove, errors }: { variant: Partial<Variant>; index: number; onUpdate: (index: number, field: keyof Variant, value: string | number | undefined) => void; onRemove: (index: number) => void; errors?: Record<string, string> }) => {
  return (
    <tr className="group hover:bg-zinc-50 transition">
      <td className="px-4 py-3">
        <input
          value={variant.size || ""}
          onChange={(e) => onUpdate(index, "size", e.target.value)}
          placeholder="S, M, L"
          className="w-full py-2 bg-transparent border-none focus:outline-none focus:ring-0 text-sm text-zinc-900"
        />
      </td>
      <td className="px-4 py-3">
        <Input
          value={variant.color || ""}
          onChange={(e) => onUpdate(index, "color", e.target.value)}
          placeholder="Black"
          className="w-full py-2 bg-transparent border-transparent hover:border-zinc-200 focus:bg-white focus:border-zinc-300 transition-all text-sm text-zinc-900"
        />
      </td>
      <td className="px-4 py-3">
        <ColorPicker
          value={variant.colorHex || "#000000"}
          onChange={(val) => onUpdate(index, "colorHex", val)}
        />
      </td>
      <td className="px-4 py-3">
        <Input
          type="number"
          value={variant.stock ?? 0}
          onChange={(e) => onUpdate(index, "stock", parseInt(e.target.value) || 0)}
          className="w-24 py-2 bg-transparent border-transparent hover:border-zinc-200 focus:bg-white focus:border-zinc-300 transition-all text-center font-bold text-sm text-zinc-900"
        />
      </td>
      <td className="px-4 py-3">
        <Input
          value={variant.sku || ""}
          onChange={(e) => onUpdate(index, "sku", e.target.value)}
          placeholder="SKU-001"
          className="w-full py-2 font-mono bg-transparent border-transparent hover:border-zinc-200 focus:bg-white focus:border-zinc-300 transition-all text-sm text-zinc-900"
          error={errors?.[`variant_${index}_sku`]}
        />
      </td>
      <td className="px-4 py-3 text-right">
        <Button
          type="button"
          variant="icon"
          size="none"
          onClick={() => onRemove(index)}
          className="text-zinc-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all active:scale-95"
          icon={<Trash2 size={16} />}
        />
      </td>
    </tr>
  );
};

export const ProductVariantsTable = ({ variants, onChange, errors }: ProductVariantsTableProps) => {
  const addRow = () => {
    onChange([
      ...variants,
      { size: "", color: "", colorHex: "#000000", stock: 0, sku: "" },
    ]);
  };

  const removeRow = (index: number) => {
    onChange(variants.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, field: keyof Variant, value: string | number | undefined) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Variant Matrix</h4>
        <Button 
          variant="outline" 
          size="sm" 
          type="button"
          onClick={addRow}
          className="text-[10px] font-bold uppercase tracking-widest rounded-lg"
          icon={<Plus size={14} />}
        >
          Add Variant
        </Button>
      </div>

      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-300 rounded-xl border border-zinc-100 bg-white shadow-sm">
        <table className="w-full text-left align-middle border-collapse min-w-[600px]">
          <thead className="bg-zinc-50/50 text-xs uppercase tracking-wide text-zinc-500 border-b border-zinc-100">
            <tr>
              <th className="px-4 py-3 font-medium">Size</th>
              <th className="px-4 py-3 font-medium">Color</th>
              <th className="px-4 py-3 font-medium">Hex Code</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">SKU Reference</th>
              <th className="px-4 py-3 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {variants.map((variant, index) => (
              <VariantRow 
                key={variant.id || `new-${index}`}
                variant={variant}
                index={index}
                onUpdate={updateRow}
                onRemove={removeRow}
                errors={errors}
              />
            ))}
            {variants.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-xs text-zinc-400 italic">
                  No variants defined. Utilize variants to manage size and color complexity.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};



