"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: { url: string; alt?: string; isMain?: boolean }[];
}

export const ProductGallery = ({ images }: ProductGalleryProps) => {
  const [activeImage, setActiveImage] = useState(
    images.findIndex((img) => img.isMain) !== -1 ? images.findIndex((img) => img.isMain) : 0
  );

  return (
    <div className="space-y-6">
      {/* Main Image */}
      <div className="aspect-square bg-surface-container-low overflow-hidden relative group cursor-zoom-in">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeImage}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full relative"
          >
            <Image
              src={images[activeImage]?.url}
              alt={images[activeImage]?.alt || "Product image"}
              fill
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-cover transition-transform duration-[1.2s] cinematic-ease group-hover:scale-110"
              priority
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-5 gap-4">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setActiveImage(idx)}
            className={cn(
              "aspect-square bg-surface-container-low overflow-hidden relative border transition-all duration-300",
              activeImage === idx ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
            )}
          >
            <Image
              src={img.url}
              alt={img.alt || `Thumbnail ${idx + 1}`}
              fill
              sizes="10vw"
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};
