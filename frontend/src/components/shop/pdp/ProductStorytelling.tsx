"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StoryItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface ProductStorytellingProps {
  image: string;
  stories: StoryItem[];
}

export const ProductStorytelling = ({ image, stories }: ProductStorytellingProps) => {
  return (
    <section className="relative bg-white overflow-hidden">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2">
        {/* Left Side: Sticky Image */}
        <div className="sticky top-0 h-screen hidden lg:block overflow-hidden">
          <motion.div 
            initial={{ scale: 1.1, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full relative"
          >
            <Image
              src={image}
              alt="Editorial storytelling image"
              fill
              sizes="50vw"
              className="object-cover"
            />
            {/* Overlay for cinematic depth */}
            <div className="absolute inset-0 bg-black/5" />
          </motion.div>
        </div>

        {/* Right Side: Scrolling Content */}
        <div className="py-32 px-12 lg:px-24 space-y-96 mb-64">
          {stories.map((story, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20%" }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              <story.icon className="w-10 h-10 text-primary" strokeWidth={1.5} />
              <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-on-surface">
                {story.title}
              </h2>
              <p className="text-on-surface-variant leading-relaxed text-lg font-light max-w-md">
                {story.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
