"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export interface AdminTab {
  id: string;
  label: string;
  count?: number;
}

interface AdminTabsProps {
  tabs: AdminTab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
  /** Unique layoutId for framer-motion — required when multiple AdminTabs exist on the same page */
  layoutId?: string;
}

/**
 * Reusable editorial-style tab navigation for admin pages.
 * Animated underline via framer-motion layoutId.
 * Counts are displayed as small badges, darkened on active.
 */
export const AdminTabs: React.FC<AdminTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className,
  layoutId = "adminTabUnderline",
}) => {
  return (
    <div
      className={cn(
        "flex items-center gap-8 border-b border-zinc-100 px-2 overflow-x-auto no-scrollbar",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <Button
            variant="none"
            size="none"
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative pb-4 pt-1 flex items-center gap-2 whitespace-nowrap transition-colors duration-200 outline-none",
              "text-[10px] font-black uppercase tracking-[0.3em]",
              isActive
                ? "text-zinc-950"
                : "text-zinc-400 hover:text-zinc-700"
            )}
          >
            {tab.label}

            {tab.count !== undefined && (
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded text-[9px] font-bold tabular-nums transition-colors duration-200",
                  isActive
                    ? "bg-zinc-950 text-white"
                    : "bg-zinc-100 text-zinc-400"
                )}
              >
                {tab.count}
              </span>
            )}

            {/* Animated active underline */}
            {isActive && (
              <motion.div
                layoutId={layoutId}
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-950 rounded-full"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}

            {/* Hover underline (only when not active) */}
            {!isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-200 scale-x-0 hover:scale-x-100 origin-left transition-transform duration-200 rounded-full" />
            )}
          </Button>
        );
      })}
    </div>
  );
};
