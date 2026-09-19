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
    <div className="relative space-y-8 pl-8 before:absolute before:top-2 before:bottom-2 before:left-[11px] before:w-[2px] before:bg-zinc-100 before:shadow-inner before:content-['']">
      {steps.map((step, i) => (
        <div key={i} className="group/step relative">
          <div
            className={cn(
              "absolute top-1 -left-[26px] z-10 h-4 w-4 rounded-full border-4 border-white shadow-sm transition-all duration-700",
              step.completed
                ? "scale-110 bg-zinc-900 shadow-zinc-200"
                : "bg-zinc-200"
            )}
          ></div>
          <div className="flex flex-col">
            <div
              className={cn(
                "text-sm font-bold tracking-tight transition-colors duration-300",
                step.completed ? "text-zinc-900" : "text-zinc-400"
              )}
            >
              {step.name}
            </div>
            <div className="mt-1 text-[10px] font-bold tracking-widest text-zinc-500 uppercase decoration-zinc-300 opacity-80">
              {step.date}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

OrderTimeline.displayName = "OrderTimeline";
