"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ProductImage } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "../ui/Button";

interface ImageGalleryProps {
  images: ProductImage[];
}

export const ImageGallery = ({ images }: ImageGalleryProps) => {
  const [activeImage, setActiveImage] = useState(
    images.find((img) => img.isMain) || images[0]
  );

  return (
    <div className="space-y-6">
      <div className="w-full aspect-[3/4] max-h-[400px] lg:max-h-[520px] bg-surface-container-low overflow-hidden group cursor-zoom-in relative mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeImage.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            <Image
              src={activeImage.url}
              alt="Product View"
              fill
              className="object-contain cinematic-reveal scale-[1.01] group-hover:scale-105 transition-transform duration-700"
              priority
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {images.slice(0, 5).map((img) => (
          <Button
            key={img.id}
            variant="none"
            size="none"
            onClick={() => setActiveImage(img)}
            className={cn(
              "aspect-square bg-surface-container-low overflow-hidden cursor-pointer transition-all duration-300 border",
              activeImage.id === img.id ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
            )}
            aria-label="View product image"
          >
            <Image
              src={img.url}
              alt="Thumbnail"
              width={200}
              height={200}
              className="w-full h-full object-cover hover:scale-105 transition-transform"
            />
          </Button>
        ))}
      </div>
    </div>
  );
};
