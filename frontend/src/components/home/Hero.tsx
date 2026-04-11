"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import Image from "next/image";

export const Hero = () => {
  const words = "Purity in Every Detail.".split(" ");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.3,
      },
    },
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-primary">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAGnsbbuvwSlUY_WStz922zawWfeVdjUP72_IMBp2BH0hcqUfFKm6DOtNXmlVjrzbM2yR8U5J6nNN5QSa0wkTb5lvDUakRpIrBY4ecAmffAKnggO_EySHje0YxYb1IcCYOqUtsOW6fLlJKBe5ElgioKVjYdsseGqxX4Te9mKiaWnZo6zfriKOBosLxXKN-VMcrpXUiMTyP23KEGss6NKBhpUuLqejitEv8BQ_Aq27CokLJu_Q7DdVsbZYhzXrcr9YX7Od03JP2Xqs"
          alt="Hero Background"
          fill
          priority
          className="object-cover opacity-60 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl">
        <motion.h1
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-on-primary text-5xl md:text-8xl font-bold tracking-tighter leading-[0.9] mb-12 flex flex-wrap justify-center gap-x-4"
        >
          {words.map((word, index) => (
            <motion.span key={index} variants={wordVariants}>
              {word}
            </motion.span>
          ))}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <Button variant="surface" size="lg">
            Shop Now
          </Button>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-40"
      >
        <span className="material-symbols-outlined text-white text-4xl">
          south
        </span>
      </motion.div>
    </section>
  );
};
