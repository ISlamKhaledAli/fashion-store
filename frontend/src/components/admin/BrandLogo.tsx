"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg" | "xl" | "xxl";
  className?: string;
  containerClassName?: string;
}

/**
 * BrandLogo - Premium specialized image wrapper for designer brand logos.
 * Ensures consistent alignment, no-distortion scaling, and elegant fallbacks.
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  src,
  name,
  size = "md",
  className,
  containerClassName,
}) => {
  const internalSize = {
    sm: "w-8 h-8 text-[10px]",
    md: "w-10 h-10 text-[11px]",
    lg: "w-12 h-12 text-[13px]",
    xl: "w-16 h-16 text-[15px]",
    xxl: "w-[200px] h-[200px] text-4xl",
  }[size];

  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  return (
    <div
      className={cn(
        "shrink-0 rounded-full bg-stone-50 border border-outline-variant/10 flex items-center justify-center overflow-hidden transition-all duration-300",
        internalSize,
        containerClassName
      )}
    >
      {src ? (
        <div className="w-full h-full p-2 flex items-center justify-center hover:scale-110 transition-transform duration-500">
          <img
            src={src}
            alt={`${name} logo`}
            className={cn(
              "max-w-full max-h-full object-contain pointer-events-none",
              className
            )}
            onLoad={(e) => {
              (e.currentTarget as HTMLImageElement).classList.add("opacity-100");
            }}
            onError={(e) => {
              // Hide broken image if it fails to load
              (e.currentTarget as HTMLImageElement).classList.add("hidden");
              // Parent can show background initials instead if we had a state here
            }}
          />
        </div>
      ) : (
        <span className="font-semibold text-zinc-400 tracking-tight tabular-nums select-none italic text-opacity-80">
          {initials}
        </span>
      )}
    </div>
  );
};
