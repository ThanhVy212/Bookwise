import React from "react";
import Link from "next/link";
import BookCover from "@/components/BookCover";
import WishlistButton from "@/components/WishlistButton";

interface BookCardProps extends Book {
  isWishlisted?: boolean;
}

const BookCard = ({
  id,
  title,
  genre,
  coverColor,
  coverUrl,
  isWishlisted = false,
}: BookCardProps) => {
  return (
    <li className="flex flex-col items-center w-full relative group/card">
      <div className="relative w-full flex flex-col items-center">
        <Link href={`/books/${id}`} className="w-full flex flex-col items-center group">
          <div className="transition-transform duration-200 group-hover:scale-105">
            <BookCover coverColor={coverColor} coverUrl={coverUrl} />
          </div>

          <div className="mt-4 w-full text-center xs:text-left">
            <p className="book-title line-clamp-1 group-hover:text-primary transition-colors">
              {title}
            </p>
            <p className="book-genre line-clamp-1">{genre}</p>
          </div>
        </Link>

        {/* Floating Wishlist Button */}
        <div className="absolute top-2 right-2 z-20">
          <WishlistButton
            bookId={id}
            initialIsWishlisted={isWishlisted}
            variant="icon"
            className="shadow-lg bg-dark-100/80 backdrop-blur-md hover:bg-dark-100"
          />
        </div>
      </div>
    </li>
  );
};
export default BookCard;

