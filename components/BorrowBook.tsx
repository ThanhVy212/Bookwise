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
  userStatus?: string | null;
}

const BorrowBook = ({ bookId, userId, alreadyBorrowed = false, userStatus }: BorrowBookProps) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isAccountRestricted = userStatus === "PENDING" || userStatus === "REJECTED";

  const getButtonText = () => {
    if (alreadyBorrowed) return "BORROWED";
    if (loading) return "PROCESSING...";
    if (userStatus === "PENDING") return "ACCOUNT PENDING APPROVAL";
    if (userStatus === "REJECTED") return "ACCOUNT REJECTED";
    return "BORROW BOOK REQUEST";
  };

  const handleBorrowBook = async () => {
    if (!userId) {
      toast.error("Please sign in to borrow books");
      router.push("/sign-in");
      return;
    }

    if (isAccountRestricted) {
      if (userStatus === "PENDING") {
        toast.error("Your account is pending approval. Please wait for admin approval before borrowing books.");
      } else {
        toast.error("Your account registration was rejected. Please contact admin for assistance.");
      }
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
      disabled={!userId || loading || alreadyBorrowed || isAccountRestricted}
    >
      <Image src="/icons/book.svg" alt="book" width={22} height={22} />
      <span>{getButtonText()}</span>
    </button>
  );
};

export default BorrowBook;
