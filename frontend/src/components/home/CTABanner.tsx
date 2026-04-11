"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/Button";

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
          className="text-5xl md:text-8xl font-bold tracking-tighter text-on-surface mb-12"
        >
          Evolve your space.
        </motion.h2>
        
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row items-center justify-center gap-6"
        >
          <Button size="lg" className="w-full md:w-auto px-12 py-5">
            Start Exploring
          </Button>
          <Button variant="outline" size="lg" className="w-full md:w-auto px-12 py-5">
            Read Journal
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
