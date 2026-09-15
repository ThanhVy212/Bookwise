"use client";

import React from "react";
import Image from "next/image";

interface BorrowBookProps {
  bookId: string;
  userId?: string;
}

const BorrowBook = ({ bookId, userId }: BorrowBookProps) => {
  const handleBorrowBook = async () => {
    // Để trống để viết flow mượn sách sau
  };

  return (
    <button
      type="button"
      className="book-overview_btn"
      onClick={handleBorrowBook}
    >
      <Image src="/icons/book.svg" alt="book" width={22} height={22} />
      <span>BORROW BOOK REQUEST</span>
    </button>
  );
};

export default BorrowBook;


