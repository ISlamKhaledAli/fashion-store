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
      className="relative mx-auto flex w-full max-w-[1440px] items-start bg-surface-container-lowest"
      style={{ height: `${stories.length * 100}vh` }}
    >
      {/* LEFT — sticky image */}
      <div
        className="hidden w-1/2 lg:block"
        style={{ position: "sticky", top: "100px", height: "fit-content" }}
      >
        <div className="relative h-[calc(100vh-100px)] w-full">
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
      <div className="flex w-full flex-col lg:w-1/2">
        {stories.map((story, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20% 0px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex min-h-screen items-center px-8 lg:px-16"
          >
            <div className="max-w-xl space-y-6">
              <span className="material-symbols-outlined text-4xl text-primary">
                {story.icon}
              </span>
              <h2 className="text-3xl font-medium tracking-tight">
                {story.title}
              </h2>
              <p className="text-lg leading-relaxed text-on-surface-variant lg:text-xl">
                {story.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
