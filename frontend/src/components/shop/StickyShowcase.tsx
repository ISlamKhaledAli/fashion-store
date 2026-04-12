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
    <section 
      className="relative bg-surface-container-lowest w-full max-w-[1440px] mx-auto flex items-start"
      style={{ height: `${stories.length * 100}vh` }}
    >
      {/* LEFT — sticky image */}
      <div 
        className="w-1/2 hidden lg:block"
        style={{ position: 'sticky', top: '100px', height: 'fit-content' }}
      >
        <div className="relative w-full h-[calc(100vh-100px)]">
          {image && (
            <Image
              src={image}
              alt="Editorial Storytelling"
              fill
              className="object-cover"
            />
          )}
        </div>
      </div>

      {/* RIGHT — scrolling features */}
      <div className="w-full lg:w-1/2 flex flex-col">
        {stories.map((story, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20% 0px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="min-h-screen flex items-center px-8 lg:px-16"
          >
            <div className="space-y-6 max-w-xl">
              <span className="text-4xl text-primary font-serif">
                {story.icon}
              </span>
              <h2 className="text-3xl font-medium tracking-tight">
                {story.title}
              </h2>
              <p className="text-on-surface-variant leading-relaxed text-lg lg:text-xl">
                {story.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
