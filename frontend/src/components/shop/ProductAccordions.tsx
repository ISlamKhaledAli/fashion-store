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
    <section className="mx-auto max-w-[1440px] border-t border-surface-container bg-transparent px-8 py-24 lg:px-12 lg:py-32">
      <div className="mx-auto max-w-3xl">
        {items.map((item, index) => (
          <div
            key={index}
            className="border-b border-surface-container last:border-b-0"
          >
            <Button
              variant="none"
              size="none"
              onClick={() => setExpanded(expanded === index ? null : index)}
              className="group w-full px-4 py-8 text-left"
            >
              <div className="flex w-full items-center justify-between">
                <h3 className="pr-4 text-lg font-medium tracking-tight">
                  {item.title}
                </h3>
                <motion.span
                  animate={{ rotate: expanded === index ? 45 : 0 }}
                  className="material-symbols-outlined shrink-0 transition-colors group-hover:text-primary"
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
                  <div className="space-y-4 pb-8 leading-relaxed text-on-surface-variant">
                    {typeof item.content === "string" ? (
                      <div className="prose prose-sm prose-p:leading-relaxed prose-strong:font-bold prose-strong:text-zinc-900 prose-ul:list-disc prose-ul:pl-4 prose-li:mb-1 max-w-none">
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
