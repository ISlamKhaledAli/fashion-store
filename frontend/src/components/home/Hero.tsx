"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { contentApi } from "@/lib/api";
import type { HeroContent } from "@/types";

const defaultHeroContent: HeroContent = {
  tagline: "Premium fashion commerce",
  title: "THE CURATOR",
  description:
    "A cinematic storefront for modern wardrobe essentials, precise product discovery, resilient checkout, and an admin command center built for serious retail operations.",
  ctaText: "Shop collection",
  ctaLink: "/products",
  secondaryCtaText: "Our Story",
  secondaryCtaLink: "/about",
  imageUrl:
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=85",
  stats: [
    { value: "48h", label: "Express fulfilment" },
    { value: "AI", label: "Size guidance" },
    { value: "24/7", label: "Style assistant" },
  ],
};

interface HeroProps {
  initialData?: HeroContent;
}

export const Hero = ({ initialData }: HeroProps) => {
  const [data, setData] = useState<HeroContent>(
    () => initialData || defaultHeroContent
  );

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

  const words = (data.title || "THE CURATOR").split(" ");
  const heroStats =
    data.stats && data.stats.length > 0 ? data.stats : defaultHeroContent.stats;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.3,
      },
    },
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 32 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  return (
    <section className="relative min-h-[calc(100svh-120px)] w-full overflow-hidden bg-primary">
      <div className="absolute inset-0 z-0">
        <Image
          src={data.imageUrl || defaultHeroContent.imageUrl}
          alt={data.title || "The Curator"}
          fill
          sizes="100vw"
          priority
          className="scale-105 object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-linear-to-b from-primary/30 via-primary/15 to-primary/80" />
        <div className="absolute inset-0 bg-linear-to-r from-primary/75 via-primary/20 to-transparent" />
      </div>

      <div className="relative z-10 flex min-h-[calc(100svh-120px)] flex-col justify-between px-6 py-12 sm:px-10 lg:px-16">
        <div className="max-w-6xl pt-10 sm:pt-16">
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6 text-sm font-medium text-white/70 uppercase"
          >
            {data.tagline}
          </motion.p>

          <motion.h1
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap gap-x-5 text-6xl leading-none font-semibold text-on-primary sm:text-7xl md:text-8xl lg:text-9xl"
          >
            {words.map((word, index) => (
              <motion.span key={index} variants={wordVariants}>
                {word}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 max-w-2xl text-base leading-7 text-white/75 sm:text-lg"
          >
            {data.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.95, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-col gap-3 sm:flex-row"
          >
            <Link
              href={data.ctaLink || "/products"}
              className="inline-flex min-h-12 items-center justify-center gap-3 bg-white px-7 py-3 text-sm font-bold text-black uppercase transition-transform duration-300 hover:scale-[0.98]"
            >
              {data.ctaText || "Shop collection"}
              <ArrowRight size={18} strokeWidth={1.5} />
            </Link>
            <Link
              href={data.secondaryCtaLink || "/about"}
              className="inline-flex min-h-12 items-center justify-center border border-white/35 px-7 py-3 text-sm font-bold text-white uppercase transition-colors duration-300 hover:bg-white/10"
            >
              {data.secondaryCtaText || "Our Story"}
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 grid gap-4 border-t border-white/20 pt-5 text-white/80 sm:grid-cols-3"
        >
          {heroStats.map((item) => (
            <div key={item.label} className="flex items-baseline gap-3">
              <span className="text-2xl font-semibold text-white">
                {item.value}
              </span>
              <span className="text-xs tracking-wider text-white/70 uppercase">
                {item.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
