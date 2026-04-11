"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, Heart, Plus } from "lucide-react";
import { Product } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";

interface ProductCardProps {
  product: Product;
  className?: string;
  delay?: number;
  variant?: "default" | "editorial";
}

export const ProductCard = ({ product, className, delay = 0, variant = "default" }: ProductCardProps) => {
  const { addItem, toggleDrawer } = useCartStore();
  const [isFavorite, setIsFavorite] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Simplification: pick first variant
    const productVariant = product.variants?.[0];
    if (!productVariant) return;
    
    addItem({
      id: `${product.id}-${productVariant.id}`,
      productId: product.id,
      variantId: productVariant.id,
      name: product.name,
      image: product.images.find(img => img.isMain)?.url || product.images[0]?.url || "",
      price: product.price,
      size: productVariant.size,
      color: productVariant.color,
      quantity: 1,
      stock: productVariant.stock,
    });
    toggleDrawer(true);
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const renderStars = (rating: number = 0, count: number = 0) => {
    const fullStars = Math.floor(rating) || 5; 
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            size={10} 
            className={cn(
              "transition-all duration-300",
              i < fullStars ? "fill-primary text-primary" : "text-outline-variant"
            )}
            strokeWidth={1.5}
          />
        ))}
        <span className="text-[10px] text-on-surface-variant ml-1">
          ({count})
        </span>
      </div>
    );
  };

  if (variant === "editorial") {
    return (
      <article
        className={cn("group cinematic-reveal", className)}
        style={{ animationDelay: `${delay}s` }}
      >
        <Link href={`/products/${product.slug}`} className="block">
          <div className="relative overflow-hidden aspect-3/4 bg-surface-container-low mb-6">
            {product.images[0] && (
              <Image
                src={product.images.find(img => img.isMain)?.url || product.images[0].url}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            )}
            
            <button
              onClick={toggleFavorite}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-primary transition-all active:scale-90 z-10 group/fav"
            >
              <Heart 
                size={20} 
                className={cn(
                  "transition-all duration-300",
                  isFavorite ? "fill-current text-white group-hover/fav:text-primary" : "text-white group-hover/fav:text-primary"
                )}
                strokeWidth={1.5}
              />
            </button>
            
            <button
              onClick={handleAddToCart}
              className="absolute bottom-0 left-0 w-full py-4 bg-primary text-on-primary text-[10px] font-bold uppercase tracking-[0.2em] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-10"
            >
              Quick Add
            </button>
          </div>
          
          <div className="space-y-1 mt-6">
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">
              {product.brand?.name || "THE CURATOR"}
            </p>
            <div className="flex justify-between items-start">
              <h3 className="text-sm font-medium tracking-tight">{product.name}</h3>
              <span className="text-sm font-medium">{formatCurrency(product.price)}</span>
            </div>
            {renderStars(product.avgRating, product.reviewCount)}
          </div>
        </Link>
      </article>
    );
  }

  // Default Variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const, delay }}
      className={cn("group", className)}
    >
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-4/5 bg-surface-container-low overflow-hidden mb-6 cinematic-ease duration-500 group-hover:-translate-y-2">
          {product.images[0] && (
            <Image
              src={product.images.find(img => img.isMain)?.url || product.images[0].url}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="object-cover cinematic-ease duration-[0.8s] group-hover:scale-110"
            />
          )}
          
          <button
            onClick={handleAddToCart}
            className="absolute bottom-6 right-6 w-12 h-12 bg-primary text-on-primary rounded-full flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100 shadow-xl"
          >
            <Plus size={24} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-lg font-medium text-on-surface">{product.name}</h4>
            <p className="text-on-surface-variant text-sm mt-1">
              {product.variants?.[0]?.color || "Default"}
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
