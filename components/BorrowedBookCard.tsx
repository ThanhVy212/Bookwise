"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import BookCover from "@/components/BookCover";
import BookReceiptModal from "@/components/BookReceiptModal";
import { renewBorrowedBook } from "@/lib/actions/book.actions";
import { toast } from "sonner";
import { RefreshCw, Clock } from "lucide-react";

interface BorrowedBookCardProps {
  record: {
    id: string;
    userId: string;
    bookId: string;
    borrowDate: string | Date;
    dueDate: string | Date;
    returnDate?: string | Date | null;
    status: string;
    renewCount?: number;
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

// Parse date-only values ("YYYY-MM-DD") as local calendar dates to avoid timezone shifts
const parseCalendarDate = (value: string | Date): Date => {
  const iso = (value instanceof Date ? value.toISOString() : value).slice(0, 10);
  const [year, month, day] = iso.split("-").map(Number);
  if (year && month && day) {
    return new Date(year, month - 1, day);
  }
  return new Date(value);
};

const BorrowedBookCard = ({
  record,
  userName,
  universityId,
}: BorrowedBookCardProps) => {
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [dueDate, setDueDate] = useState<string | Date>(record.dueDate);
  const [renewCount, setRenewCount] = useState<number>(record.renewCount || 0);
  const [isPending, startTransition] = useTransition();

  const borrowDateObj = new Date(record.borrowDate);
  const dueDateObj = parseCalendarDate(dueDate);
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
  const overdueDays = Math.abs(diffDays);
  const overdueFine = overdueDays * 5000; // 5,000 VND per overdue day

  const formatDate = (date: Date | string | undefined | null) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const daysLeftText =
    diffDays === 0
      ? "Due today"
      : diffDays === 1
        ? "01 day left to due"
        : `${diffDays < 10 ? `0${diffDays}` : diffDays} days left to due`;

  const handleRenew = () => {
    startTransition(async () => {
      try {
        const result = await renewBorrowedBook({ recordId: record.id });
        if (!result.success) {
          toast.error(result.error || "Failed to renew book");
          return;
        }

        toast.success(result.message || "Book renewed for 7 more days!");
        if (result.newDueDate) {
          setDueDate(result.newDueDate);
        }
        if (result.renewCount !== undefined) {
          setRenewCount(result.renewCount);
        }
      } catch {
        toast.error("An error occurred while renewing book");
      }
    });
  };

  return (
    <>
      <div className="relative flex flex-col justify-between rounded-2xl bg-dark-300/90 p-5 border border-light-100/5 shadow-xl transition-all duration-200 hover:border-light-100/20 group">
        {/* Overdue Warning Badge on Top Left */}
        {isOverdue && (
          <div className="absolute top-4 left-4 z-20 flex size-7 items-center justify-center rounded-lg bg-rose-500/20 border border-rose-500/50 text-rose-500 text-xs font-bold animate-pulse">
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

          <div className="flex items-center justify-between gap-2">
            <p className="text-xs italic text-light-100 line-clamp-1">
              {record.book.genre}
            </p>
            {renewCount > 0 && !isReturned && (
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                <Clock className="size-3" />
                Renewed {renewCount}/2
              </span>
            )}
          </div>

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
                      Returned on {record.returnDate ? formatDate(record.returnDate) : "N/A"}
                    </span>
                  </>
                ) : isOverdue ? (
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5 font-semibold text-[#EF3A4B]">
                      <Image
                        src="/icons/warning.svg"
                        alt="overdue"
                        width={14}
                        height={14}
                      />
                      <span>Overdue by {overdueDays} {overdueDays === 1 ? "day" : "days"}</span>
                    </div>
                    <span className="text-[11px] text-rose-400/90 font-medium">
                      Estimated fine: {overdueFine.toLocaleString("vi-VN")} VND
                    </span>
                  </div>
                ) : (
                  <>
                    <Image
                      src="/icons/calendar.svg"
                      alt="calendar"
                      width={14}
                      height={14}
                      className="opacity-70"
                    />
                    <span className="text-light-100">
                      {daysLeftText} ({formatDate(dueDateObj)})
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Actions: Renew & Receipt */}
            <div className="flex items-center gap-2">
              {/* Renew Button (Only when borrowed, not overdue, and under 2 renewals) */}
              {record.status === "BORROWED" && !isReturned && !isOverdue && renewCount < 2 && (
                <button
                  type="button"
                  onClick={handleRenew}
                  disabled={isPending}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/30 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                  title="Renew book for 7 more days"
                >
                  <RefreshCw className={`size-3.5 ${isPending ? "animate-spin" : ""}`} />
                  <span className="hidden xs:inline">Renew</span>
                </button>
              )}

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
      </div>

      {/* Receipt Modal */}
      <BookReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        record={{ ...record, dueDate }}
        userName={userName}
        universityId={universityId}
      />
    </>
  );
};

export default BorrowedBookCard;

