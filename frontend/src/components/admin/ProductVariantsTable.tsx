"use client";

import React from "react";
import type { Variant } from "@/types";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Trash2, Plus } from "lucide-react";
import ColorPicker from "./ColorPicker";

interface ProductVariantsTableProps {
  variants: Partial<Variant>[];
  onChange: (variants: Partial<Variant>[]) => void;
  errors?: Record<string, string>;
}

const VariantRow = ({
  variant,
  index,
  onUpdate,
  onRemove,
  errors,
}: {
  variant: Partial<Variant>;
  index: number;
  onUpdate: (
    index: number,
    field: keyof Variant,
    value: string | number | undefined
  ) => void;
  onRemove: (index: number) => void;
  errors?: Record<string, string>;
}) => {
  return (
    <tr className="group transition hover:bg-zinc-50">
      <td className="px-4 py-3">
        <input
          value={variant.size || ""}
          onChange={(e) => onUpdate(index, "size", e.target.value)}
          placeholder="S, M, L"
          className="w-full border-none bg-transparent py-2 text-sm text-zinc-900 focus:ring-0 focus:outline-none"
        />
      </td>
      <td className="px-4 py-3">
        <Input
          value={variant.color || ""}
          onChange={(e) => onUpdate(index, "color", e.target.value)}
          placeholder="Black"
          className="w-full border-transparent bg-transparent py-2 text-sm text-zinc-900 transition-all hover:border-zinc-200 focus:border-zinc-300 focus:bg-white"
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
          onChange={(e) =>
            onUpdate(index, "stock", parseInt(e.target.value) || 0)
          }
          className="w-24 border-transparent bg-transparent py-2 text-center text-sm font-bold text-zinc-900 transition-all hover:border-zinc-200 focus:border-zinc-300 focus:bg-white"
        />
      </td>
      <td className="px-4 py-3">
        <Input
          value={variant.sku || ""}
          onChange={(e) => onUpdate(index, "sku", e.target.value)}
          placeholder="SKU-001"
          className="w-full border-transparent bg-transparent py-2 font-mono text-sm text-zinc-900 transition-all hover:border-zinc-200 focus:border-zinc-300 focus:bg-white"
          error={errors?.[`variant_${index}_sku`]}
        />
      </td>
      <td className="px-4 py-3 text-right">
        <Button
          type="button"
          variant="icon"
          size="none"
          onClick={() => onRemove(index)}
          className="rounded-full p-2 text-zinc-300 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 active:scale-95"
          icon={<Trash2 size={16} />}
        />
      </td>
    </tr>
  );
};

export const ProductVariantsTable = ({
  variants,
  onChange,
  errors,
}: ProductVariantsTableProps) => {
  const addRow = () => {
    onChange([
      ...variants,
      { size: "", color: "", colorHex: "#000000", stock: 0, sku: "" },
    ]);
  };

  const removeRow = (index: number) => {
    onChange(variants.filter((_, i) => i !== index));
  };

  const updateRow = (
    index: number,
    field: keyof Variant,
    value: string | number | undefined
  ) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
          Variant Matrix
        </h4>
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={addRow}
          className="rounded-lg text-[10px] font-bold tracking-widest uppercase"
          icon={<Plus size={14} />}
        >
          Add Variant
        </Button>
      </div>

      <div className="scrollbar-thin scrollbar-thumb-zinc-300 overflow-x-auto rounded-xl border border-zinc-100 bg-white shadow-sm">
        <table className="w-full min-w-[600px] border-collapse text-left align-middle">
          <thead className="border-b border-zinc-100 bg-zinc-50/50 text-xs tracking-wide text-zinc-500 uppercase">
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
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-xs text-zinc-400 italic"
                >
                  No variants defined. Utilize variants to manage size and color
                  complexity.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
