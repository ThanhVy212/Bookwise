"use client";

import React from "react";
import Link from "next/link";
import BookCover from "@/components/BookCover";
import WishlistButton from "@/components/WishlistButton";
import { BookOpen } from "lucide-react";

interface WishlistedBookCardProps {
  book: {
    id: string;
    title: string;
    author: string;
    genre: string;
    rating: number;
    totalCopies: number;
    availableCopies: number;
    description: string;
    coverColor: string;
    coverUrl: string;
    savedAt?: Date | string;
  };
}

const WishlistedBookCard = ({ book }: WishlistedBookCardProps) => {
  return (
    <div className="relative flex flex-col xs:flex-row gap-5 p-5 rounded-2xl bg-dark-300/40 border border-light-100/10 hover:border-light-100/20 transition-all group">
      {/* Book Cover */}
      <Link href={`/books/${book.id}`} className="shrink-0 flex justify-center xs:block">
        <BookCover
          variant="small"
          coverColor={book.coverColor}
          coverUrl={book.coverUrl}
        />
      </Link>

      {/* Book Details */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <Link
              href={`/books/${book.id}`}
              className="text-lg font-bold text-white group-hover:text-primary transition-colors line-clamp-1"
            >
              {book.title}
            </Link>

            <WishlistButton
              bookId={book.id}
              initialIsWishlisted={true}
              variant="icon"
              className="size-8 shrink-0 bg-dark-200/60"
            />
          </div>

          <p className="text-sm text-light-100/80 mt-0.5">By {book.author}</p>
          <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-dark-200 text-light-200 border border-light-100/10">
            {book.genre}
          </span>
        </div>

        <div className="mt-4 pt-3 border-t border-light-100/10 flex items-center justify-between gap-3">
          <div className="text-xs">
            {book.availableCopies > 0 ? (
              <span className="text-emerald-400 font-medium">
                {book.availableCopies} copies available
              </span>
            ) : (
              <span className="text-rose-400 font-medium">Out of copies</span>
            )}
          </div>

          <Link
            href={`/books/${book.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            <BookOpen className="size-3.5" />
            <span>Borrow Book</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WishlistedBookCard;
