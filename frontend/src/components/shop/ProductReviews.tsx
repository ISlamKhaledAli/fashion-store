"use client";

import React, { useEffect, useState } from "react";
import { productApi, reviewApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import Link from "next/link";
import type { Review } from "@/types";

interface ProductReviewsProps {
  productId: string;
  avgRating?: number | null;
  reviewCount?: number;
}

export const ProductReviews = ({
  productId,
  avgRating,
  reviewCount: _reviewCount,
}: ProductReviewsProps) => {
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
            const userReview = fetchedReviews.some((r) => r.userId === user.id);
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
        body,
      });

      if (res.data.success) {
        // Add new review to list immediately
        const newReview: Review = {
          ...(res.data.data as Review),
          user: { name: user?.name || "Anonymous", avatar: user?.avatar },
        };
        setReviews([newReview, ...reviews]);
        setShowForm(false);
        setHasReviewed(true);
        // Reset form
        setTitle("");
        setBody("");
        setRating(5);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-[1440px] border-t border-outline-variant/10 bg-white px-8 py-24 lg:px-12 lg:py-32">
      <div className="grid grid-cols-1 gap-16 lg:grid-cols-4">
        <div className="space-y-8 lg:col-span-1">
          <div className="space-y-4">
            <h2 className="text-3xl font-medium tracking-tight">
              User Reviews
            </h2>
            <div className="space-y-2">
              <div className="text-6xl font-bold tracking-tighter">
                {avgRating != null ? avgRating.toFixed(1) : "—"}
              </div>
              <div className="flex text-primary">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className="material-symbols-outlined text-2xl"
                    style={{
                      fontVariationSettings: `'FILL' ${avgRating != null && i < Math.floor(avgRating) ? 1 : 0}`,
                    }}
                  >
                    star
                  </span>
                ))}
              </div>
              <p className="text-xs font-bold tracking-[0.2em] text-on-surface-variant uppercase">
                {reviews.length > 0
                  ? `Based on ${reviews.length} Reviews`
                  : "No reviews yet"}
              </p>
            </div>
          </div>

          <div className="border-t border-outline-variant/30 pt-8">
            {!isAuthenticated ? (
              <div className="space-y-4">
                <p className="text-sm text-on-surface-variant italic">
                  Share your thoughts on this product.
                </p>
                <Link href={`/login?redirect=/products/${productId}`}>
                  <Button
                    variant="outline"
                    className="w-full py-4 text-[10px] font-bold tracking-widest uppercase"
                  >
                    Login to Write a Review
                  </Button>
                </Link>
              </div>
            ) : hasReviewed ? (
              <div className="rounded-sm border border-outline-variant/20 bg-surface-container-low p-4">
                <p className="text-center text-sm font-medium text-on-surface-variant">
                  You have already reviewed this product.
                </p>
              </div>
            ) : !showForm ? (
              <Button
                onClick={() => setShowForm(true)}
                className="w-full border border-primary py-5 text-[10px] font-bold tracking-[0.3em] uppercase transition-all duration-300 hover:bg-primary hover:text-white"
                variant="outline"
              >
                Write a Review
              </Button>
            ) : null}
          </div>
        </div>

        <div className="space-y-16 lg:col-span-3">
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <form
                  onSubmit={handleSubmit}
                  className="space-y-8 rounded-sm border border-outline-variant bg-surface-container-lowest p-8 md:p-12"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-medium tracking-tight">
                      Submit Your Review
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowForm(false)}
                    >
                      <span className="material-symbols-outlined">close</span>
                    </Button>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
                        Rating
                      </p>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Button
                            key={star}
                            type="button"
                            variant="none"
                            size="none"
                            onClick={() => setRating(star)}
                            className="cursor-pointer text-primary transition-transform hover:scale-110"
                          >
                            <span
                              className="material-symbols-outlined text-3xl"
                              style={{
                                fontVariationSettings: `'FILL' ${star <= rating ? 1 : 0}`,
                              }}
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
                    <p className="text-sm font-medium text-red-600">{error}</p>
                  )}

                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                    className="bg-primary px-12 py-4 text-[10px] font-bold tracking-widest text-on-primary uppercase transition-all hover:bg-primary/90"
                  >
                    Submit Review
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 gap-x-12 gap-y-16 md:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {reviews.length === 0 ? (
                <div className="col-span-full border-2 border-dashed border-outline-variant/20 py-12 text-center">
                  <p className="text-on-surface-variant italic">
                    No reviews yet. Be the first to share your experience!
                  </p>
                </div>
              ) : (
                reviews.map((review, idx) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.05 }}
                    className="group space-y-4 rounded-sm border border-outline-variant/20 bg-white p-8 transition-colors hover:border-outline-variant"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <p className="text-lg font-medium tracking-tight">
                            {review.user?.name}
                          </p>
                          <span className="h-1 w-1 rounded-full bg-outline-variant" />
                          <span className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {review.title && (
                          <h4 className="text-sm font-bold tracking-tight">
                            {review.title}
                          </h4>
                        )}
                      </div>
                      <div className="flex text-primary">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className="material-symbols-outlined text-sm"
                            style={{
                              fontVariationSettings: `'FILL' ${i < review.rating ? 1 : 0}`,
                            }}
                          >
                            star
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-on-surface-variant">
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
