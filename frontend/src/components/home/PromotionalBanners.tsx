"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from "lucide-react";
import { bannerApi } from "@/lib/api";
import type { Banner } from "@/types";

export const PromotionalBanners: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let isMounted = true;
    bannerApi
      .getBanners()
      .then((res) => {
        if (isMounted && res.data.success && res.data.data) {
          // Sort by position
          const sorted = [...res.data.data].sort(
            (a, b) => a.position - b.position
          );
          setBanners(sorted);
        }
      })
      .catch(() => {
        // Silently fail to avoid disrupting home page experience
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const nextBanner = useCallback(() => {
    if (banners.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const prevBanner = useCallback(() => {
    if (banners.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  // Auto slide every 6 seconds if not paused and more than 1 banner
  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      nextBanner();
    }, 6000);

    return () => clearInterval(timer);
  }, [banners.length, isPaused, nextBanner]);

  if (banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];

  return (
    <section
      className="relative w-full overflow-hidden bg-zinc-950 py-1"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Promotional highlights"
    >
      <div className="relative mx-auto h-[380px] w-full max-w-[1440px] px-4 sm:h-[420px] sm:px-8 lg:h-[460px]">
        <div className="relative h-full w-full overflow-hidden rounded-2xl sm:rounded-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBanner.id}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0"
            >
              {/* Image */}
              <Image
                src={currentBanner.imageUrl}
                alt={currentBanner.title}
                fill
                priority
                sizes="(max-width: 1440px) 100vw, 1440px"
                className="object-cover"
              />

              {/* High Fashion Editorial Gradients */}
              <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/40 to-black/20" />
              <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/40 to-transparent" />

              {/* Content Overlay */}
              <div className="relative z-10 flex h-full flex-col justify-end p-8 sm:p-12 lg:max-w-2xl lg:p-16">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="space-y-3"
                >
                  <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold tracking-widest text-amber-300 uppercase backdrop-blur-xs">
                    <Sparkles size={12} />
                    <span>{currentBanner.badge || "Curated Drop"}</span>
                  </div>

                  <h2 className="font-serif text-2xl font-normal tracking-tight text-white sm:text-3xl lg:text-4xl">
                    {currentBanner.title}
                  </h2>

                  {currentBanner.subtitle && (
                    <p className="line-clamp-2 max-w-lg text-sm leading-relaxed text-zinc-300 sm:text-base">
                      {currentBanner.subtitle}
                    </p>
                  )}

                  <div className="pt-2">
                    <Link
                      href={currentBanner.linkUrl || "/products"}
                      className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-semibold tracking-wider text-zinc-950 uppercase transition-all duration-300 hover:scale-105 hover:bg-zinc-100"
                    >
                      <span>Explore Collection</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows if > 1 banner */}
          {banners.length > 1 && (
            <div className="absolute right-6 bottom-6 z-20 flex items-center gap-2">
              <button
                type="button"
                onClick={prevBanner}
                aria-label="Previous banner"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-xs transition-colors hover:bg-white hover:text-black"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={nextBanner}
                aria-label="Next banner"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-xs transition-colors hover:bg-white hover:text-black"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* Progress Indicators if > 1 banner */}
          {banners.length > 1 && (
            <div className="absolute top-6 right-6 z-20 flex items-center gap-1.5">
              {banners.map((b, idx) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    currentIndex === idx
                      ? "w-8 bg-white"
                      : "w-2 bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
