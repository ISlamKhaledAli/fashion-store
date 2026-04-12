"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface StoryBlock {
  icon: string;
  title: string;
  description: string;
}

interface StickyShowcaseProps {
  image: string;
  stories: StoryBlock[];
}

export const StickyShowcase = ({ image, stories }: StickyShowcaseProps) => {
  return (
    <section className="relative bg-surface-container-lowest overflow-hidden">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 lg:min-h-[1024px]">
        <div className="lg:sticky lg:top-0 lg:h-screen hidden lg:block overflow-hidden">
          <Image
            src={image}
            alt="Editorial Storytelling"
            fill
            className="w-full h-full object-cover"
          />
        </div>

        <div className="py-24 px-8 lg:py-48 lg:px-24 space-y-32 lg:space-y-64">
          {stories.map((story, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20%" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-6 max-w-xl"
            >
              <span className="material-symbols-outlined text-4xl text-primary">
                {story.icon}
              </span>
              <h2 className="text-3xl font-medium tracking-tight">
                {story.title}
              </h2>
              <p className="text-on-surface-variant leading-relaxed text-lg lg:text-xl">
                {story.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
