"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import BookCover from "@/components/BookCover";
import { toggleWishlist } from "@/lib/actions/book.actions";
import { toast } from "sonner";
import { Trash2, BookOpen } from "lucide-react";

interface WishlistedBookProps {
  book: {
    id: string;
    title: string;
    author: string;
    genre: string;
    rating: number;
    totalCopies: number;
    availableCopies: number;
    coverColor: string;
    coverUrl: string;
    savedAt?: string | Date;
  };
  onRemove?: (bookId: string) => void;
}

const WishlistedBookCard = ({ book, onRemove }: WishlistedBookProps) => {
  const [isRemoved, setIsRemoved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsRemoved(true);

    startTransition(async () => {
      try {
        const result = await toggleWishlist(book.id);
        if (!result.success) {
          setIsRemoved(false);
          toast.error(result.error || "Failed to remove book");
        } else if (result.isWishlisted) {
          // Toggle re-saved the book instead of removing it — treat as failed removal
          setIsRemoved(false);
          toast.error("Failed to remove book");
        } else {
          toast.info(`Removed "${book.title}" from your wishlist`);
          onRemove?.(book.id);
        }
      } catch {
        setIsRemoved(false);
        toast.error("Failed to remove book");
      }
    });
  };

  if (isRemoved) return null;

  return (
    <div className="relative flex flex-col justify-between rounded-2xl bg-dark-300/90 p-5 border border-light-100/5 shadow-xl transition-all duration-200 hover:border-light-100/20 group">
      {/* Remove from wishlist button */}
      <button
        type="button"
        disabled={isPending}
        onClick={handleRemove}
        className="absolute top-4 right-4 z-20 flex size-8 items-center justify-center rounded-lg bg-dark-600/60 text-light-100 hover:bg-red-500/20 hover:text-red-400 transition-all cursor-pointer disabled:opacity-50"
        title="Remove from saved books"
      >
        <Trash2 className="size-4" />
      </button>

      {/* Top Cover Box */}
      <Link
        href={`/books/${book.id}`}
        className="flex w-full items-center justify-center rounded-xl py-6 px-4 transition-transform group-hover:scale-[1.02]"
        style={{
          backgroundColor: `${book.coverColor}20` || "#232839",
        }}
      >
        <BookCover
          variant="regular"
          coverColor={book.coverColor}
          coverUrl={book.coverUrl}
        />
      </Link>

      {/* Book Details */}
      <div className="mt-4 flex flex-col gap-2">
        <Link href={`/books/${book.id}`}>
          <h3 className="text-base font-semibold text-white line-clamp-1 hover:text-primary transition-colors">
            {book.title}
          </h3>
        </Link>
        <p className="text-xs text-light-100 line-clamp-1">By {book.author}</p>

        <div className="flex items-center justify-between gap-2">
          <p className="text-xs italic text-light-100/70">{book.genre}</p>
          <div className="flex items-center gap-1">
            <Image src="/icons/star.svg" alt="star" width={14} height={14} />
            <span className="text-xs font-semibold text-white">
              {book.rating}/5
            </span>
          </div>
        </div>

        {/* Availability & Action */}
        <div className="mt-2 flex items-center justify-between border-t border-light-100/5 pt-3">
          <div className="text-xs">
            {book.availableCopies > 0 ? (
              <span className="font-medium text-emerald-400">
                {book.availableCopies} {book.availableCopies === 1 ? "copy" : "copies"} available
              </span>
            ) : (
              <span className="font-medium text-rose-400">Out of Stock</span>
            )}
          </div>

          <Link
            href={`/books/${book.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-dark-100 text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
          >
            <BookOpen className="size-3.5" />
            <span>Borrow</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WishlistedBookCard;
