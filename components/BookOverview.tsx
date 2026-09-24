import React from "react";
import Image from "next/image";
import Link from "next/link";
import BookCover from "@/components/BookCover";


import WishlistButton from "@/components/WishlistButton";

interface BookOverviewProps extends Book {
  userId?: string;
  isWishlisted?: boolean;
}

const BookOverview = ({
  id,
  title,
  author,
  genre,
  rating,
  totalCopies,
  availableCopies,
  description,
  coverColor,
  coverUrl,
  isWishlisted = false,
}: BookOverviewProps) => {
  return (
    <section className="flex flex-col-reverse items-center justify-between gap-12 lg:flex-row lg:items-start lg:gap-16">
      <div className="flex flex-1 flex-col gap-5">
        <h1 className="text-4xl font-bold text-white sm:text-6xl lg:text-7xl leading-tight">
          {title}
        </h1>

        <div className="book-info">
          <p>
            By <span className="font-semibold text-light-200">{author}</span>
          </p>
          <p>
            Category{" "}
            <span className="font-semibold text-light-200">{genre}</span>
          </p>

          <div className="flex flex-row items-center gap-1">
            <Image src="/icons/star.svg" alt="star" width={20} height={20} />
            <p className="font-medium text-white">{rating}</p>
          </div>
        </div>

        <div className="book-copies">
          <p>
            Total Books <span>{totalCopies}</span>
          </p>
          <p>
            Available Books <span>{availableCopies}</span>
          </p>
        </div>

        <p className="book-description leading-relaxed">{description}</p>

        <div className="flex flex-wrap items-center gap-4">
          <Link href={`/books/${id}`} className="book-overview_btn">
            <Image src="/icons/book.svg" alt="book" width={22} height={22} />
            <span>BORROW BOOK</span>
          </Link>

          <WishlistButton
            bookId={id}
            initialIsWishlisted={isWishlisted}
            variant="button"
          />
        </div>
      </div>


      {/* 3D Book Cover */}
      <div className="relative flex flex-1 items-center justify-center pt-6 lg:pt-0">
        <div className="relative z-10">
          <BookCover
            variant="wide"
            coverColor={coverColor}
            coverUrl={coverUrl}
          />
        </div>

        <div className="absolute top-0 right-10 sm:right-16 rotate-12 opacity-40 blur-[1px] hidden sm:block">
          <BookCover
            variant="wide"
            coverColor={coverColor}
            coverUrl={coverUrl}
          />
        </div>
      </div>
    </section>
  );
};
export default BookOverview;


