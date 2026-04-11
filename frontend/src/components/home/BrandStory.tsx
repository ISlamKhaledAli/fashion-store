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
      className="relative min-h-[800px] w-full flex items-center bg-primary overflow-hidden"
    >
      {/* Parallax Background */}
      <motion.div 
        style={{ y }}
        className="absolute inset-0 z-0 opacity-40 scale-110"
      >
        <Image
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuB1_lGLYExz9Ivn1c1cVkz4T8j9N5-zvp5-WMqVCYP50XCmPlxbgrvKF9SPxT5L_o3qVwdFVT6CRTGDUkCW3YHIRns_OgNSvpH2HK9sGxJpOvBTsT2CWSN25soiU6zzHCPYsOg3UO525Y6dL3RRZ0AZc03hZA5yaepmbjGgid9QSRov27ENM_LdD5uLzVH4bxBhpEy944jQfvyYLIldeuKhoGgbW5ptO3H8sl3ClCrJ8xkFVL1KJVqF2y-BQH5hF95YsJWf9r5wyUE"
          alt="Brand Manifesto Background"
          fill
          className="object-cover"
        />
      </motion.div>

      <div className="relative z-10 w-full px-8 max-w-7xl mx-auto">
        <motion.div 
          ref={textRef}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl"
        >
          <p className="text-white/60 font-label text-xs tracking-[0.3em] uppercase mb-12">
            The Manifesto
          </p>
          <blockquote className="text-4xl md:text-6xl font-medium text-white tracking-tighter leading-tight mb-16 italic">
            "We do not design objects. We define the silence between them."
          </blockquote>
          <div className="flex items-center gap-6">
            <div className="h-[1px] w-12 bg-white/30"></div>
            <p className="text-white/80 font-medium tracking-wide">
              Director's Cut 2024
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
