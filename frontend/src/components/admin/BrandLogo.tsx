"use client";

import React from "react";
import Image from "next/image";
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
        <div className="relative flex h-full w-full items-center justify-center p-2 transition-transform duration-500 hover:scale-110">
          <Image
            src={src}
            alt={`${name} logo`}
            fill
            className={cn("pointer-events-none object-contain p-2", className)}
            unoptimized
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
