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
  containerClassName
}) => {
  return (
    <div className={cn(
      "overflow-hidden shrink-0 bg-zinc-100 flex items-center justify-center",
      containerClassName
    )}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className={cn(
            "w-full h-full object-cover vibrant-img",
            active && "is-active",
            className
          )}
        />
      ) : (
        <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">
          IMG
        </span>
      )}
    </div>
  );
};

