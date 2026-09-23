import React from "react";
import Link from "next/link";
import BookCover from "@/components/BookCover";
import WishlistButton from "@/components/WishlistButton";

interface SearchBookCardProps {
  id: string;
  title: string;
  author: string;
  genre: string;
  coverColor: string;
  coverUrl: string;
  isWishlisted?: boolean;
}

const SearchBookCard = ({
  id,
  title,
  author,
  genre,
  coverColor,
  coverUrl,
  isWishlisted = false,
}: SearchBookCardProps) => {
  return (
    <div className="flex flex-col items-center group/searchcard relative w-full">
      <div className="relative w-full flex flex-col items-center">
        <Link href={`/books/${id}`} className="w-full flex flex-col items-center group">
          <div className="transition-transform duration-200 group-hover:scale-105">
            <BookCover coverColor={coverColor} coverUrl={coverUrl} variant="regular" />
          </div>

          <div className="mt-4 w-full text-center xs:text-left">
            <p className="book-title line-clamp-2 text-sm font-semibold text-white group-hover:text-primary transition-colors">
              {title} - By {author}
            </p>
            <p className="book-genre mt-1 text-xs italic text-light-100/70 line-clamp-1">
              {genre}
            </p>
          </div>
        </Link>

        <div className="absolute top-1 right-1 z-20">
          <WishlistButton
            bookId={id}
            initialIsWishlisted={isWishlisted}
            variant="icon"
            className="size-8 shadow-md bg-dark-100/80 backdrop-blur-md hover:bg-dark-100"
          />
        </div>
      </div>
    </div>
  );
};

export default SearchBookCard;

