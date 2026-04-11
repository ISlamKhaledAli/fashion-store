"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Product } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";

interface ProductCardProps {
  product: Product;
  className?: string;
  delay?: number;
}

export const ProductCard = ({ product, className, delay = 0 }: ProductCardProps) => {
  const { addItem, toggleDrawer } = useCartStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Simplification: pick first variant
    const variant = product.variants[0];
    addItem({
      id: `${product.id}-${variant.id}`,
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      image: product.images.find(img => img.isMain)?.url || product.images[0]?.url,
      price: product.price,
      size: variant.size,
      color: variant.color,
      quantity: 1,
      stock: variant.stock,
    });
    toggleDrawer(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const, delay }}
      className={cn("group", className)}
    >
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] bg-surface-container-low overflow-hidden mb-6 cinematic-ease duration-500 group-hover:-translate-y-2">
          {product.images[0] && (
            <Image
              src={product.images.find(img => img.isMain)?.url || product.images[0].url}
              alt={product.name}
              fill
              className="object-cover cinematic-ease duration-[0.8s] group-hover:scale-110"
            />
          )}
          
          <button
            onClick={handleAddToCart}
            className="absolute bottom-6 right-6 w-12 h-12 bg-primary text-on-primary rounded-full flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100 shadow-xl"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>

        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-lg font-medium text-on-surface">{product.name}</h4>
            <p className="text-on-surface-variant text-sm mt-1">
              {product.variants[0]?.color}
            </p>
          </div>
          <span className="text-lg font-bold tracking-tighter text-on-surface">
            {formatCurrency(product.price)}
          </span>
        </div>
      </Link>
    </motion.div>
  );
};
