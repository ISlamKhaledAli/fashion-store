"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

const AccordionItem = ({ title, children, isOpen, onToggle }: AccordionItemProps) => {
  return (
    <div className="border-b border-surface-container-high py-8">
      <button
        onClick={onToggle}
        className="flex justify-between items-center w-full group text-left"
      >
        <span className="text-lg font-medium text-on-surface tracking-tight">
          {title}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          className="text-stone-400 group-hover:text-primary transition-colors flex items-center justify-center font-bold"
        >
          <Plus size={20} strokeWidth={2} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="pt-6 text-on-surface-variant leading-relaxed text-base font-light max-w-2xl">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const ProductAccordions = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const sections = [
    {
      title: "Description",
      content: "A modern interpretation of the classic naval bridge coat. Features a double-breasted closure, oversized notched lapels, and hidden internal pockets for your essentials. Hand-finished edges and a slight anatomical curve in the sleeves define this signature piece.",
    },
    {
      title: "Materials",
      content: "Outer: 80% Virgin Wool, 20% Polyamide (Italian mill). Lining: 100% Cupro. Buttons: Horn. Our wool is certified mulesing-free and processed in a solar-powered facility in Prato.",
    },
    {
      title: "Care",
      content: "Dry clean only by a professional specializing in fine wool garments. Do not tumble dry. Cool iron if necessary through a pressing cloth. Store on a wide-shoulder hanger to maintain silhouette.",
    },
    {
      title: "Shipping & Returns",
      content: "Complimentary worldwide shipping on all orders over $500. Standard delivery typically takes 3-5 business days. We offer a 14-day return period for all unworn garments in original packaging.",
    },
  ];

  return (
    <section className="max-w-[1440px] mx-auto px-12 py-32 border-t border-surface-container">
      <div className="max-w-3xl mx-auto">
        {sections.map((section, idx) => (
          <AccordionItem
            key={idx}
            title={section.title}
            isOpen={openIndex === idx}
            onToggle={() => setOpenIndex(openIndex === idx ? null : idx)}
          >
            {section.content}
          </AccordionItem>
        ))}
      </div>
    </section>
  );
};
