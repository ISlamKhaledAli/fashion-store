"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import Image from "next/image";

export const Hero = () => {
  const words = "THE CURATOR".split(" ");
  const heroStats = [
    { value: "48h", label: "Express fulfilment" },
    { value: "AI", label: "Size guidance" },
    { value: "24/7", label: "Style assistant" },
  ];

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
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAGnsbbuvwSlUY_WStz922zawWfeVdjUP72_IMBp2BH0hcqUfFKm6DOtNXmlVjrzbM2yR8U5J6nNN5QSa0wkTb5lvDUakRpIrBY4ecAmffAKnggO_EySHje0YxYb1IcCYOqUtsOW6fLlJKBe5ElgioKVjYdsseGqxX4Te9mKiaWnZo6zfriKOBosLxXKN-VMcrpXUiMTyP23KEGss6NKBhpUuLqejitEv8BQ_Aq27CokLJu_Q7DdVsbZYhzXrcr9YX7Od03JP2Xqs"
          alt="Editorial fashion campaign in a refined atelier setting"
          fill
          sizes="100vw"
          priority
          className="object-cover opacity-70 scale-105"
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
            className="mb-6 text-sm font-medium uppercase text-white/70"
          >
            Premium fashion commerce
          </motion.p>

          <motion.h1
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap gap-x-5 text-6xl font-semibold leading-none text-on-primary sm:text-7xl md:text-8xl lg:text-9xl"
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
            A cinematic storefront for modern wardrobe essentials, precise product discovery,
            resilient checkout, and an admin command center built for serious retail operations.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.95, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-col gap-3 sm:flex-row"
          >
            <Link
              href="/products"
              className="inline-flex min-h-12 items-center justify-center gap-3 bg-white px-7 py-3 text-sm font-bold uppercase text-black transition-transform duration-300 hover:scale-[0.98]"
            >
              Shop collection
              <ArrowRight size={18} strokeWidth={1.5} />
            </Link>
            <Link
              href="/editorial"
              className="inline-flex min-h-12 items-center justify-center border border-white/35 px-7 py-3 text-sm font-bold uppercase text-white transition-colors duration-300 hover:bg-white/10"
            >
              Read editorial
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
              <span className="text-2xl font-semibold text-white">{item.value}</span>
              <span className="text-sm">{item.label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-6 right-6 opacity-50"
        aria-hidden="true"
      >
        <ArrowDown className="text-white" size={32} strokeWidth={1} />
      </motion.div>
    </section>
  );
};
