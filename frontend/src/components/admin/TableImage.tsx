"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface TableImageProps {
  src?: string | null;
  alt?: string;
  active?: boolean;
  className?: string;
  containerClassName?: string;
}

/**
 * Reusable component for table/list images with a premium "Vibrant" interaction.
 * Uses the global `.vibrant-img` CSS class defined in globals.css.
 * Responds to hover on ANY ancestor: <tr>, .group, .group/*, [data-active].
 */
export const TableImage: React.FC<TableImageProps> = ({
  src,
  alt = "Row image",
  active = false,
  className,
  containerClassName,
}) => {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden bg-zinc-100",
        containerClassName
      )}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className={cn(
            "vibrant-img h-full w-full object-cover",
            active && "is-active",
            className
          )}
        />
      ) : (
        <span className="text-[10px] font-black tracking-widest text-zinc-300 uppercase">
          IMG
        </span>
      )}
    </div>
  );
};
