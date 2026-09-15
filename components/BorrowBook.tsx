"use client";

import React, { useState } from "react";
import Image from "next/image";

interface BorrowBookProps {
  bookId: string;
  userId?: string;
}

const BorrowBook = ({ bookId, userId }: BorrowBookProps) => {
  const [loading, setLoading] = useState(false);

  // todo: handle borrow book

  return (
    <button
      type="button"
      className="book-overview_btn"
      onClick={() => {}}
      disabled={!userId || loading}
    >
      <Image src="/icons/book.svg" alt="book" width={22} height={22} />
      <span>{loading ? "PROCESSING..." : "BORROW BOOK REQUEST"}</span>
    </button>
  );
};

export default BorrowBook;
