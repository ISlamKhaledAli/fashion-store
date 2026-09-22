"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import Image from "next/image";
import { contentApi } from "@/lib/api";
import type { BrandStoryContent } from "@/types";

const defaultBrandStory: BrandStoryContent = {
  title: "The Manifesto",
  heading:
    "Born from a desire to strip away the unnecessary and celebrate the essential.",
  quote:
    "True luxury is not about excess. It is about intention, precision, and the quiet confidence of well-crafted design.",
  author: "Elena Rostova",
  authorRole: "Creative Director",
  badgeText: "Edition 2026",
  badgeSubtext: "Crafted in Milan",
  imageUrl:
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=2000&q=80",
};

interface BrandStoryProps {
  initialData?: BrandStoryContent;
}

export const BrandStory = ({ initialData }: BrandStoryProps) => {
  const [data, setData] = useState<BrandStoryContent>(
    () => initialData || defaultBrandStory
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);

  const textRef = useRef(null);
  const isInView = useInView(textRef, { once: true, margin: "-10% 0px" });

  useEffect(() => {
    let isMounted = true;
    contentApi
      .getByKey<BrandStoryContent>("home_brand_story")
      .then((res) => {
        if (isMounted && res.data?.data) {
          setData((prev) => ({ ...prev, ...res.data.data }));
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-[580px] w-full items-center overflow-hidden bg-primary px-6 py-20 sm:min-h-[720px] sm:px-8 sm:py-28 lg:min-h-[820px]"
    >
      {/* Parallax Background */}
      <motion.div
        style={{ y }}
        className="absolute inset-0 z-0 scale-110 opacity-35"
      >
        <Image
          src={data.imageUrl || defaultBrandStory.imageUrl}
          alt={data.title || "Brand Manifesto"}
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-primary/40" />
      </motion.div>

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <motion.div
          ref={textRef}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl"
        >
          {/* Top Badge & Header */}
          <div className="mb-8 flex flex-wrap items-center gap-3 sm:mb-12">
            <span className="font-label text-xs font-semibold tracking-[0.25em] text-white/70 uppercase">
              {data.title || "The Manifesto"}
            </span>

            {(data.badgeText || data.badgeSubtext) && (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-medium tracking-wider text-white/90 uppercase backdrop-blur-xs">
                {data.badgeText && <span>{data.badgeText}</span>}
                {data.badgeText && data.badgeSubtext && (
                  <span className="opacity-40">•</span>
                )}
                {data.badgeSubtext && (
                  <span className="opacity-80">{data.badgeSubtext}</span>
                )}
              </span>
            )}
          </div>

          {/* Heading statement if provided */}
          {data.heading && (
            <h3 className="mb-6 text-xl font-normal tracking-tight text-white/90 sm:text-2xl md:text-3xl">
              {data.heading}
            </h3>
          )}

          {/* Core Quote */}
          <blockquote className="mb-10 font-serif text-2xl leading-snug text-white italic sm:text-4xl md:text-5xl lg:text-6xl">
            &ldquo;{data.quote}&rdquo;
          </blockquote>

          {/* Author & Role */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="h-[1px] w-8 bg-white/40 sm:w-12" />
            <div className="flex flex-wrap items-baseline gap-2">
              <p className="text-sm font-semibold tracking-wide text-white sm:text-base">
                {data.author || "Elena Rostova"}
              </p>
              {data.authorRole && (
                <span className="text-xs tracking-wider text-white/60 uppercase">
                  / {data.authorRole}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
