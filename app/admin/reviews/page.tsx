import React from "react";
import Image from "next/image";
import Link from "next/link";
import { getAllReviewsAdmin } from "@/lib/actions/admin.actions";
import { getInitials, getImageKitUrl } from "@/lib/utils";
import BookCover from "@/components/BookCover";
import ReviewActions from "@/components/admin/ReviewActions";
import { Star, MessageSquare } from "lucide-react";

const AdminReviewsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const query = params.query || "";
  const ratingFilter = params.rating ? Number(params.rating) : undefined;

  const result = await getAllReviewsAdmin({
    page,
    limit: 10,
    query,
    rating: ratingFilter,
  });

  if (!result.success) {
    return (
      <section className="w-full rounded-2xl bg-white p-7 shadow-2xs">
        <p className="text-red-500">Failed to load reviews</p>
      </section>
    );
  }

  const { reviews, totalReviews, totalPages, currentPage } = result.data;

  return (
    <section className="w-full rounded-2xl bg-white p-7 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-dark-400">Community Reviews & Ratings</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Moderate student book reviews to ensure a constructive, appropriate community.
          </p>
        </div>

        {/* Rating Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <Link
            href={`/admin/reviews${query ? `?query=${encodeURIComponent(query)}` : ""}`}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              !ratingFilter
                ? "bg-primary-admin text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Ratings
          </Link>
          {[5, 4, 3, 2, 1].map((star) => (
            <Link
              key={star}
              href={`/admin/reviews?rating=${star}${query ? `&query=${encodeURIComponent(query)}` : ""}`}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                ratingFilter === star
                  ? "bg-amber-500 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span>{star}</span>
              <Star className="size-3 fill-current" />
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-7 w-full overflow-x-auto min-h-[380px] pb-10">
        <table className="w-full min-w-[950px] table-fixed">
          <colgroup>
            <col className="w-[24%]" />
            <col className="w-[20%]" />
            <col className="w-[12%]" />
            <col className="w-[30%]" />
            <col className="w-[9%]" />
            <col className="w-[5%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-slate-100">
              <th className="pb-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Book
              </th>
              <th className="pb-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Reviewer
              </th>
              <th className="pb-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Rating
              </th>
              <th className="pb-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Review Comment
              </th>
              <th className="pb-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Date
              </th>
              <th className="pb-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review: any) => (
              <tr
                key={review.id}
                className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors"
              >
                {/* Book info */}
                <td className="py-4">
                  <Link
                    href={`/admin/books/${review.book.id}`}
                    className="flex items-center gap-3 group"
                  >
                    <BookCover
                      variant="extraSmall"
                      coverColor={review.book.coverColor}
                      coverUrl={review.book.coverUrl}
                    />
                    <div className="max-w-[180px]">
                      <span className="font-semibold text-dark-400 line-clamp-1 text-sm group-hover:text-primary-admin transition-colors">
                        {review.book.title}
                      </span>
                      <span className="text-xs text-slate-400 line-clamp-1">
                        By {review.book.author}
                      </span>
                    </div>
                  </Link>
                </td>

                {/* Reviewer info */}
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    {review.user.avatarUrl ? (
                      <Image
                        src={getImageKitUrl(review.user.avatarUrl)}
                        alt={review.user.fullName}
                        width={36}
                        height={36}
                        className="size-9 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex size-9 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-900">
                        {getInitials(review.user.fullName)}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-dark-400 text-sm">
                        {review.user.fullName}
                      </p>
                      <p className="text-xs text-slate-400">
                        {review.user.email}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Star Rating */}
                <td className="py-4">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`size-3.5 ${
                          i < review.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-200"
                        }`}
                      />
                    ))}
                    <span className="ml-1 text-xs font-bold text-slate-700">
                      {review.rating}/5
                    </span>
                  </div>
                </td>

                {/* Comment */}
                <td className="py-4">
                  <div className="flex items-start gap-2 max-w-[280px]">
                    <MessageSquare className="size-3.5 text-slate-300 shrink-0 mt-1" />
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      &quot;{review.comment}&quot;
                    </p>
                  </div>
                </td>

                {/* Date */}
                <td className="py-4 text-xs text-slate-500">
                  {new Date(review.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  })}
                </td>

                {/* Action */}
                <td className="py-4">
                  <div className="flex justify-end">
                    <ReviewActions
                      reviewId={review.id}
                      bookTitle={review.book.title}
                      userName={review.user.fullName}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {reviews.length === 0 && (
        <div className="mt-10 flex flex-col items-center justify-center py-16">
          <Image
            src="/icons/admin/empty-state.svg"
            alt="empty"
            width={80}
            height={80}
            className="opacity-50"
          />
          <p className="mt-4 text-lg font-semibold text-dark-400">
            No Community Reviews Found
          </p>
          <p className="text-sm text-slate-500">
            {ratingFilter
              ? `There are no ${ratingFilter}-star reviews yet.`
              : "No student reviews have been posted yet."}
          </p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-7 flex items-center justify-end gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (pageNum) => (
              <a
                key={pageNum}
                href={`/admin/reviews?page=${pageNum}${ratingFilter ? `&rating=${ratingFilter}` : ""}${query ? `&query=${encodeURIComponent(query)}` : ""}`}
                className={`flex size-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  pageNum === currentPage
                    ? "bg-primary-admin text-white"
                    : "bg-light-300 text-dark-400 hover:bg-light-400"
                }`}
              >
                {pageNum}
              </a>
            ),
          )}
        </div>
      )}
    </section>
  );
};

export default AdminReviewsPage;
