"use client";

import React, { memo } from "react";
import { motion } from "framer-motion";
import { Upload, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { ProductFormImage } from "./types";

export interface MediaSectionProps {
  images: ProductFormImage[];
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSetMain: (idx: number) => void;
  onRemove: (idx: number) => void;
  uniqueColors: string[];
  onColorChange: (imageId: string, color: string | null) => void;
  getColorHex: (colorName: string) => string;
}

export const MediaSection = memo(
  ({
    images,
    onUpload,
    onSetMain,
    onRemove,
    uniqueColors,
    onColorChange,
    getColorHex,
  }: MediaSectionProps) => (
    <section className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="h-[1px] flex-1 bg-zinc-100" />
        <h4 className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase">
          Archival Imagery
        </h4>
        <div className="h-[1px] flex-1 bg-zinc-100" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {images.map((img, idx: number) => (
          <motion.div
            layout
            key={img.publicId || img.id || idx}
            className={cn(
              "group relative flex flex-col overflow-hidden rounded-sm border-2 bg-zinc-50 shadow-sm transition-all duration-500",
              img.isMain
                ? "z-10 scale-[1.02] border-zinc-950"
                : "border-transparent"
            )}
          >
            <div className="group/img relative aspect-[3/4] overflow-hidden">
              <img
                src={img.url}
                className="h-full w-full object-cover"
                alt="Product piece"
              />
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover/img:opacity-100">
                <Button
                  type="button"
                  variant="none"
                  size="none"
                  onClick={() => onSetMain(idx)}
                  className="rounded-full bg-white p-2 text-zinc-950 shadow-lg transition-transform hover:scale-110"
                  icon={
                    <Check
                      size={14}
                      className={img.isMain ? "text-green-600" : ""}
                    />
                  }
                />
                <Button
                  type="button"
                  variant="none"
                  size="none"
                  onClick={() => onRemove(idx)}
                  className="rounded-full bg-white p-2 text-red-500 shadow-lg transition-transform hover:scale-110"
                  icon={<Trash2 size={14} />}
                />
              </div>
              <div className="absolute top-2 left-2 z-20">
                <Button
                  type="button"
                  variant="none"
                  size="none"
                  onClick={() => onSetMain(idx)}
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[7px] font-black tracking-widest uppercase transition-all duration-300",
                    img.isMain
                      ? "scale-105 bg-black text-white shadow-lg"
                      : "bg-zinc-200 text-zinc-600 opacity-0 group-hover/img:opacity-100 hover:bg-zinc-300"
                  )}
                >
                  Primary View
                </Button>
              </div>

              {/* Color dot indicator */}
              {img.variantColor && (
                <div
                  className="absolute top-2 right-2 z-20 h-3 w-3 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: getColorHex(img.variantColor) }}
                  title={img.variantColor}
                />
              )}
            </div>

            <div className="space-y-2 border-t border-zinc-100 bg-white p-2">
              <select
                value={img.variantColor || ""}
                onChange={(e) =>
                  onColorChange(img.id || img.publicId, e.target.value || null)
                }
                className="w-full cursor-pointer appearance-none rounded border-none bg-zinc-50 px-2 py-1.5 text-[10px] font-bold tracking-wider uppercase outline-none focus:ring-1 focus:ring-black"
              >
                <option value="">All Colors</option>
                {uniqueColors.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>

              <span className="block text-center text-[9px] font-bold tracking-widest text-zinc-400 uppercase">
                {img.variantColor ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: getColorHex(img.variantColor) }}
                    />
                    {img.variantColor}
                  </span>
                ) : (
                  "General View"
                )}
              </span>
            </div>
          </motion.div>
        ))}
        <label className="group aspect-[3/4] cursor-pointer rounded-sm border-2 border-dashed border-zinc-200 transition-all duration-500 hover:border-zinc-950 hover:bg-zinc-50">
          <input
            type="file"
            className="hidden"
            onChange={onUpload}
            accept="image/*"
          />
          <div className="flex h-full w-full items-center justify-center p-4">
            <div className="flex flex-col items-center gap-2 text-center">
              <Upload
                size={24}
                strokeWidth={1.5}
                className="text-zinc-300 transition-colors group-hover:text-zinc-950"
              />
              <span className="text-xs tracking-[0.2em] text-zinc-400 group-hover:text-zinc-950">
                Add Perspective
              </span>
            </div>
          </div>
        </label>
      </div>
    </section>
  )
);

MediaSection.displayName = "MediaSection";
