"use client";

import React, { useEffect, useState, use } from "react";
import { productApi } from "@/lib/api";
import { Product } from "@/types";
import { ProductGallery } from "@/components/shop/pdp/ProductGallery";
import { ProductInfo } from "@/components/shop/pdp/ProductInfo";
import { ProductStorytelling } from "@/components/shop/pdp/ProductStorytelling";
import { ProductAccordions } from "@/components/shop/pdp/ProductAccordions";
import { ProductReviews } from "@/components/shop/pdp/ProductReviews";
import { ProductCard } from "@/components/shop/ProductCard";
import { Leaf, Compass, History, Snowflake, ArrowLeft, ArrowRight } from "lucide-react";
import Skeleton from "@/components/ui/Skeleton";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const { slug } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const res = await productApi.getBySlug(slug);
        if (res.data.success) {
          setProduct(res.data.data);
          
          // Fetch related products based on category
          const relatedRes = await productApi.getAll({ 
            category: res.data.data.categoryId,
            limit: 4 
          });
          if (relatedRes.data.success) {
            setRelatedProducts(relatedRes.data.data.filter(p => p.id !== res.data.data.id));
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setTimeout(() => setIsLoading(false), 500); // 500ms delay for cinematic entry
      }
    };

    fetchProduct();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-[1440px] mx-auto px-12 py-32 space-y-16">
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
        <p className="text-on-surface-variant">The piece you&apos;re looking for might have moved.</p>
      </div>
    );
  }

  const stories = [
    {
      icon: Leaf,
      title: "Virgin Wool Blend",
      description: product.description || "Sourced from the finest Italian mills, maintaining natural lanolin for superior weather resistance and a soft hand-feel.",
    },
    {
      icon: Compass,
      title: "Anatomical Tailoring",
      description: "Developed over eighteen months, our proprietary fit pattern follows the natural curvature of the spine and shoulders.",
    },
    {
      icon: History,
      title: "Heirloom Quality",
      description: "Every seam is reinforced with silk-wrapped thread. Designed to be passed down through generations.",
    },
    {
      icon: Snowflake,
      title: "Thermal Regulation",
      description: "The dense weave provides natural insulation for temperatures as low as -10°C while remaining breathable.",
    },
  ];

  return (
    <div className="bg-surface min-h-screen">
      {/* 1. PDP Header Section */}
      <section className="max-w-[1440px] mx-auto px-12 py-16 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
        {/* Gallery Column */}
        <div className="lg:col-span-7">
          <ProductGallery images={product.images} />
        </div>
        
        {/* Info Column */}
        <div className="lg:col-span-5">
          <ProductInfo product={product} />
        </div>
      </section>

      {/* 2. Scroll Storytelling Section */}
      <ProductStorytelling 
        image={product.images.find(img => !img.isMain)?.url || product.images[0]?.url} 
        stories={stories} 
      />

      {/* 3. Detailed Accordions */}
      <ProductAccordions />

      {/* 4. Complete the Look / You May Also Like */}
      {relatedProducts.length > 0 && (
        <section className="bg-surface-container-low py-32">
          <div className="max-w-[1440px] mx-auto px-12">
            <div className="flex justify-between items-end mb-16">
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant font-bold">Recommendations</p>
                <h2 className="text-4xl font-medium tracking-tight">Complete the Look</h2>
              </div>
              <div className="hidden md:flex gap-4">
                <button className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center hover:bg-white transition-all active:scale-95">
                  <ArrowLeft size={20} strokeWidth={1.5} />
                </button>
                <button className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center hover:bg-white transition-all active:scale-95">
                  <ArrowRight size={20} strokeWidth={1.5} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((p, idx) => (
                <ProductCard 
                  key={p.id} 
                  product={p} 
                  variant="editorial" 
                  delay={idx * 0.1}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. User Reviews Section */}
      <ProductReviews />
    </div>
  );
}
