"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import Image from "next/image";

export const BrandStory = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  const textRef = useRef(null);
  const isInView = useInView(textRef, { once: true, margin: "-10% 0px" });

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
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=2000&q=80"
          alt="Brand Manifesto Background"
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
            The Manifesto
          </p>
          <blockquote className="mb-16 text-4xl leading-tight font-medium tracking-tighter text-white italic md:text-6xl">
            &quot;We do not design objects. We define the silence between
            them.&quot;
          </blockquote>
          <div className="flex items-center gap-6">
            <div className="h-1px w-12 bg-white/30"></div>
            <p className="font-medium tracking-wide text-white/80">
              Director&apos;s Cut 2024
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
