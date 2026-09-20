"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { contentApi } from "@/lib/api";
import type { CtaBannerContent } from "@/types";

const defaultCtaBanner: CtaBannerContent = {
  tagline: "Curated Aesthetic",
  title: "Evolve your space.",
  description:
    "Join our private client program for bespoke appointments and archival access.",
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
  const isInView = useInView(ref, { once: true, margin: "-20% 0px" });

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
    <section ref={ref} className="bg-surface px-8 py-48 text-center">
      <div className="mx-auto max-w-4xl overflow-hidden">
        <motion.h2
          initial={{ opacity: 0, y: 80 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 text-5xl font-bold text-on-surface md:text-8xl"
        >
          {data.title || "Evolve your space."}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center justify-center gap-6 md:flex-row"
        >
          <Link
            href={data.primaryButtonLink || "/products"}
            className="inline-flex min-h-14 w-full items-center justify-center gap-3 bg-primary px-12 py-5 text-[13px] font-bold text-on-primary uppercase shadow-lg shadow-primary/10 transition-transform duration-300 hover:scale-[0.98] md:w-auto"
          >
            {data.primaryButtonText || "Start Exploring"}
            <ArrowRight size={18} strokeWidth={1.5} />
          </Link>
          <Link
            href={data.secondaryButtonLink || "/about"}
            className="inline-flex min-h-14 w-full items-center justify-center gap-3 border border-outline-variant px-12 py-5 text-[13px] font-bold text-on-surface uppercase transition-colors duration-300 hover:border-primary hover:bg-surface-container-low md:w-auto"
          >
            <BookOpen size={18} strokeWidth={1.5} />
            {data.secondaryButtonText || "About The Atelier"}
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
