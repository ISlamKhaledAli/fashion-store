"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { categoryApi, contentApi } from "@/lib/api";
import type { Category, HomeCategoriesSectionContent } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [sectionContent, setSectionContent] =
    useState<HomeCategoriesSectionContent>(() => ({
      label: "Curated Selects",
      heading: "The Architecture of Wear",
    }));
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    contentApi
      .getByKey<HomeCategoriesSectionContent>("home_categories_section")
      .then((res) => {
        if (res.data.success && res.data.data) {
          const fetched = res.data
            .data as unknown as Partial<HomeCategoriesSectionContent>;
          setSectionContent((prev) => ({
            label: fetched.label || prev.label,
            heading: fetched.heading || prev.heading,
          }));
        }
      })
      .catch(() => {});

    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await categoryApi.getAll();
        if (response.data.success && Array.isArray(response.data.data)) {
          setCategories(response.data.data);
        }
      } catch (err) {
        // Handled silently
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="overflow-hidden bg-surface px-8 py-32">
      <div className="group relative mx-auto max-w-[1600px]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
          className="mb-16"
        >
          <p className="mb-4 font-label text-xs tracking-[0.2em] text-on-surface-variant uppercase">
            {sectionContent.label}
          </p>
          <h2 className="text-4xl font-medium tracking-tight text-on-surface md:text-5xl">
            {sectionContent.heading}
          </h2>
        </motion.div>

        <div className="relative">
          {/* Overlay Layer - Cinematic Depth */}
          <div className="pointer-events-none absolute inset-0 z-10">
            <div className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-surface to-transparent opacity-60 transition-opacity duration-700 group-hover:opacity-100" />
            <div className="absolute top-0 right-0 bottom-0 w-32 bg-gradient-to-l from-surface to-transparent opacity-60 transition-opacity duration-700 group-hover:opacity-100" />
          </div>

          {/* Navigation Arrows */}
          <AnimatePresence>
            {canScrollLeft && (
              <motion.button
                key="scroll-left"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onClick={() => scroll("left")}
                className="cinematic-ease pointer-events-auto absolute top-1/2 left-4 z-50 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/80 shadow-xl shadow-black/5 backdrop-blur-xl transition-transform hover:scale-110"
              >
                <ChevronLeft className="h-6 w-6 text-primary" />
              </motion.button>
            )}
            {canScrollRight && (
              <motion.button
                key="scroll-right"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onClick={() => scroll("right")}
                className="cinematic-ease pointer-events-auto absolute top-1/2 right-4 z-50 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/80 shadow-xl shadow-black/5 backdrop-blur-xl transition-transform hover:scale-110"
              >
                <ChevronRight className="h-6 w-6 text-primary" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Categories Horizontal Container */}
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="no-scrollbar relative z-0 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth py-4"
          >
            {isLoading
              ? [1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="aspect-3/4 w-[280px] flex-shrink-0 animate-pulse rounded-xs bg-surface-container-high sm:w-[350px] md:w-[400px]"
                  />
                ))
              : categories.map((category, index) => {
                  const imageSrc =
                    category.image &&
                    typeof category.image === "string" &&
                    category.image.trim() !== ""
                      ? category.image
                      : null;

                  return (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-15% 0px" }}
                      transition={{
                        duration: 0.8,
                        delay: index * 0.1,
                        ease: [0.16, 1, 0.3, 1] as const,
                      }}
                      className="w-[280px] flex-shrink-0 snap-start sm:w-[350px] md:w-[400px]"
                    >
                      <Link
                        href={`/products?category=${category.slug}`}
                        className="group/card relative block aspect-3/4 overflow-hidden bg-surface-container-high opacity-90 transition-opacity duration-700 hover:opacity-100"
                      >
                        {imageSrc ? (
                          <Image
                            src={imageSrc}
                            alt={category.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            priority={index === 0}
                            className="cinematic-ease object-cover transition-transform duration-[0.6s] group-hover/card:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-tr from-surface-container-high to-surface-container">
                            <span className="text-lg font-medium tracking-wider text-on-surface-variant uppercase">
                              {category.name}
                            </span>
                          </div>
                        )}
                        {/* Card Overlay from HTML Design */}
                        <div className="absolute inset-0 border-[1px] border-white/20 bg-black/5 opacity-0 transition-opacity duration-500 group-hover/card:opacity-100" />

                        <div className="absolute bottom-8 left-8 z-10 transition-transform duration-500 group-hover/card:-translate-y-2">
                          <h3 className="text-2xl font-medium tracking-tight text-white">
                            {category.name}
                          </h3>
                          <p className="text-sm tracking-wide text-white/70">
                            {String(category._count?.products || 0).padStart(
                              2,
                              "0"
                            )}{" "}
                            Artifacts
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
          </div>
        </div>
      </div>
    </section>
  );
};
