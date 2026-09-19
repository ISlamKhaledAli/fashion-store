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
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-outline-variant/10 bg-stone-50 transition-all duration-300",
        internalSize,
        containerClassName
      )}
    >
      {src ? (
        <div className="flex h-full w-full items-center justify-center p-2 transition-transform duration-500 hover:scale-110">
          <img
            src={src}
            alt={`${name} logo`}
            className={cn(
              "pointer-events-none max-h-full max-w-full object-contain",
              className
            )}
            onLoad={(e) => {
              (e.currentTarget as HTMLImageElement).classList.add(
                "opacity-100"
              );
            }}
            onError={(e) => {
              // Hide broken image if it fails to load
              (e.currentTarget as HTMLImageElement).classList.add("hidden");
              // Parent can show background initials instead if we had a state here
            }}
          />
        </div>
      ) : (
        <span className="text-opacity-80 font-semibold tracking-tight text-zinc-400 italic tabular-nums select-none">
          {initials}
        </span>
      )}
    </div>
  );
};
