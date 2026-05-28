"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

export const CTABanner = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-20% 0px" });

  return (
    <section ref={ref} className="py-48 px-8 bg-surface text-center">
      <div className="max-w-4xl mx-auto overflow-hidden">
        <motion.h2 
          initial={{ opacity: 0, y: 80 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl md:text-8xl font-bold text-on-surface mb-12"
        >
          Evolve your space.
        </motion.h2>
        
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row items-center justify-center gap-6"
        >
          <Link
            href="/products"
            className="inline-flex min-h-14 w-full items-center justify-center gap-3 bg-primary px-12 py-5 text-[13px] font-bold uppercase text-on-primary shadow-lg shadow-primary/10 transition-transform duration-300 hover:scale-[0.98] md:w-auto"
          >
            Start Exploring
            <ArrowRight size={18} strokeWidth={1.5} />
          </Link>
          <Link
            href="/editorial"
            className="inline-flex min-h-14 w-full items-center justify-center gap-3 border border-outline-variant px-12 py-5 text-[13px] font-bold uppercase text-on-surface transition-colors duration-300 hover:border-primary hover:bg-surface-container-low md:w-auto"
          >
            <BookOpen size={18} strokeWidth={1.5} />
            Read Journal
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
