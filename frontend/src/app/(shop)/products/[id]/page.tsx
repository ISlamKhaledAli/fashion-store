"use client";

import React, { useEffect, useState, use } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { productApi } from "@/lib/api";
import { Product } from "@/types";
import { ImageGallery } from "@/components/shop/ImageGallery";
import { ProductInfo } from "@/components/shop/ProductInfo";
import { StickyShowcase } from "@/components/shop/StickyShowcase";
import { ProductAccordions } from "@/components/shop/ProductAccordions";
import { HorizontalScroll } from "@/components/shop/HorizontalScroll";
import { ProductReviews } from "@/components/shop/ProductReviews";
import { ProductCard } from "@/components/shop/ProductCard";
import Skeleton from "@/components/ui/Skeleton";
import { YouMayAlsoLike } from "@/components/shop/YouMayAlsoLike";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        // Fetch using the identifier (could be slug or ID)
        const res = await productApi.getByIdentifier(id);
        if (res.data.success) {
          const fetchedProduct = res.data.data;
          setProduct(fetchedProduct);
          
          // CRITICAL: Redirection Handling
          // If the URL identifier (the 'id' param) is not the actual product ID (meaning it's a slug),
          // redirect to the stable ID-based URL to ensure consistency.
          if (id !== fetchedProduct.id) {
            router.replace(`/products/${fetchedProduct.id}`);
          }

          // Fetch related products based on category
          const relatedRes = await productApi.getAll({ 
            category: fetchedProduct.categoryId,
            limit: 4 
          });
          if (relatedRes.data.success) {
            setRelatedProducts(relatedRes.data.data.filter(p => p.id !== fetchedProduct.id));
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        // Smooth transition for entry
        setTimeout(() => setIsLoading(false), 300);
      }
    };

    fetchProduct();
  }, [id, router]);

  if (isLoading) {
    return (
      <div className="max-w-[1440px] mx-auto px-8 lg:px-12 py-32 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <Skeleton className="lg:col-span-7 aspect-square" />
          <div className="lg:col-span-5 space-y-8">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-32" />
            <Skeleton className="h-14" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="h-[60vh] flex items-center justify-center flex-col gap-4">
        <h1 className="text-4xl font-medium tracking-tighter">Product not found</h1>
        <p className="text-on-surface-variant text-sm uppercase tracking-widest font-bold">
          The piece you&apos;re looking for might have moved.
        </p>
      </div>
    );
  }

  const features = [
    {
      icon: "eco",
      title: "Virgin Wool Blend",
      description: "Sourced from the finest Italian mills, our virgin wool is processed without harsh chemicals, maintaining its natural lanolin for weather resistance."
    },
    {
      icon: "architecture",
      title: "Anatomical Tailoring",
      description: "Developed over eighteen months, our fit pattern follows the natural curvature of the spine and shoulders, ensuring comfort and silhouette."
    },
    {
      icon: "history",
      title: "Heirloom Quality",
      description: "Every seam is reinforced with silk-wrapped thread. Designed to be an investment piece passed down through generations."
    },
    {
      icon: "ac_unit",
      title: "Thermal Regulation",
      description: "The dense weave provides natural insulation for temperatures as low as -10°C while remaining breathable for spring transitions."
    }
  ];

  const accordionItems = [
    {
      title: "Description",
      content: product.description || "A modern interpretation of the classic naval bridge coat. Features a double-breasted closure, oversized notched lapels, and hidden internal pockets."
    },
    {
      title: "Materials",
      content: "100% Virgin Wool Exterior, 100% Cupro Silk Lining. Sustainably sourced in compliance with international environmental standards."
    },
    {
      title: "Care",
      content: "Professional dry clean only. Store on a wide-shouldered hanger to maintain internal structure. Brush gently with a natural garment brush after wear."
    },
    {
      title: "Shipping & Returns",
      content: "Complimentary Carbon-Neutral Shipping worldwide. Returns accepted within 14 days of delivery in original condition."
    }
  ];

  return (
    <main className="pt-24 min-h-screen">
      {/* 1. Header Section: Image + Primary Info */}
      <section className="bg-transparent max-w-[1440px] mx-auto px-8 lg:px-12 py-16 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
        {/* Gallery Column */}
        <div className="lg:col-span-7">
          <ImageGallery images={product.images} />
        </div>
        
        {/* Info Column */}
        <div className="lg:col-span-5">
          <ProductInfo product={product} />
        </div>
      </section>

      {/* 2. Scroll Storytelling Section */}
      <StickyShowcase 
        image={product.images[0]?.url} 
        stories={features} 
      />

      {/* 3. Detailed Accordions */}
      <ProductAccordions items={accordionItems} />

      {/* 4. Complete the Look Horizontal Scroll */}
      <HorizontalScroll excludeId={product.id} />

      {/* 5. Reviews Section */}
      <ProductReviews 
        productId={product.id} 
        avgRating={product.avgRating} 
        reviewCount={product.reviewCount} 
      />

      {/* 6. You May Also Like Section */}
      {/* @ts-expect-error - category is populated from backend even if type doesn't reflect it */}
      <YouMayAlsoLike categorySlug={product.category?.slug} excludeId={product.id} />
    </main>
  );
}
