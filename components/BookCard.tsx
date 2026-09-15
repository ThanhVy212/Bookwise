import React from "react";
import Link from "next/link";
import BookCover from "@/components/BookCover";

const BookCard = ({ id, title, genre, coverColor, coverUrl }: Book) => {
  return (
    <li className="flex flex-col items-center w-full">
      <Link href={`/books/${id}`} className="w-full flex flex-col items-center group">
        <div className="transition-transform duration-200 group-hover:scale-105">
          <BookCover coverColor={coverColor} coverUrl={coverUrl} />
        </div>

        <div className="mt-4 w-full text-center xs:text-left">
          <p className="book-title line-clamp-1 group-hover:text-primary transition-colors">{title}</p>
          <p className="book-genre line-clamp-1">{genre}</p>
        </div>
      </Link>
    </li>
  );
};
export default BookCard;
