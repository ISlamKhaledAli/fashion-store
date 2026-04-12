"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ProductImage } from "@/types";

interface ImageLightboxProps {
  images: ProductImage[];
  isOpen: boolean;
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export const ImageLightbox = ({
  images,
  isOpen,
  currentIndex,
  onClose,
  onNavigate,
}: ImageLightboxProps) => {

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") {
        onNavigate((currentIndex - 1 + images.length) % images.length);
      }
      if (e.key === "ArrowRight") {
        onNavigate((currentIndex + 1) % images.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, images.length, onClose, onNavigate]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !images[currentIndex]) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 lg:p-12"
        onClick={onClose}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate((currentIndex - 1 + images.length) % images.length);
          }}
          className="absolute left-4 lg:left-12 text-white p-4 hover:opacity-70 transition-opacity z-10"
          aria-label="Previous image"
        >
          <span className="material-symbols-outlined text-4xl">chevron_left</span>
        </button>

        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} // cinematic ease
          className="relative w-full max-w-3xl h-full max-h-[85vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            src={images[currentIndex].url}
            alt="Fullscreen view"
            fill
            className="object-contain"
            priority
          />
        </motion.div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate((currentIndex + 1) % images.length);
          }}
          className="absolute right-4 lg:right-12 text-white p-4 hover:opacity-70 transition-opacity z-10"
          aria-label="Next image"
        >
          <span className="material-symbols-outlined text-4xl">chevron_right</span>
        </button>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 lg:top-8 lg:right-8 text-white p-4 hover:opacity-70 transition-opacity z-10"
          aria-label="Close fullscreen"
        >
          <span className="material-symbols-outlined text-3xl">close</span>
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
