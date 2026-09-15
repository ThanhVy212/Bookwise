"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import BookCover from "@/components/BookCover";
import BookReceiptModal from "@/components/BookReceiptModal";

interface BorrowedBookCardProps {
  record: {
    id: string;
    userId: string;
    bookId: string;
    borrowDate: string | Date;
    dueDate: string | Date;
    returnDate?: string | Date | null;
    status: string;
    book: {
      id: string;
      title: string;
      author: string;
      genre: string;
      coverColor: string;
      coverUrl: string;
    };
  };
  userName?: string;
  universityId?: number | string;
}

const BorrowedBookCard = ({
  record,
  userName,
  universityId,
}: BorrowedBookCardProps) => {
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const borrowDateObj = new Date(record.borrowDate);
  const dueDateObj = new Date(record.dueDate);
  const now = new Date();

  // Reset time to start of day for clean day difference calculation
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueStart = new Date(
    dueDateObj.getFullYear(),
    dueDateObj.getMonth(),
    dueDateObj.getDate(),
  );

  const diffTime = dueStart.getTime() - todayStart.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const isOverdue = record.status === "BORROWED" && diffDays < 0;
  const isReturned = record.status === "RETURNED";

  const formatDate = (date: Date | string | undefined | null) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
    });
  };

  const daysLeftText =
    diffDays === 0
      ? "Due today"
      : diffDays === 1
        ? "01 day left to due"
        : `${diffDays < 10 ? `0${diffDays}` : diffDays} days left to due`;

  return (
    <>
      <div className="relative flex flex-col justify-between rounded-2xl bg-dark-300/90 p-5 border border-light-100/5 shadow-xl transition-all duration-200 hover:border-light-100/20 group">
        {/* Overdue Warning Badge on Top Left */}
        {isOverdue && (
          <div className="absolute top-4 left-4 z-20 flex size-6 items-center justify-center rounded-md bg-red-500/10 border border-red-500/40 text-red-500 text-xs font-bold">
            !
          </div>
        )}

        {/* Top Cover Box */}
        <Link
          href={`/books/${record.book.id}`}
          className="flex w-full items-center justify-center rounded-xl py-6 px-4 transition-transform group-hover:scale-[1.02]"
          style={{
            backgroundColor: `${record.book.coverColor}20` || "#232839",
          }}
        >
          <BookCover
            variant="regular"
            coverColor={record.book.coverColor}
            coverUrl={record.book.coverUrl}
          />
        </Link>

        {/* Book Details */}
        <div className="mt-4 flex flex-col gap-2">
          <Link href={`/books/${record.book.id}`}>
            <h3 className="text-base font-semibold text-white line-clamp-1 hover:text-primary transition-colors">
              {record.book.title} - By {record.book.author}
            </h3>
          </Link>

          <p className="text-xs italic text-light-100 line-clamp-1">
            {record.book.genre}
          </p>

          <div className="mt-2 flex items-center justify-between border-t border-light-100/5 pt-3">
            <div className="flex flex-col gap-1.5">
              {/* Borrow Date */}
              <div className="flex items-center gap-2 text-xs text-light-100">
                <Image
                  src="/icons/book.svg"
                  alt="borrow date"
                  width={14}
                  height={14}
                  className="opacity-70"
                />
                <span>Borrowed on {formatDate(borrowDateObj)}</span>
              </div>

              {/* Status / Due Date */}
              <div className="flex items-center gap-2 text-xs">
                {isReturned ? (
                  <>
                    <Image
                      src="/icons/tick.svg"
                      alt="returned"
                      width={14}
                      height={14}
                    />
                    <span className="font-medium text-[#2CC171]">
                      Returned on {formatDate(record.returnDate || record.dueDate)}
                    </span>
                  </>
                ) : isOverdue ? (
                  <>
                    <Image
                      src="/icons/warning.svg"
                      alt="overdue"
                      width={14}
                      height={14}
                    />
                    <span className="font-semibold text-[#EF3A4B]">
                      Overdue Return
                    </span>
                  </>
                ) : (
                  <>
                    <Image
                      src="/icons/calendar.svg"
                      alt="calendar"
                      width={14}
                      height={14}
                      className="opacity-70"
                    />
                    <span className="text-light-100">{daysLeftText}</span>
                  </>
                )}
              </div>
            </div>

            {/* Receipt Button */}
            <button
              type="button"
              onClick={() => setIsReceiptOpen(true)}
              className="flex size-8 items-center justify-center rounded-lg bg-dark-600/50 text-light-100 hover:bg-dark-600 hover:text-white transition-all cursor-pointer"
              title="View receipt"
              aria-label="View receipt"
            >
              <Image
                src="/icons/receipt.svg"
                alt="receipt"
                width={16}
                height={16}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      <BookReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        record={record}
        userName={userName}
        universityId={universityId}
      />
    </>
  );
};

export default BorrowedBookCard;
