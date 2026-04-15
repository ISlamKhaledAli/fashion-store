"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface Step {
  name: string;
  date: string;
  completed: boolean;
}

interface OrderTimelineProps {
  steps: Step[];
}

export const OrderTimeline = React.memo(({ steps }: OrderTimelineProps) => {
  return (
    <div className="relative space-y-8 pl-8 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-zinc-100 before:shadow-inner">
      {steps.map((step, i) => (
        <div key={i} className="relative group/step">
          <div className={cn(
            "absolute -left-[26px] top-1 w-4 h-4 rounded-full border-4 border-white shadow-sm transition-all duration-700 z-10",
            step.completed ? "bg-zinc-900 scale-110 shadow-zinc-200" : "bg-zinc-200"
          )}></div>
          <div className="flex flex-col">
            <div className={cn(
              "text-sm font-bold tracking-tight transition-colors duration-300",
              step.completed ? "text-zinc-900" : "text-zinc-400"
            )}>
              {step.name}
            </div>
            <div className="text-[10px] font-bold text-zinc-500 mt-1 uppercase tracking-widest opacity-80 decoration-zinc-300">
              {step.date}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

OrderTimeline.displayName = "OrderTimeline";
