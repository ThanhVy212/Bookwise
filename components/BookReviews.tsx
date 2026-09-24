"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import { Star, MessageSquare, Trash2, Send } from "lucide-react";
import { toast } from "sonner";
import { addOrUpdateReview, deleteReview } from "@/lib/actions/book.actions";
import { getInitials, getImageKitUrl } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ReviewItem {
  id: string;
  rating: number;
  comment: string;
  createdAt: string | Date;
  user: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
    universityId: number | string;
  };
}

interface BookReviewsProps {
  bookId: string;
  currentUserId?: string;
  userRole?: string;
  initialReviews?: ReviewItem[];
}

const BookReviews = ({
  bookId,
  currentUserId,
  userRole,
  initialReviews = [],
}: BookReviewsProps) => {
  const [reviewsList, setReviewsList] = useState<ReviewItem[]>(initialReviews);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const userExistingReview = currentUserId
    ? reviewsList.find((r) => r.user.id === currentUserId)
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUserId) {
      toast.error("Please sign in to write a review");
      return;
    }

    if (!comment.trim()) {
      toast.error("Please enter your thoughts in the comment");
      return;
    }

    startTransition(async () => {
      try {
        const result = await addOrUpdateReview({
          bookId,
          rating,
          comment: comment.trim(),
        });

        if (!result.success) {
          toast.error(result.error || "Failed to submit review");
          return;
        }

        toast.success(result.message || "Review submitted successfully!");
        setComment("");

        // Optimistically update list
        const updatedList: ReviewItem[] = [
          {
            id: userExistingReview ? userExistingReview.id : `temp-${Date.now()}`,
            rating,
            comment: comment.trim(),
            createdAt: new Date(),
            user: {
              id: currentUserId,
              fullName: "You",
              universityId: "Me",
            },
          },
          ...reviewsList.filter((r) => r.user.id !== currentUserId),
        ];
        setReviewsList(updatedList);
      } catch {
        toast.error("An error occurred while saving your review");
      }
    });
  };

  const handleDelete = (reviewId: string) => {
    startTransition(async () => {
      try {
        const result = await deleteReview(reviewId);
        if (!result.success) {
          toast.error(result.error || "Failed to delete review");
          return;
        }

        toast.success("Review deleted");
        setReviewsList(reviewsList.filter((r) => r.id !== reviewId));
      } catch {
        toast.error("Failed to delete review");
      }
    });
  };

  const totalReviews = reviewsList.length;
  const avgRating =
    totalReviews > 0
      ? (reviewsList.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
      : "0.0";

  return (
    <div className="flex flex-col gap-8 rounded-3xl bg-dark-300/40 p-6 sm:p-8 border border-light-100/10">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-light-100/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <MessageSquare className="size-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Community Reviews</h3>
            <p className="text-xs text-light-100/70">
              {totalReviews} {totalReviews === 1 ? "review" : "reviews"} from university readers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-dark-200/60 px-4 py-2 rounded-2xl border border-light-100/10">
          <div className="flex items-center gap-1">
            <Star className="size-5 fill-amber-400 text-amber-400" />
            <span className="text-lg font-bold text-white">{avgRating}</span>
          </div>
          <span className="text-xs text-light-100/60">/ 5.0</span>
        </div>
      </div>

      {/* Review Form (For logged in users) */}
      {currentUserId ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-dark-200/50 p-5 rounded-2xl border border-light-100/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-sm font-semibold text-white">
              {userExistingReview ? "Update Your Review" : "Write a Review"}
            </span>

            {/* Interactive Star Rating */}
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-125 cursor-pointer focus:outline-none"
                  title={`${star} Star${star > 1 ? "s" : ""}`}
                >
                  <Star
                    className={`size-5 transition-colors ${
                      (hoverRating || rating) >= star
                        ? "fill-amber-400 text-amber-400"
                        : "text-light-100/30 hover:text-light-100/60"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-xs font-semibold text-amber-400">
                {hoverRating || rating} / 5
              </span>
            </div>
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts about this book with other students..."
            rows={3}
            className="w-full rounded-xl bg-dark-300 p-3.5 text-sm text-white placeholder:text-light-100/40 border border-light-100/10 focus:border-primary focus:outline-none transition-all resize-none"
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPending || !comment.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-dark-100 hover:bg-primary/90 disabled:opacity-50 transition-all cursor-pointer shadow-md"
            >
              <Send className="size-3.5" />
              <span>{isPending ? "Submitting..." : userExistingReview ? "Update Review" : "Post Review"}</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="p-4 rounded-xl bg-dark-200/30 border border-light-100/10 text-center text-xs text-light-100">
          Please <a href="/sign-in" className="text-primary font-semibold underline">sign in</a> to leave a review and rating for this book.
        </div>
      )}

      {/* Reviews List */}
      <div className="flex flex-col gap-4">
        {reviewsList.length > 0 ? (
          reviewsList.map((review) => {
            const isOwner = currentUserId === review.user.id;
            const isAdmin = userRole === "ADMIN";
            const avatar = review.user.avatarUrl ? getImageKitUrl(review.user.avatarUrl) : null;

            return (
              <div
                key={review.id}
                className="flex flex-col gap-3 p-4 rounded-2xl bg-dark-200/30 border border-light-100/5 hover:border-light-100/10 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8 ring-1 ring-light-100/10">
                      {avatar && <AvatarImage src={avatar} alt={review.user.fullName} />}
                      <AvatarFallback className="bg-light-100 text-dark-100 text-xs font-bold">
                        {getInitials(review.user.fullName || "US")}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <p className="text-sm font-semibold text-white">
                        {review.user.fullName}
                      </p>
                      <p className="text-[11px] text-light-100/60">
                        {new Date(review.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`size-3.5 ${
                            review.rating >= s
                              ? "fill-amber-400 text-amber-400"
                              : "text-light-100/20"
                          }`}
                        />
                      ))}
                    </div>

                    {(isOwner || isAdmin) && (
                      <button
                        onClick={() => handleDelete(review.id)}
                        disabled={isPending}
                        className="text-light-100/40 hover:text-rose-400 transition-colors p-1 cursor-pointer"
                        title="Delete review"
                        type="button"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-sm text-light-100/90 leading-relaxed pl-11">
                  {review.comment}
                </p>
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center text-xs text-light-100/60">
            No reviews yet. Be the first student to review this book!
          </div>
        )}
      </div>
    </div>
  );
};

export default BookReviews;
