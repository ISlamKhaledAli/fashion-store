"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ProductImage } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "../ui/Button";
import { ImageLightbox } from "./ImageLightbox";

interface ImageGalleryProps {
  images: ProductImage[];
}

export const ImageGallery = ({ images }: ImageGalleryProps) => {
  const [activeImage, setActiveImage] = useState(
    images.find((img) => img.isMain) || images[0]
  );
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const activeIndex = images.findIndex((img) => img.id === activeImage.id);

  return (
    <div className="space-y-6">
      {/* Main Image Container */}
      <div 
        onClick={() => setIsLightboxOpen(true)}
        className="w-full flex items-center justify-center bg-[#f8f8f6] aspect-[3/4] max-h-[620px] overflow-hidden rounded-[4px] cursor-zoom-in relative group"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeImage.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full p-4"
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

      {/* Thumbnails */}
      <div className="flex flex-wrap gap-2">
        {images.slice(0, 5).map((img) => (
          <Button
            key={img.id}
            variant="none"
            size="none"
            onClick={() => setActiveImage(img)}
            className={cn(
              "w-[80px] h-[100px] bg-[#f8f8f6] rounded-[4px] overflow-hidden cursor-pointer transition-opacity duration-300 border",
              activeImage.id === img.id ? "border-[#1a1a1a]" : "border-transparent hover:opacity-70"
            )}
            aria-label="View product image"
          >
            <Image
              src={img.url}
              alt="Thumbnail"
              width={80}
              height={100}
              className="w-full h-full object-contain"
            />
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
