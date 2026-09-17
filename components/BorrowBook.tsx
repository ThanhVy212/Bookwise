"use client";

import React, { useState } from "react";
import Image from "next/image";
import { borrowBook } from "@/lib/actions/book.actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface BorrowBookProps {
  bookId: string;
  userId?: string;
  alreadyBorrowed?: boolean;
}

const BorrowBook = ({ bookId, userId, alreadyBorrowed = false }: BorrowBookProps) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleBorrowBook = async () => {
    if (!userId) {
      toast.error("Please sign in to borrow books");
      router.push("/sign-in");
      return;
    }

    setLoading(true);

    try {
      const result = await borrowBook({ bookId });

      if (result.success) {
        toast.success("Book borrowed successfully! Check your profile for details.");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to borrow book");
      }
    } catch (error) {
      toast.error("An error occurred while borrowing the book");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className="book-overview_btn"
      onClick={handleBorrowBook}
      disabled={!userId || loading || alreadyBorrowed}
    >
      <Image src="/icons/book.svg" alt="book" width={22} height={22} />
      <span>
        {alreadyBorrowed ? "BORROWED" : loading ? "PROCESSING..." : "BORROW BOOK REQUEST"}
      </span>
    </button>
  );
};

export default BorrowBook;
