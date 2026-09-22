"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { contentApi } from "@/lib/api";
import type { HeroContent, HeroSlide } from "@/types";

const defaultHeroContent: HeroContent = {
  tagline: "Winter / Spring 2026",
  title: "Modern Elegance Redefined",
  description:
    "Architectural silhouettes crafted with uncompromising materials. Built for the modern aesthete who demands form and function in equal measure.",
  ctaText: "Explore Collection",
  ctaLink: "/products",
  secondaryCtaText: "View Lookbook",
  secondaryCtaLink: "/products",
  imageUrl:
    "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=2000&q=85",
  stats: [
    { value: "48h", label: "Express delivery" },
    { value: "100%", label: "Curated archive" },
    { value: "24/7", label: "Style concierge" },
  ],
};

interface HeroProps {
  initialData?: HeroContent;
}

export const Hero = ({ initialData }: HeroProps) => {
  const [data, setData] = useState<HeroContent>(
    () => initialData || defaultHeroContent
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let isMounted = true;
    contentApi
      .getByKey<HeroContent>("home_hero")
      .then((res) => {
        if (isMounted && res.data?.data) {
          setData((prev) => ({ ...prev, ...res.data.data }));
        }
      })
      .catch(() => {
        // graceful degradation to defaultHeroContent
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute slides array: use data.slides if available and non-empty, otherwise construct single slide
  const slides: HeroSlide[] = useMemo(() => {
    if (Array.isArray(data.slides) && data.slides.length > 0) {
      return data.slides;
    }
    return [
      {
        id: "default-slide-1",
        tagline: data.tagline || defaultHeroContent.tagline,
        title: data.title || defaultHeroContent.title,
        description: data.description || defaultHeroContent.description,
        ctaText: data.ctaText || defaultHeroContent.ctaText,
        ctaLink: data.ctaLink || defaultHeroContent.ctaLink,
        secondaryCtaText:
          data.secondaryCtaText || defaultHeroContent.secondaryCtaText,
        secondaryCtaLink:
          data.secondaryCtaLink || defaultHeroContent.secondaryCtaLink,
        imageUrl: data.imageUrl || defaultHeroContent.imageUrl,
      },
    ];
  }, [data]);

  // Ensure currentIndex stays in bounds
  const safeIndex = currentIndex < slides.length ? currentIndex : 0;
  const currentSlide = slides[safeIndex] || slides[0];

  const nextSlide = useCallback(() => {
    if (slides.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    if (slides.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Auto-play timer with dynamic speed from admin settings
  useEffect(() => {
    if (slides.length <= 1 || isPaused || data.autoplayEnabled === false)
      return;

    const speedSeconds =
      typeof data.autoplaySpeed === "number" && data.autoplaySpeed >= 2
        ? data.autoplaySpeed
        : 6;

    const timer = setInterval(() => {
      nextSlide();
    }, speedSeconds * 1000);

    return () => clearInterval(timer);
  }, [
    slides.length,
    isPaused,
    nextSlide,
    data.autoplaySpeed,
    data.autoplayEnabled,
  ]);

  const heroStats =
    data.stats && data.stats.length > 0 ? data.stats : defaultHeroContent.stats;

  const words = (currentSlide.title || "THE CURATOR").split(" ");

  return (
    <section
      className="group relative min-h-[calc(100svh-120px)] w-full overflow-hidden bg-primary select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Images Layer with AnimatePresence */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentSlide.id || `slide-img-${safeIndex}`}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={currentSlide.imageUrl || defaultHeroContent.imageUrl}
              alt={currentSlide.title || "The Curator Hero"}
              fill
              sizes="100vw"
              priority={safeIndex === 0}
              className="object-cover opacity-75"
            />
          </motion.div>
        </AnimatePresence>

        {/* Ambient Overlays */}
        <div className="absolute inset-0 bg-linear-to-b from-primary/40 via-primary/20 to-primary/85" />
        <div className="absolute inset-0 bg-linear-to-r from-primary/80 via-primary/30 to-transparent" />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex min-h-[calc(100svh-120px)] flex-col justify-between px-6 py-12 sm:px-10 lg:px-16">
        <div className="max-w-6xl pt-10 sm:pt-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={`text-${currentSlide.id || safeIndex}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Tagline */}
              {currentSlide.tagline && (
                <p className="mb-4 text-xs font-semibold tracking-widest text-white/80 uppercase sm:text-sm">
                  {currentSlide.tagline}
                </p>
              )}

              {/* Title */}
              <h1 className="flex flex-wrap gap-x-4 gap-y-1 text-5xl leading-none font-semibold tracking-tight text-on-primary sm:text-7xl md:text-8xl lg:text-9xl">
                {words.map((word, i) => (
                  <span key={i} className="inline-block">
                    {word}
                  </span>
                ))}
              </h1>

              {/* Description */}
              {currentSlide.description && (
                <p className="mt-6 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base md:text-lg">
                  {currentSlide.description}
                </p>
              )}

              {/* CTA Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-3 sm:mt-10 sm:gap-4">
                {currentSlide.ctaText && (
                  <Link
                    href={currentSlide.ctaLink || "/products"}
                    className="inline-flex min-h-12 items-center justify-center gap-3 bg-white px-7 py-3 text-xs font-bold tracking-wider text-black uppercase transition-all duration-300 hover:scale-[0.98] hover:bg-zinc-100 sm:text-sm"
                  >
                    {currentSlide.ctaText}
                    <ArrowRight size={16} strokeWidth={2} />
                  </Link>
                )}

                {currentSlide.secondaryCtaText && (
                  <Link
                    href={currentSlide.secondaryCtaLink || "/about"}
                    className="inline-flex min-h-12 items-center justify-center border border-white/40 px-7 py-3 text-xs font-bold tracking-wider text-white uppercase backdrop-blur-xs transition-colors duration-300 hover:bg-white/15 sm:text-sm"
                  >
                    {currentSlide.secondaryCtaText}
                  </Link>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer info: Stats + Slide Navigation */}
        <div className="mt-12 flex flex-col gap-6 border-t border-white/20 pt-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 text-white/80">
            {heroStats.map((item) => (
              <div
                key={item.label}
                className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2"
              >
                <span className="text-xl font-semibold text-white sm:text-2xl">
                  {item.value}
                </span>
                <span className="text-[10px] tracking-wider text-white/70 uppercase sm:text-xs">
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          {/* Slide Navigation Controls (Only if > 1 slide) */}
          {slides.length > 1 && (
            <div className="flex items-center gap-4 self-end sm:self-auto">
              {/* Slide Counter */}
              <div className="font-mono text-xs tracking-widest text-white/80">
                <span className="font-bold text-white">
                  {String(safeIndex + 1).padStart(2, "0")}
                </span>
                <span className="mx-1 text-white/40">/</span>
                <span>{String(slides.length).padStart(2, "0")}</span>
              </div>

              {/* Dots Indicators */}
              <div className="flex items-center gap-1.5">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === safeIndex
                        ? "w-7 bg-white"
                        : "w-2 bg-white/30 hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>

              {/* Prev / Next Arrows */}
              <div className="flex items-center gap-1.5 pl-2">
                <button
                  type="button"
                  onClick={prevSlide}
                  aria-label="Previous Slide"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-black/20 text-white backdrop-blur-xs transition-colors hover:bg-white hover:text-black"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="Next Slide"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-black/20 text-white backdrop-blur-xs transition-colors hover:bg-white hover:text-black"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
