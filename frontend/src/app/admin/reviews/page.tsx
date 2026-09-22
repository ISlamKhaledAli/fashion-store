"use client";

import React, { useState, useEffect, useTransition, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  Search,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Trash2,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Send,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { reviewApi } from "@/lib/api";
import type { Review, ReviewStatus } from "@/types";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [, startTransition] = useTransition();

  // Reply state
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Delete state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchReviews = useCallback(() => {
    setIsLoading(true);
    reviewApi
      .getAdminReviews({
        status: activeTab !== "ALL" ? activeTab : undefined,
        rating: ratingFilter > 0 ? ratingFilter : undefined,
        search: searchQuery.trim() || undefined,
        limit: 50,
      })
      .then((res) => {
        if (res.data?.success) {
          setReviews(res.data.data || []);
        }
      })
      .catch(() => {
        toast.error("Failed to load customer reviews");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [activeTab, ratingFilter, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReviews();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchReviews]);

  // Status updates
  const handleStatusChange = (id: string, newStatus: ReviewStatus) => {
    startTransition(async () => {
      try {
        await reviewApi.updateStatus(id, newStatus);
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
        );
        toast.success(`Review ${newStatus.toLowerCase()} successfully`);
      } catch {
        toast.error("Failed to update review status");
      }
    });
  };

  // Reply submit
  const handleReplySubmit = async (id: string) => {
    if (!replyText.trim()) {
      toast.error("Reply content cannot be empty");
      return;
    }
    setIsSubmittingReply(true);
    try {
      await reviewApi.reply(id, replyText.trim());
      setReviews((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, adminReply: replyText.trim() } : r
        )
      );
      toast.success("Admin reply published");
      setReplyingReviewId(null);
      setReplyText("");
    } catch {
      toast.error("Failed to post reply");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Delete review
  const handleDeleteReview = async (id: string) => {
    try {
      await reviewApi.delete(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast.success("Review permanently deleted");
    } catch {
      toast.error("Failed to delete review");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  // Computed counts for tabs
  const tabCounts = {
    ALL: reviews.length,
    PENDING: reviews.filter((r) => r.status === "PENDING").length,
    APPROVED: reviews.filter((r) => r.status === "APPROVED").length,
    REJECTED: reviews.filter((r) => r.status === "REJECTED").length,
  };

  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length
        ).toFixed(1)
      : "0.0";

  const tabs = [
    { id: "ALL", label: "All Reviews", count: tabCounts.ALL },
    { id: "PENDING", label: "Pending", count: tabCounts.PENDING },
    { id: "APPROVED", label: "Approved", count: tabCounts.APPROVED },
    { id: "REJECTED", label: "Rejected", count: tabCounts.REJECTED },
  ];

  return (
    <div className="min-h-screen space-y-8 p-6 lg:p-10">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-zinc-200/80 pb-6 md:flex-row md:items-end dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-zinc-400 uppercase">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Social Proof & Moderation
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-zinc-950 sm:text-3xl dark:text-white">
            Customer Reviews
          </h1>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Moderate, approve, and respond to customer product evaluations.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchReviews}
          disabled={isLoading}
          icon={
            <RefreshCw
              className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
            />
          }
          className="self-start md:self-auto"
        >
          Refresh Feed
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
            Total Reviews
          </div>
          <div className="mt-2 text-2xl font-black text-zinc-950 dark:text-white">
            {reviews.length}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="text-[10px] font-bold tracking-widest text-amber-600 uppercase dark:text-amber-400">
            Pending Approval
          </div>
          <div className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400">
            {tabCounts.PENDING}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="text-[10px] font-bold tracking-widest text-emerald-600 uppercase dark:text-emerald-400">
            Live Reviews
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {tabCounts.APPROVED}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
            Average Score
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-2xl font-black text-zinc-950 dark:text-white">
              {avgRating}
            </span>
            <div className="flex items-center text-amber-500">
              <Star className="h-4 w-4 fill-amber-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="space-y-4">
        <AdminTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          layoutId="reviewsTabUnderline"
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              type="text"
              placeholder="Search by customer, product, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <Select
            variant="filter"
            labelPrefix="Rating:"
            value={String(ratingFilter)}
            onChange={(val) => setRatingFilter(Number(val))}
            options={[
              { value: "0", label: "All Ratings" },
              { value: "5", label: "5 Stars ★★★★★" },
              { value: "4", label: "4 Stars ★★★★☆" },
              { value: "3", label: "3 Stars ★★★☆☆" },
              { value: "2", label: "2 Stars ★★☆☆☆" },
              { value: "1", label: "1 Star ★☆☆☆☆" },
            ]}
          />
        </div>
      </div>

      {/* Reviews List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-xl border border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50"
            />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 p-12 text-center dark:border-zinc-800">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
            <MessageSquare className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-sm font-bold tracking-wider text-zinc-900 uppercase dark:text-zinc-100">
            No reviews found
          </h3>
          <p className="mt-1 text-xs text-zinc-500">
            No customer evaluations match the selected filter criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {reviews.map((review) => {
              const isReplying = replyingReviewId === review.id;
              const productImg =
                review.product?.images?.[0]?.url || "/placeholder.jpg";

              return (
                <motion.div
                  key={review.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs transition-all hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/70"
                >
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                    {/* Left: Product & Review Content */}
                    <div className="flex flex-1 items-start gap-4">
                      {/* Product Thumbnail */}
                      <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg border border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800">
                        {productImg && (
                          <Image
                            src={productImg}
                            alt={review.product?.name || "Product"}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>

                      <div className="flex-1 space-y-1.5">
                        {/* Product Name & Link */}
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={
                              review.product?.slug
                                ? `/products/${review.product.slug}`
                                : "#"
                            }
                            target="_blank"
                            className="group flex items-center gap-1 text-xs font-bold text-zinc-900 hover:text-zinc-600 dark:text-white"
                          >
                            {review.product?.name || "Archival Garment"}
                            <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                          </Link>

                          <span className="text-zinc-300 dark:text-zinc-700">
                            •
                          </span>

                          {/* Customer info */}
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            By{" "}
                            <span className="font-medium text-zinc-800 dark:text-zinc-200">
                              {review.user?.name || "Anonymous Client"}
                            </span>
                            {review.user?.email && (
                              <span className="text-zinc-400">
                                {" "}
                                ({review.user.email})
                              </span>
                            )}
                          </span>

                          <span className="text-zinc-300 dark:text-zinc-700">
                            •
                          </span>

                          <span className="text-[10px] text-zinc-400">
                            {new Date(review.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </span>
                        </div>

                        {/* Star Rating */}
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3.5 w-3.5 ${
                                star <= review.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-zinc-200 dark:text-zinc-700"
                              }`}
                            />
                          ))}
                          <span className="ml-1 text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                            {review.rating}.0
                          </span>
                        </div>

                        {/* Title & Body */}
                        {review.title && (
                          <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                            {review.title}
                          </div>
                        )}
                        <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                          {review.body}
                        </p>

                        {/* Existing Admin Reply */}
                        {review.adminReply && (
                          <div className="mt-3 rounded-xl border border-zinc-100 bg-zinc-50/80 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/40">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                              <ShieldAlert className="h-3 w-3 text-zinc-400" />
                              Store Concierge Reply
                            </div>
                            <p className="mt-1 text-xs text-zinc-700 dark:text-zinc-300">
                              {review.adminReply}
                            </p>
                          </div>
                        )}

                        {/* Inline Reply Editor */}
                        {isReplying && (
                          <div className="mt-3 space-y-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50">
                            <div className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
                              Write Concierge Response
                            </div>
                            <Textarea
                              placeholder="Type your official store response..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              rows={3}
                              className="text-xs"
                            />
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setReplyingReviewId(null);
                                  setReplyText("");
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleReplySubmit(review.id)}
                                disabled={isSubmittingReply}
                                icon={<Send className="h-3 w-3" />}
                              >
                                {isSubmittingReply
                                  ? "Publishing..."
                                  : "Send Reply"}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Moderation Badges & Actions */}
                    <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-end">
                      {/* Status Tag */}
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                          review.status === "APPROVED"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : review.status === "PENDING"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {review.status === "APPROVED" && (
                          <CheckCircle2 className="h-3 w-3" />
                        )}
                        {review.status === "PENDING" && (
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        )}
                        {review.status === "REJECTED" && (
                          <XCircle className="h-3 w-3" />
                        )}
                        {review.status}
                      </span>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1 pt-1">
                        {review.status !== "APPROVED" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleStatusChange(review.id, "APPROVED")
                            }
                            icon={
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            }
                            className="text-xs"
                          >
                            Approve
                          </Button>
                        )}

                        {review.status !== "REJECTED" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleStatusChange(review.id, "REJECTED")
                            }
                            icon={
                              <XCircle className="h-3.5 w-3.5 text-rose-600" />
                            }
                            className="text-xs"
                          >
                            Reject
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setReplyingReviewId(isReplying ? null : review.id);
                            setReplyText(review.adminReply || "");
                          }}
                          icon={<MessageSquare className="h-3.5 w-3.5" />}
                          className="text-xs"
                        >
                          {review.adminReply ? "Edit Reply" : "Reply"}
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirmId(review.id)}
                          className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/30"
                          icon={<Trash2 className="h-3.5 w-3.5" />}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => {
          if (deleteConfirmId) handleDeleteReview(deleteConfirmId);
        }}
        title="Delete Review Permanently"
        description="Are you sure you wish to delete this customer review? This action cannot be reversed."
        confirmText="Delete Review"
        confirmBrand="danger"
      />
    </div>
  );
}
