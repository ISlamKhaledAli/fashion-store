"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import type { Product } from "@/types";
import { useProductList } from "@/hooks/useProductList";

interface Props {
  excludeId: string;
}

export const HorizontalScroll = ({ excludeId }: Props) => {
  const { products, loading } = useProductList({ limit: 8, excludeId });
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (loading) {
    return (
      <section className="bg-surface-container-low py-24 sm:py-32">
        <div className="mx-auto w-full max-w-[1440px] px-12">
          <div className="mb-12 flex items-end justify-between">
            <h2 className="text-4xl font-medium tracking-tight">
              Complete the Look
            </h2>
          </div>
          <div className="flex gap-8 overflow-x-auto pb-12">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="min-w-[320px]">
                <div className="mb-4 aspect-3/4 animate-pulse overflow-hidden rounded bg-surface-container" />
                <div className="mb-2 h-4 w-2/3 animate-pulse rounded bg-surface-container" />
                <div className="h-4 w-1/4 animate-pulse rounded bg-surface-container" />
              </div>
            ))}
          </div>
          <div className="mt-2 mb-8 h-[2px] w-[98%] bg-black/90 dark:bg-white/90"></div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="bg-surface-container-low py-24 sm:py-32">
      <div className="mx-auto w-full max-w-[1440px] px-12">
        <div className="mb-12 flex items-end justify-between">
          <h2 className="text-4xl font-medium tracking-tight">
            Complete the Look
          </h2>
          <div className="flex gap-4">
            <Button
              variant="outline"
              size="none"
              onClick={() => scroll("left")}
              className="group flex h-12 w-12 items-center justify-center rounded-full"
              icon={
                <span className="material-symbols-outlined transition-transform group-hover:-translate-x-0.5">
                  chevron_left
                </span>
              }
            />
            <Button
              variant="outline"
              size="none"
              onClick={() => scroll("right")}
              className="group flex h-12 w-12 items-center justify-center rounded-full"
              icon={
                <span className="material-symbols-outlined transition-transform group-hover:translate-x-0.5">
                  chevron_right
                </span>
              }
            />
          </div>
        </div>

        <div
          ref={scrollRef}
          className="custom-scrollbar flex snap-x gap-8 overflow-x-auto pb-12"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.map((product: Product, idx: number) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group animate-in fade-in slide-in-from-right-8 fill-mode-both min-w-[320px] snap-start duration-700"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="relative mb-4 flex aspect-3/4 items-center justify-center overflow-hidden bg-white dark:bg-surface-container-low">
                {product.images?.[0]?.url ? (
                  <Image
                    src={product.images[0].url}
                    alt={product.name}
                    fill
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <span className="material-symbols-outlined text-3xl text-zinc-400">
                    checkroom
                  </span>
                )}
              </div>
              <h4 className="truncate font-medium">{product.name}</h4>
              <p className="mt-1 text-sm text-on-surface-variant">
                ${product.price.toFixed(2)}
              </p>
            </Link>
          ))}
        </div>
        <div className="mt-2 mb-8 h-[2px] w-[98%] bg-black/90 dark:bg-white/90"></div>
      </div>
    </section>
  );
};
