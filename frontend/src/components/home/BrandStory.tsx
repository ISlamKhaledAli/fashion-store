"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import Image from "next/image";
import { contentApi } from "@/lib/api";
import type { BrandStoryContent } from "@/types";

const defaultBrandStory: BrandStoryContent = {
  title: "The Manifesto",
  heading: "Director's Cut 2026",
  quote: "We do not design objects. We define the silence between them.",
  author: "Director's Cut",
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

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

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
      className="relative flex min-h-[800px] w-full items-center overflow-hidden bg-primary"
    >
      {/* Parallax Background */}
      <motion.div
        style={{ y }}
        className="absolute inset-0 z-0 scale-110 opacity-40"
      >
        <Image
          src={data.imageUrl || defaultBrandStory.imageUrl}
          alt={data.title || "Brand Manifesto"}
          fill
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-8">
        <motion.div
          ref={textRef}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl"
        >
          <p className="mb-12 font-label text-xs tracking-[0.3em] text-white/60 uppercase">
            {data.title || "The Manifesto"}
          </p>
          <blockquote className="mb-16 text-4xl leading-tight font-medium tracking-tighter text-white italic md:text-6xl">
            &ldquo;{data.quote}&rdquo;
          </blockquote>
          <div className="flex items-center gap-6">
            <div className="h-[1px] w-12 bg-white/30" />
            <p className="font-medium tracking-wide text-white/80">
              {data.author || data.heading || "Director's Cut 2026"}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
