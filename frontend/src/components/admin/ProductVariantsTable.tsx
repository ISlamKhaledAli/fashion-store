"use client";

import React from "react";
import { Variant } from "@/types";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Trash2, Plus } from "lucide-react";

interface ProductVariantsTableProps {
  variants: Partial<Variant>[];
  onChange: (variants: Partial<Variant>[]) => void;
}

export const ProductVariantsTable = ({ variants, onChange }: ProductVariantsTableProps) => {
  const addRow = () => {
    onChange([
      ...variants,
      { size: "", color: "", colorHex: "#000000", stock: 0, sku: "" },
    ]);
  };

  const removeRow = (index: number) => {
    onChange(variants.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, field: keyof Variant, value: any) => {
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
          onClick={addRow}
          className="text-[10px] font-bold uppercase tracking-widest rounded-lg"
          icon={<Plus size={14} />}
        >
          Add Variant
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-100 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead className="bg-zinc-50/50 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 border-b border-zinc-100">
            <tr>
              <th className="px-6 py-4">Size</th>
              <th className="px-6 py-4">Color</th>
              <th className="px-6 py-4">Hex Code</th>
              <th className="px-6 py-4">Stock</th>
              <th className="px-6 py-4">SKU Reference</th>
              <th className="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {variants.map((variant, index) => (
              <tr key={index} className="group hover:bg-zinc-50/50 transition-colors">
                <td className="px-6 py-4">
                  <Input
                    value={variant.size}
                    onChange={(e) => updateRow(index, "size", e.target.value)}
                    placeholder="S, M, L"
                    className="w-full py-2 bg-transparent border-transparent hover:border-zinc-200 focus:bg-white"
                  />
                </td>
                <td className="px-6 py-4">
                  <Input
                    value={variant.color}
                    onChange={(e) => updateRow(index, "color", e.target.value)}
                    placeholder="Black"
                    className="w-full py-2 bg-transparent border-transparent hover:border-zinc-200 focus:bg-white"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={variant.colorHex}
                      onChange={(e) => updateRow(index, "colorHex", e.target.value)}
                      className="w-8 h-8 rounded-full overflow-hidden border-2 border-zinc-100 p-0 cursor-pointer shadow-sm hover:scale-110 transition-transform"
                    />
                    <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase">{variant.colorHex}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Input
                    type="number"
                    value={variant.stock}
                    onChange={(e) => updateRow(index, "stock", parseInt(e.target.value))}
                    className="w-24 py-2 bg-transparent border-transparent hover:border-zinc-200 focus:bg-white text-center font-bold"
                  />
                </td>
                <td className="px-6 py-4">
                  <Input
                    value={variant.sku}
                    onChange={(e) => updateRow(index, "sku", e.target.value)}
                    placeholder="SKU-001"
                    className="w-full py-2 font-mono bg-transparent border-transparent hover:border-zinc-200 focus:bg-white"
                  />
                </td>
                <td className="px-6 py-4 text-right">
                  <Button
                    variant="icon"
                    size="none"
                    onClick={() => removeRow(index)}
                    className="text-zinc-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all active:scale-95"
                    icon={<Trash2 size={16} />}
                  />
                </td>
              </tr>
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
