"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { contentApi } from "@/lib/api";
import type { CtaBannerContent } from "@/types";

const defaultCtaBanner: CtaBannerContent = {
  tagline: "Curated Aesthetic",
  title: "Evolve your space with archival garments.",
  description:
    "Join our private client program for bespoke appointments, priority seasonal reservations, and archival wardrobe discovery.",
  primaryButtonText: "Start Exploring",
  primaryButtonLink: "/products",
  secondaryButtonText: "About The Atelier",
  secondaryButtonLink: "/about",
};

interface CTABannerProps {
  initialData?: CtaBannerContent;
}

export const CTABanner = ({ initialData }: CTABannerProps) => {
  const [data, setData] = useState<CtaBannerContent>(
    () => initialData || defaultCtaBanner
  );
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-15% 0px" });

  useEffect(() => {
    let isMounted = true;
    contentApi
      .getByKey<CtaBannerContent>("home_cta_banner")
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
      ref={ref}
      className="bg-surface px-6 py-20 text-center sm:px-8 sm:py-32 lg:py-40"
    >
      <div className="mx-auto max-w-4xl overflow-hidden">
        {/* Tagline */}
        {data.tagline && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-4 text-xs font-semibold tracking-[0.25em] text-on-surface-variant uppercase sm:text-sm"
          >
            {data.tagline}
          </motion.p>
        )}

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 text-3xl font-bold tracking-tight text-on-surface sm:text-5xl md:text-7xl lg:text-8xl"
        >
          {data.title || "Evolve your space."}
        </motion.h2>

        {/* Description */}
        {data.description && (
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mb-10 max-w-2xl text-sm leading-relaxed text-on-surface-variant sm:text-base md:text-lg"
          >
            {data.description}
          </motion.p>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6"
        >
          <Link
            href={data.primaryButtonLink || "/products"}
            className="inline-flex min-h-12 w-full items-center justify-center gap-3 bg-primary px-8 py-4 text-xs font-bold text-on-primary uppercase shadow-lg shadow-primary/10 transition-transform duration-300 hover:scale-[0.98] sm:min-h-14 sm:w-auto sm:px-12 sm:text-[13px]"
          >
            {data.primaryButtonText || "Start Exploring"}
            <ArrowRight size={16} strokeWidth={1.5} />
          </Link>
          <Link
            href={data.secondaryButtonLink || "/about"}
            className="inline-flex min-h-12 w-full items-center justify-center gap-3 border border-outline-variant px-8 py-4 text-xs font-bold text-on-surface uppercase transition-colors duration-300 hover:border-primary hover:bg-surface-container-low sm:min-h-14 sm:w-auto sm:px-12 sm:text-[13px]"
          >
            <BookOpen size={16} strokeWidth={1.5} />
            {data.secondaryButtonText || "About The Atelier"}
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
