"use client";

import React, { useEffect, useState } from "react";
import { productApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/Button";

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  isVerified: boolean;
}

interface ProductReviewsProps {
  productId: string;
  avgRating: number;
  reviewCount: number;
}

export const ProductReviews = ({ productId, avgRating, reviewCount }: ProductReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await productApi.getReviews(productId);
        if (res.data.success) {
          setReviews(res.data.data as Review[]);
        } else {
          // Mock data fallback if API is not implemented
          setReviews([
            {
              id: "1",
              userName: "James H.",
              rating: 5,
              comment: "The weight of this coat is substantial. You can tell immediately it's made from high-grade wool. Fits perfectly over a suit.",
              createdAt: "2023-10-24",
              isVerified: true
            },
            {
              id: "2",
              userName: "Elena R.",
              rating: 5,
              comment: "Minimalist perfection. The hidden pockets are a great touch. Keeps me warm even in NYC winters.",
              createdAt: "2023-10-23",
              isVerified: true
            }
          ]);
        }
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
      }
    };
    fetchReviews();
  }, [productId]);

  return (
    <section className="bg-white max-w-[1440px] mx-auto px-8 lg:px-12 py-24 lg:py-32">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-16">
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-3xl font-medium tracking-tight">User Reviews</h2>
          <div className="space-y-2">
            <div className="text-6xl font-bold tracking-tighter">{avgRating.toFixed(1)}</div>
            <div className="flex text-primary">
              {[...Array(5)].map((_, i) => (
                <span 
                  key={i} 
                  className="material-symbols-outlined text-2xl" 
                  style={{ fontVariationSettings: `'FILL' ${i < Math.floor(avgRating) ? 1 : 0}` }}
                >
                  star
                </span>
              ))}
            </div>
          </div>
          <p className="text-xs text-on-surface-variant uppercase tracking-[0.2em] font-bold">
            Based on {reviewCount} Reviews
          </p>
          <Button 
            className="mt-8 w-full py-5 border border-primary text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-primary hover:text-white transition-all duration-300 active:scale-95"
            variant="outline"
            size="none"
          >
            Write a Review
          </Button>
        </div>

        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
          <AnimatePresence mode="popLayout">
            {reviews.map((review, idx) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="space-y-4 p-8 border border-surface-container-high rounded-sm hover:border-outline transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="font-medium tracking-tight text-lg">{review.userName}</p>
                    {review.isVerified && (
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">verified</span>
                        Verified Buyer
                      </p>
                    )}
                  </div>
                  <div className="flex text-primary text-xs">
                    {[...Array(5)].map((_, i) => (
                      <span 
                        key={i} 
                        className="material-symbols-outlined text-sm" 
                        style={{ fontVariationSettings: `'FILL' ${i < review.rating ? 1 : 0}` }}
                      >
                        star
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-on-surface-variant leading-relaxed italic text-lg">
                  &quot;{review.comment}&quot;
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
