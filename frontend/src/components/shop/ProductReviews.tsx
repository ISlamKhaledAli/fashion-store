"use client";

import React, { useEffect, useState } from "react";
import { productApi, reviewApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Review {
  id: string;
  user?: {
    name: string;
    avatar?: string;
  };
  rating: number;
  title?: string;
  body: string;
  createdAt: string;
}

interface ProductReviewsProps {
  productId: string;
  avgRating?: number | null;
  reviewCount?: number;
}

export const ProductReviews = ({ productId, avgRating, reviewCount }: ProductReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [hasReviewed, setHasReviewed] = useState(false);
  
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await productApi.getReviews(productId);
        if (res.data.success) {
          const fetchedReviews = res.data.data as Review[];
          setReviews(fetchedReviews);
          
          // Check if current user has already reviewed
          if (user) {
            const userReview = fetchedReviews.some(r => r.user?.name === user.name);
            setHasReviewed(userReview);
          }
        }
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
      }
    };
    fetchReviews();
  }, [productId, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    
    setIsSubmitting(true);
    setError("");
    
    try {
      const res = await reviewApi.create({
        productId,
        rating,
        title,
        body
      });
      
      if (res.data.success) {
        // Add new review to list immediately
        const newReview: Review = {
          ...res.data.data,
          user: { name: user?.name || "Anonymous", avatar: user?.avatar }
        };
        setReviews([newReview, ...reviews]);
        setShowForm(false);
        setHasReviewed(true);
        // Reset form
        setTitle("");
        setBody("");
        setRating(5);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-white max-w-[1440px] mx-auto px-8 lg:px-12 py-24 lg:py-32 border-t border-outline-variant/10">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-16">
        <div className="lg:col-span-1 space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-medium tracking-tight">User Reviews</h2>
            <div className="space-y-2">
              <div className="text-6xl font-bold tracking-tighter">{avgRating != null ? avgRating.toFixed(1) : "—"}</div>
              <div className="flex text-primary">
                {[...Array(5)].map((_, i) => (
                  <span 
                    key={i} 
                    className="material-symbols-outlined text-2xl" 
                    style={{ fontVariationSettings: `'FILL' ${avgRating != null && i < Math.floor(avgRating) ? 1 : 0}` }}
                  >
                    star
                  </span>
                ))}
              </div>
              <p className="text-xs text-on-surface-variant uppercase tracking-[0.2em] font-bold">
                {reviews.length > 0 ? `Based on ${reviews.length} Reviews` : "No reviews yet"}
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-outline-variant/30">
            {!isAuthenticated ? (
              <div className="space-y-4">
                <p className="text-sm text-on-surface-variant italic">Share your thoughts on this product.</p>
                <Link href={`/login?redirect=/products/${productId}`}>
                  <Button variant="outline" className="w-full text-[10px] uppercase tracking-widest font-bold py-4">
                    Login to Write a Review
                  </Button>
                </Link>
              </div>
            ) : hasReviewed ? (
              <div className="p-4 bg-surface-container-low rounded-sm border border-outline-variant/20">
                <p className="text-sm text-on-surface-variant font-medium text-center">
                  You have already reviewed this product.
                </p>
              </div>
            ) : !showForm ? (
              <Button 
                onClick={() => setShowForm(true)}
                className="w-full py-5 border border-primary text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-primary hover:text-white transition-all duration-300"
                variant="outline"
              >
                Write a Review
              </Button>
            ) : null}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-16">
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <form onSubmit={handleSubmit} className="bg-surface-container-lowest p-8 md:p-12 border border-outline-variant rounded-sm space-y-8">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-medium tracking-tight">Submit Your Review</h3>
                    <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
                      <span className="material-symbols-outlined">close</span>
                    </Button>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Rating</p>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Button
                            key={star}
                            type="button"
                            variant="none"
                            size="none"
                            onClick={() => setRating(star)}
                            className="text-primary hover:scale-110 transition-transform cursor-pointer"
                          >
                            <span 
                              className="material-symbols-outlined text-3xl"
                              style={{ fontVariationSettings: `'FILL' ${star <= rating ? 1 : 0}` }}
                            >
                              star
                            </span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Input
                      id="title"
                      label="Review Title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Sum up your experience"
                      required
                    />

                    <Textarea
                      id="body"
                      label="Your Feedback"
                      rows={5}
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="What do you like or dislike? How was the fit?"
                      required
                    />
                  </div>

                  {error && (
                    <p className="text-red-600 text-sm font-medium">{error}</p>
                  )}

                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                    className="px-12 py-4 bg-primary text-on-primary text-[10px] uppercase tracking-widest font-bold hover:bg-primary/90 transition-all"
                  >
                    Submit Review
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
            <AnimatePresence mode="popLayout">
              {reviews.length === 0 ? (
                <div className="col-span-full py-12 text-center border-2 border-dashed border-outline-variant/20">
                  <p className="text-on-surface-variant italic">No reviews yet. Be the first to share your experience!</p>
                </div>
              ) : (
                reviews.map((review, idx) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.05 }}
                    className="space-y-4 p-8 border border-outline-variant/20 rounded-sm hover:border-outline-variant transition-colors bg-white group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <p className="font-medium tracking-tight text-lg">{review.user?.name}</p>
                          <span className="w-1 h-1 bg-outline-variant rounded-full" />
                          <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {review.title && <h4 className="font-bold text-sm tracking-tight">{review.title}</h4>}
                      </div>
                      <div className="flex text-primary">
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
                    <p className="text-on-surface-variant leading-relaxed text-sm">
                      {review.body}
                    </p>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

