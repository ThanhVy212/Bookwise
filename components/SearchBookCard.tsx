import React from "react";
import Link from "next/link";
import BookCover from "@/components/BookCover";

interface SearchBookCardProps {
  id: string;
  title: string;
  author: string;
  genre: string;
  coverColor: string;
  coverUrl: string;
}

const SearchBookCard = ({
  id,
  title,
  author,
  genre,
  coverColor,
  coverUrl,
}: SearchBookCardProps) => {
  return (
    <div className="flex flex-col items-center group">
      <Link href={`/books/${id}`} className="w-full flex flex-col items-center">
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
    </div>
  );
};

export default SearchBookCard;
