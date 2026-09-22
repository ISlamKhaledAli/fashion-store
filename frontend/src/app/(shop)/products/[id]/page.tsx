"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { productApi } from "@/lib/api";
import type { Product } from "@/types";
import { ImageGallery } from "@/components/shop/ImageGallery";
import { ProductInfo } from "@/components/shop/ProductInfo";
import { StickyShowcase } from "@/components/shop/StickyShowcase";
import { ProductAccordions } from "@/components/shop/ProductAccordions";
import { HorizontalScroll } from "@/components/shop/HorizontalScroll";
import { ProductReviews } from "@/components/shop/ProductReviews";
import Skeleton from "@/components/ui/Skeleton";
import { RecommendedProducts } from "@/components/shop/RecommendedProducts";
import ProductJsonLd from "@/components/shop/ProductJsonLd";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ color?: string }>;
}

export default function ProductDetailPage({ params, searchParams }: PageProps) {
  const { id } = use(params);
  const { color: initialColor } = use(searchParams);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState<string | null>(
    initialColor || null
  );

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

          if (fetchedProduct?.variants?.length > 0 && !initialColor) {
            setSelectedColor(fetchedProduct.variants[0].color);
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id, router, initialColor]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1440px] space-y-16 px-8 py-32 lg:px-12">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
          <Skeleton className="aspect-square lg:col-span-7" />
          <div className="space-y-8 lg:col-span-5">
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
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <h1 className="text-4xl font-medium tracking-tighter">
          Product not found
        </h1>
        <p className="text-sm font-bold tracking-widest text-on-surface-variant uppercase">
          The piece you&apos;re looking for might have moved.
        </p>
      </div>
    );
  }

  const features =
    product.features && product.features.length > 0
      ? product.features
      : [
          {
            icon: "eco",
            title: "Virgin Wool Blend",
            description:
              "Sourced from the finest Italian mills, our virgin wool is processed without harsh chemicals, maintaining its natural lanolin for weather resistance.",
          },
          {
            icon: "architecture",
            title: "Anatomical Tailoring",
            description:
              "Developed over eighteen months, our fit pattern follows the natural curvature of the spine and shoulders, ensuring comfort and silhouette.",
          },
          {
            icon: "history",
            title: "Heirloom Quality",
            description:
              "Every seam is reinforced with silk-wrapped thread. Designed to be an investment piece passed down through generations.",
          },
          {
            icon: "ac_unit",
            title: "Thermal Regulation",
            description:
              "The dense weave provides natural insulation for temperatures as low as -10°C while remaining breathable for spring transitions.",
          },
        ];

  const defaultDescription = {
    title: "Description",
    content:
      product.description ||
      "A modern interpretation of the classic naval bridge coat. Features a double-breasted closure, oversized notched lapels, and hidden internal pockets.",
  };

  const accordionItems =
    product.details && product.details.length > 0
      ? [
          ...(product.details.some(
            (d) => d.title.toLowerCase() === "description"
          )
            ? []
            : [defaultDescription]),
          ...product.details,
        ]
      : [
          defaultDescription,
          {
            title: "Materials",
            content:
              "100% Virgin Wool Exterior, 100% Cupro Silk Lining. Sustainably sourced in compliance with international environmental standards.",
          },
          {
            title: "Care",
            content:
              "Professional dry clean only. Store on a wide-shouldered hanger to maintain internal structure. Brush gently with a natural garment brush after wear.",
          },
          {
            title: "Shipping & Returns",
            content:
              "Complimentary Carbon-Neutral Shipping worldwide. Returns accepted within 14 days of delivery in original condition.",
          },
        ];

  return (
    <main className="min-h-screen pt-24">
      <ProductJsonLd product={product} />
      {/* 1. Header Section: Image + Primary Info */}
      <section className="mx-auto grid max-w-[1440px] grid-cols-1 gap-8 bg-transparent px-4 py-6 sm:gap-12 sm:px-8 sm:py-16 lg:grid-cols-12 lg:gap-24 lg:px-12">
        {/* Gallery Column */}
        <div className="lg:col-span-7">
          <ImageGallery
            images={product.images}
            selectedColor={selectedColor}
            productName={product.name}
          />
        </div>

        {/* Info Column */}
        <div className="lg:col-span-5">
          <ProductInfo
            product={product}
            selectedColor={selectedColor}
            onColorSelect={setSelectedColor}
          />
        </div>
      </section>

      {/* 2. Scroll Storytelling Section */}
      <StickyShowcase
        image={
          product.images.find((img) => img.isMain)?.url ||
          product.images[0]?.url ||
          ""
        }
        stories={features}
      />

      {/* 3. Detailed Accordions */}
      <ProductAccordions items={accordionItems} />

      {/* 4. Complete the Look Horizontal Scroll */}
      <HorizontalScroll excludeId={product.id} />

      {/* 5. AI Recommendations Section */}
      <RecommendedProducts currentProductId={product.id} />

      {/* 6. Reviews Section */}
      <ProductReviews
        productId={product.id}
        avgRating={product.avgRating}
        reviewCount={product.reviewCount}
      />
    </main>
  );
}
