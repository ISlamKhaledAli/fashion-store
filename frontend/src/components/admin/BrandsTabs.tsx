"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export interface BrandTabItem {
  id: string;
  label: string;
  count?: number;
}

interface BrandsTabsProps {
  tabs: BrandTabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
}

/**
 * BrandsTabs - A premium, minimal tab navigation component.
 * Features softer typography and smooth framer-motion animations.
 */
export const BrandsTabs: React.FC<BrandsTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className,
}) => {
  return (
    <div className={cn("flex items-center gap-10 border-b border-zinc-100 px-2", className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        
        return (
          <Button
            variant="none"
            size="none"
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative pb-4 pt-1 flex items-center gap-2.5 transition-all duration-300 outline-none group",
              isActive 
                ? "text-zinc-900 font-semibold" 
                : "text-zinc-400 hover:text-zinc-600 font-medium"
            )}
          >
            <span className="text-sm tracking-tight">{tab.label}</span>
            
            {tab.count !== undefined && (
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-bold tabular-nums transition-all duration-300",
                isActive 
                  ? "bg-zinc-100 text-zinc-900" 
                  : "bg-zinc-50 text-zinc-400 group-hover:text-zinc-500"
              )}>
                {tab.count}
              </span>
            )}

            {/* Premium Animated Underline */}
            {isActive && (
              <motion.div
                layoutId="brandsTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-zinc-800 rounded-full"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            
            {/* Subtle Hover Indication (for non-active) */}
            {!isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-zinc-200 scale-x-0 group-hover:scale-x-100 origin-center transition-transform duration-300 rounded-full" />
            )}
          </Button>
        );
      })}
    </div>
  );
};
