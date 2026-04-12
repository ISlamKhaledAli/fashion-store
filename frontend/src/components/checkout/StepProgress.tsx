"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StepProgressProps {
  currentStep: number;
}

const steps = [
  { id: 1, label: "Shipping" },
  { id: 2, label: "Payment" },
  { id: 3, label: "Review" },
];

export const StepProgress = ({ currentStep }: StepProgressProps) => {
  return (
    <nav className="flex items-center gap-8 mb-16">
      {steps.map((step, index) => {
        const isCompleted = currentStep > step.id;
        const isActive = currentStep === step.id;

        return (
          <div key={step.id} className="group cursor-default flex flex-col gap-2 flex-1">
            <div className="flex items-center gap-2">
              <div className="relative flex items-center justify-center">
                {isCompleted ? (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="material-symbols-outlined text-[10px] text-primary"
                    style={{ fontVariationSettings: "'wght' 700" }}
                  >
                    check
                  </motion.span>
                ) : (
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full transition-colors duration-500",
                    isActive ? "bg-primary" : "bg-outline-variant"
                  )}></span>
                )}
              </div>
              <span className={cn(
                "text-[10px] font-medium tracking-[0.2em] uppercase transition-colors duration-500",
                isActive || isCompleted ? "text-on-surface" : "text-outline"
              )}>
                {step.label}
              </span>
            </div>
            
            <div className="relative h-[2px] w-full bg-outline-variant/30">
              {(isCompleted || isActive) && (
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: isCompleted ? "100%" : "30%" }} // Simple indicator for active step progress
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 h-full bg-primary"
                />
              )}
            </div>
          </div>
        );
      })}
    </nav>
  );
};
