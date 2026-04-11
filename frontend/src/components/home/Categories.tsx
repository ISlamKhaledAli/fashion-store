"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { categoryApi } from "@/lib/api";
import { Category } from "@/types";

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
  const [categories, setCategories] = React.useState<Category[]>(FALLBACK_CATEGORIES);

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getAll();
        if (response.data.success && response.data.data.length > 0) {
          setCategories(response.data.data);
        }
      } catch {
        // Silently fall back to static data — already set as default
      }
    };
    fetchCategories();
  }, []);

  return (
    <section className="py-32 px-8 bg-surface">
      <div className="max-w-[1600px] mx-auto">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15% 0px" }}
              transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] as const }}
            >
              <Link
                href={`/products?category=${category.slug}`}
                className="group relative block aspect-3/4 overflow-hidden bg-surface-container-high"
              >
                <Image
                  src={category.image || ""}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-[0.6s] cinematic-ease group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 border-1px border-white/20" />
                <div className="absolute bottom-8 left-8 z-10">
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
    </section>
  );
};
