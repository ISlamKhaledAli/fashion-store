"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { categoryApi } from "@/lib/api";
import { Category } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Fallback data matching the HTML design exactly
const FALLBACK_CATEGORIES = [
  {
    id: "1",
    name: "Outerwear",
    slug: "outerwear",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCWp6ag_u4U7ifPV37hyc561tjKHwLF87yXobNKu5L6bEeMkNDVlJMG-aDDIpkT_T7FaRDP6PbcL0qPKjbCUL1UpfBAMYGhkaOAvVV9Osuo6ghbQk2ME2YU5IALmmvzEyV93zT-R2o96uBWPwxuiaf4nO46bZdAnc19ugzEKFUWEmkjd2_yOYnbtDZdou8RXGoWwc5kCp4_ZR-PpS6-8vdddMFXGxHxupqD-dqPalnlDJc9pmJLImBM6JYLjC0YRJBCUHf-3Krnhvg",
    _count: { products: 8 },
  },
  {
    id: "2",
    name: "Essential",
    slug: "essential",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCuGRXRxJYti36qxDXLQRoT0aK_Z0MODRf_M8Puoqr-vFJEcXI20oQ3QbAW94xfeLWKRGzps8wq9YTtz1MKX2jjVnGrlTM5C1sS7JSWUtUJKuawhlKEeR0yiWX5T8XrlJ2L6pL9aD18Iw25XzTiIyAyZ8HAZp5AtMLG-FHnMAz4UpaoU2W_XCvhMAnTHuoxWfsDcy6dRVKuezl5TKqEWbfv9wcK-E24pYCWjaEKre6gSRWi8u8RYZiUmaEL0YkU2BVAB80gcKHO-DI",
    _count: { products: 14 },
  },
  {
    id: "3",
    name: "Objects",
    slug: "objects",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDmF_-RHH9V_gTgurlKrTmyALRE2G3frBMbIT1E3uv-39xNMGNVzJz3U_cZNRXkrvRp6rdhYQPgLEdLTZcnUphp_4BcbVdbfMXB9DgOfSFdClJc1GdUVilgeePNYEul3smGRHqZxjte8ErHnhd9vMlzzKMD9WrAsgraP0pnxv0CVMyAU4OWUQNkiNydQlRHGwEKCa5ngZeM9Yh_XOd3zDf4zLYFv8qok3_HPY7EJTapp680NpzKgTmxNMPV_alLjeFw8Jb0BgzwHMQ",
    _count: { products: 22 },
  },
  {
    id: "4",
    name: "Footwear",
    slug: "footwear",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCXGSyEG4zwyIT6Us8WqFZzaT3WGB3QMZ8QZfuakhjBeU_CQ9NBVD7g4cd0EDdXbvo12NVee4hYbf2oiB9EoL9Rbdi0EQRVOsnXWGX23NVaB95JwQxmmKY9gNm3X03xWUs7wIWehfeuW7cApgZ6u03XA_opLlFuzHkhLmebOxHA5W6ojeVwgQ8Ygy7eyQF6xw53C-vSMh0pxLZZ1eBA5VkOKlUFray6D7XKp_nhHZkthZUVAqQAWIC6zJK2u5OkmxP7T-35DVjvej8",
    _count: { products: 11 },
  },
];

export const Categories = () => {
  const [categories, setCategories] = useState<Category[]>(FALLBACK_CATEGORIES);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getAll();
        if (response.data.success && response.data.data.length > 0) {
          setCategories(response.data.data);
        }
      } catch {
        // Fallback already set
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
    <section className="py-32 px-8 bg-surface overflow-hidden">
      <div className="max-w-[1600px] mx-auto relative group">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
          className="mb-16"
        >
          <p className="text-on-surface-variant font-label text-xs tracking-[0.2em] uppercase mb-4">
            Curated Selects
          </p>
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-on-surface">
            The Architecture of Wear
          </h2>
        </motion.div>

        <div className="relative">
          {/* Overlay Layer - Cinematic Depth */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-surface to-transparent transition-opacity duration-700 opacity-60 group-hover:opacity-100" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-surface to-transparent transition-opacity duration-700 opacity-60 group-hover:opacity-100" />
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
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 bg-white/80 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center shadow-xl shadow-black/5 hover:scale-110 cursor-pointer pointer-events-auto transition-transform cinematic-ease"
              >
                <ChevronLeft className="w-6 h-6 text-primary" />
              </motion.button>
            )}
            {canScrollRight && (
              <motion.button
                key="scroll-right"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onClick={() => scroll("right")}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 bg-white/80 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center shadow-xl shadow-black/5 hover:scale-110 cursor-pointer pointer-events-auto transition-transform cinematic-ease"
              >
                <ChevronRight className="w-6 h-6 text-primary" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Categories Horizontal Container */}
          <div 
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory py-4 relative z-0 scroll-smooth"
          >
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-15% 0px" }}
                transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] as const }}
                className="flex-shrink-0 w-[280px] sm:w-[350px] md:w-[400px] snap-start"
              >
                <Link
                  href={`/products?category=${category.slug}`}
                  className="group/card relative block aspect-3/4 overflow-hidden bg-surface-container-high transition-opacity duration-700 opacity-90 hover:opacity-100"
                >
                  <Image
                    src={category.image || ""}
                    alt={category.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    priority={index === 0}
                    className="object-cover transition-transform duration-[0.6s] cinematic-ease group-hover/card:scale-105"
                  />
                  {/* Card Overlay from HTML Design */}
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 border-[1px] border-white/20" />
                  
                  <div className="absolute bottom-8 left-8 z-10 transition-transform duration-500 group-hover/card:-translate-y-2">
                    <h3 className="text-white text-2xl font-medium tracking-tight">
                      {category.name}
                    </h3>
                    <p className="text-white/70 text-sm tracking-wide">
                      {String(category._count?.products || 0).padStart(2, "0")} Artifacts
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
