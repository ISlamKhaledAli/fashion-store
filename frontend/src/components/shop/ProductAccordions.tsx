"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/Button";
import ReactMarkdown from "react-markdown";

interface AccordionItem {
  title: string;
  content: string | React.ReactNode;
}

interface ProductAccordionsProps {
  items: AccordionItem[];
}

export const ProductAccordions = ({ items }: ProductAccordionsProps) => {
  const [expanded, setExpanded] = useState<number | null>(0);

  return (
    <section className="bg-transparent max-w-[1440px] mx-auto px-8 lg:px-12 py-24 lg:py-32 border-t border-surface-container">
      <div className="max-w-3xl mx-auto">
        {items.map((item, index) => (
          <div 
            key={index} 
            className="border-b border-surface-container last:border-b-0"
          >
            <Button
              variant="none"
              size="none"
              onClick={() => setExpanded(expanded === index ? null : index)}
              className="w-full py-8 group text-left px-4"
            >
              <div className="flex items-center justify-between w-full">
                <h3 className="text-lg font-medium tracking-tight pr-4">{item.title}</h3>
                <motion.span 
                  animate={{ rotate: expanded === index ? 45 : 0 }}
                  className="material-symbols-outlined transition-colors group-hover:text-primary shrink-0"
                >
                  add
                </motion.span>
              </div>
            </Button>
            <AnimatePresence initial={false}>
              {expanded === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="pb-8 text-on-surface-variant leading-relaxed space-y-4">
                    {typeof item.content === "string" ? (
                      <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-strong:font-bold prose-strong:text-zinc-900 prose-ul:list-disc prose-ul:pl-4 prose-li:mb-1">
                        <ReactMarkdown>{item.content}</ReactMarkdown>
                      </div>
                    ) : (
                      item.content
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
};
