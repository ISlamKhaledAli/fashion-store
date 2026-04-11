"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/shop/ProductCard";
import { productApi } from "@/lib/api";
import { Product } from "@/types";
import Link from "next/link";

// Fallback products matching the HTML design exactly
const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "fp-1",
    name: "Structured Heavy Tee",
    slug: "structured-heavy-tee",
    description: "Heavyweight cotton tee with a structured silhouette.",
    price: 120,
    featured: true,
    categoryId: "2",
    brandId: "1",
    avgRating: 0,
    reviewCount: 0,
    createdAt: new Date().toISOString(),
    images: [
      {
        id: "img-1",
        url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBKso8vFDq_AHHqIvWu0tQqkIE7MNGYD67jxZHvdDqV82VOcxotmCEgLnLc4BwiKnDfFff0BpOstp6JSflpewR_5QIflVYgvFd02layrRivWJc3-37jW299CXVceOlffqcCUILyYkd2D_j2qtfMnv5hVvzTsNBJGVy1XByXSG38bb1PT9ceboJQIUVJfmFY30nF5hJbUugEqvGIkii0qdGn-mIvMwoLibtYtF4tg4tzu-FcUJXI5_msdFloBWRrW2_OxYPostYJbtc",
        publicId: "fp-1",
        isMain: true,
      },
    ],
    variants: [
      { id: "v-1", size: "M", color: "Bone White", stock: 10 },
    ],
    category: { id: "2", name: "Essential", slug: "essential" },
  },
  {
    id: "fp-2",
    name: "Legacy Leather Shell",
    slug: "legacy-leather-shell",
    description: "Premium black leather biker jacket with silver hardware.",
    price: 890,
    featured: true,
    categoryId: "1",
    brandId: "1",
    avgRating: 0,
    reviewCount: 0,
    createdAt: new Date().toISOString(),
    images: [
      {
        id: "img-2",
        url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCxPZLaXjYRPe4spcdP40QddgoE0ao0AHqtPPkNPODxde_txDFwnwV1fixvTMle3pIqSG3VUhOsgbs6TtpozWwi84xKXU9Rm0ZXe7KL1PuMAY6zsNc80VuagnYPZxipY5PtAykEeYBe5cISaQpNdPw7sMxCIShwxtH9-qbeBjAK9JZ82F4ConwfJdTSkTUi7WpGfMqpopXRt89MegEY3WfTa4TN7uAdlPHjgDei5ecJZoinRROhAAyhtBEuPVVu9b2XmCImjqEhkpQ",
        publicId: "fp-2",
        isMain: true,
      },
    ],
    variants: [
      { id: "v-2", size: "L", color: "Carbon", stock: 5 },
    ],
    category: { id: "1", name: "Outerwear", slug: "outerwear" },
  },
  {
    id: "fp-3",
    name: "14oz Selvedge Denim",
    slug: "14oz-selvedge-denim",
    description: "Raw indigo selvedge denim with straight-leg cut.",
    price: 240,
    featured: true,
    categoryId: "2",
    brandId: "1",
    avgRating: 0,
    reviewCount: 0,
    createdAt: new Date().toISOString(),
    images: [
      {
        id: "img-3",
        url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCzH2wRYqcvhAyOsdr7v34nKR4tyR9mKqVlIyXZU40Adaa_PiAZvhc_t7sTVoAIiGvm51Bt6o1a19ngxDwfsdKUVaE-pOmzBPjm5hjNj7DDxBwFy3sS5wAOakp26RLg2c5T3DA7Z67f5_73JwBDNKDg1xMCOBLufABRi0u48TAaojNN3EwJ2ianmvcUlpkP-5Hy40i9FhG9akkd_G3NU-l642QwydPVv0-Ceo_eRLmXJcLj8jEUeSLS5AoL8Fl_VSSn5GidFj3m8mk",
        publicId: "fp-3",
        isMain: true,
      },
    ],
    variants: [
      { id: "v-3", size: "32", color: "Raw Indigo", stock: 8 },
    ],
    category: { id: "2", name: "Essential", slug: "essential" },
  },
];

export const FeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productApi.getFeatured();
        if (response.data.success && response.data.data.length > 0) {
          setProducts(response.data.data);
        }
      } catch {
        // Silently fall back to static data — already set as default
      }
    };
    fetchProducts();
  }, []);

  return (
    <section className="py-32 px-8 bg-surface-container-lowest overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex justify-between items-end mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
          >
            <p className="text-on-surface-variant font-label text-xs tracking-[0.2em] uppercase mb-4">
              New Release
            </p>
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-on-surface">
              The Core Collection
            </h2>
          </motion.div>

          <Link
            href="/products"
            className="text-primary font-medium border-b border-primary/20 pb-1 hover:border-primary transition-all duration-300"
          >
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {products.map((product, index) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              delay={index * 0.15} 
            />
          ))}
        </div>
      </div>
    </section>
  );
};
