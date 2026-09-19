"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { ProductImage } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "../ui/Button";
import { ImageLightbox } from "./ImageLightbox";

interface ImageGalleryProps {
  images: ProductImage[];
  selectedColor?: string | null;
  productName: string;
}

export const ImageGallery = ({
  images,
  selectedColor,
  productName,
}: ImageGalleryProps) => {
  const [activeImage, setActiveImage] = useState<ProductImage>(
    images.find((img) => img.isMain) || images[0]
  );
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const visibleImages = React.useMemo(() => {
    if (!selectedColor) {
      return images.filter((img) => !img.variantColor || img.isMain);
    }

    const colorImages = images.filter(
      (img) => img.variantColor?.toLowerCase() === selectedColor.toLowerCase()
    );

    if (colorImages.length === 0) {
      return images.filter((img) => !img.variantColor);
    }

    return colorImages;
  }, [images, selectedColor]);

  React.useEffect(() => {
    if (visibleImages.length > 0) {
      setActiveImage(visibleImages[0]);
    }
  }, [visibleImages]);

  const activeIndex = images.findIndex((img) => img.id === activeImage?.id);

  return (
    <div className="space-y-6">
      {/* Main Image Container */}
      <div
        onClick={() => setIsLightboxOpen(true)}
        className="group relative flex aspect-[3/4] max-h-[620px] w-full cursor-zoom-in items-center justify-center overflow-hidden rounded-[4px] bg-[#f8f8f6]"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedColor}-${activeImage?.id}`}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="h-full w-full p-4"
          >
            {activeImage?.url ? (
              <Image
                id="pdp-main-image"
                src={activeImage.url}
                alt={productName}
                fill
                className="cinematic-reveal scale-[1.01] object-contain transition-transform duration-700 group-hover:scale-105"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-surface-container-low">
                <span className="material-symbols-outlined text-3xl text-zinc-400">
                  checkroom
                </span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Thumbnails */}
      <div className="flex flex-wrap gap-2">
        {visibleImages.map((img) => (
          <Button
            key={img.id}
            variant="none"
            size="none"
            onClick={() => setActiveImage(img)}
            className={cn(
              "h-[100px] w-[80px] cursor-pointer overflow-hidden rounded-[4px] border bg-[#f8f8f6] transition-opacity duration-300",
              activeImage?.id === img.id
                ? "border-[#1a1a1a]"
                : "border-transparent hover:opacity-70"
            )}
            aria-label="View product image"
          >
            {img.url ? (
              <Image
                src={img.url}
                alt="Thumbnail"
                width={80}
                height={100}
                className="h-full w-full object-contain"
              />
            ) : null}
          </Button>
        ))}
      </div>

      <ImageLightbox
        images={images}
        isOpen={isLightboxOpen}
        currentIndex={activeIndex !== -1 ? activeIndex : 0}
        onClose={() => setIsLightboxOpen(false)}
        onNavigate={(index) => setActiveImage(images[index])}
      />
    </div>
  );
};
