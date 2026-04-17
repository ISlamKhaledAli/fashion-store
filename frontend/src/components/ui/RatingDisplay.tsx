import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingDisplayProps {
  rating?: number | null;
  count?: number;
  className?: string;
  size?: number;
}

export const RatingDisplay = ({ rating, count = 0, className, size = 10 }: RatingDisplayProps) => {
  if (rating === null || rating === undefined || count === 0) {
    return (
      <div className={cn("flex items-center", className)}>
        <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
          No reviews yet
        </span>
      </div>
    );
  }

  const fullStars = Math.floor(rating);

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            size={size} 
            className={cn(
              "transition-all duration-300",
              i < fullStars ? "fill-primary text-primary" : "text-outline-variant"
            )}
            strokeWidth={1.5}
          />
        ))}
      </div>
      <span className="text-[10px] text-on-surface-variant ml-1 font-medium">
        ({count})
      </span>
    </div>
  );
};
