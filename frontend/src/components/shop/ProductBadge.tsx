import React, { useState } from "react";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

interface ProductBadgeProps {
  product: Product;
  className?: string;
}

export const ProductBadge: React.FC<ProductBadgeProps> = ({
  product,
  className,
}) => {
  const hasVariants = product.variants && product.variants.length > 0;
  const isSoldOut =
    hasVariants && product.variants.every((v) => (v.stock ?? 0) <= 0);

  const discountPercent =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(
          ((product.comparePrice - product.price) / product.comparePrice) * 100
        )
      : 0;

  const [isNew] = useState(() => {
    if (!product.createdAt) return false;
    const createdTime = new Date(product.createdAt).getTime();
    if (Number.isNaN(createdTime)) return false;
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    return Date.now() - createdTime < thirtyDaysInMs;
  });

  const badges: { key: string; label: string; style: string }[] = [];

  if (isSoldOut) {
    badges.push({
      key: "sold-out",
      label: "Sold Out",
      style:
        "bg-black/90 text-zinc-300 border border-white/15 shadow-sm backdrop-blur-md",
    });
  } else {
    if (discountPercent > 0) {
      badges.push({
        key: "sale",
        label: `-${discountPercent}%`,
        style:
          "bg-rose-950/90 text-rose-200 border border-rose-500/30 shadow-sm backdrop-blur-md",
      });
    }

    if (isNew) {
      badges.push({
        key: "new",
        label: "New",
        style:
          "bg-white/95 text-black border border-black/10 shadow-sm backdrop-blur-md",
      });
    }

    if (product.featured && badges.length < 2) {
      badges.push({
        key: "featured",
        label: "Featured",
        style:
          "bg-amber-950/90 text-amber-200 border border-amber-500/30 shadow-sm backdrop-blur-md",
      });
    }
  }

  if (badges.length === 0) return null;

  return (
    <div
      className={cn(
        "pointer-events-none absolute top-3 left-3 z-10 flex flex-col items-start gap-1.5",
        className
      )}
    >
      {badges.map((badge) => (
        <span
          key={badge.key}
          className={cn(
            "px-2.5 py-1 text-[9px] font-bold tracking-[0.2em] uppercase select-none",
            badge.style
          )}
        >
          {badge.label}
        </span>
      ))}
    </div>
  );
};
