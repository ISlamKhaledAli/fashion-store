"use client";

import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Review {
  id: string;
  user: string;
  rating: number;
  date: string;
  comment: string;
  isVerified?: boolean;
}

export const ProductReviews = () => {
  const reviews: Review[] = [
    {
      id: "1",
      user: "James H.",
      rating: 5,
      date: "Oct 12, 2024",
      comment: "The weight of this coat is substantial. You can tell immediately it's made from high-grade wool. Fits perfectly over a suit.",
      isVerified: true,
    },
    {
      id: "2",
      user: "Elena R.",
      rating: 5,
      date: "Oct 08, 2024",
      comment: "Minimalist perfection. The hidden pockets are a great touch. Keeps me warm even in NYC winters.",
      isVerified: true,
    },
    {
      id: "3",
      user: "Marcus V.",
      rating: 4,
      date: "Sep 28, 2024",
      comment: "Incredible quality. Only reason for 4 stars is the sleeve length was slightly longer than expected, but a quick tailoring fixed it.",
      isVerified: true,
    },
  ];

  return (
    <section className="max-w-[1440px] mx-auto px-12 py-32 border-t border-surface-container">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-16">
        <div className="lg:col-span-1">
          <h2 className="text-3xl font-medium mb-6 tracking-tight">User Reviews</h2>
          <div className="text-6xl font-bold mb-2 tracking-tighter">4.8</div>
          <div className="flex gap-1 text-primary mb-4">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={20}
                className="fill-primary text-primary"
                strokeWidth={1.5}
              />
            ))}
          </div>
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">
            Based on 128 Reviews
          </p>
          <button className="mt-8 w-full py-4 border border-primary text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-primary hover:text-white transition-all duration-300">
            Write a Review
          </button>
        </div>

        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
          {reviews.map((review) => (
            <div key={review.id} className="space-y-4 animate-in fade-in duration-700">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-on-surface">{review.user}</p>
                  {review.isVerified && (
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1 italic">
                      Verified Buyer
                    </p>
                  )}
                </div>
                <div className="flex gap-0.5 text-primary text-sm">
                   {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={12}
                      className={cn(
                        "transition-all",
                        i < review.rating ? "fill-primary text-primary" : "text-outline-variant"
                      )}
                      strokeWidth={1.5}
                    />
                  ))}
                </div>
              </div>
              <p className="text-on-surface-variant italic font-light leading-relaxed">
                &quot;{review.comment}&quot;
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
