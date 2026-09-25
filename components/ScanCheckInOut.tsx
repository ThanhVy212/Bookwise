"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Check, LogIn, LogOut, RotateCcw } from "lucide-react";
import { confirmBorrowScan } from "@/lib/actions/admin.actions";
import config from "@/lib/config";

interface ScanCheckInOutProps {
  record: {
    id: string;
    status: string;
    borrowDate: string;
    dueDate: string;
    returnDate: string | null;
    pickedUpAt: string | null;
    renewCount: number;
    book: {
      title: string;
      author: string;
      coverUrl: string;
      coverColor: string;
      availableCopies: number;
      totalCopies: number;
    };
    user: {
      fullName: string;
      universityId: number;
    };
  };
}

const formatDate = (value: string | null | undefined) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const ScanCheckInOut = ({ record }: ScanCheckInOutProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isReturned = record.status === "RETURNED";
  const isCheckedOut = record.status === "BORROWED" && !!record.pickedUpAt;
  const isOverdue =
    !isReturned && new Date(record.dueDate).getTime() < Date.now();

  const coverSrc = record.book.coverUrl
    ? /^https?:\/\//.test(record.book.coverUrl)
      ? record.book.coverUrl
      : `${config.env.imagekit.urlEndpoint}${record.book.coverUrl}`
    : "https://placeholder.co/400x600.png";

  const handleAction = async (action: "CHECK_OUT" | "CHECK_IN") => {
    setIsSubmitting(true);
    try {
      const result = await confirmBorrowScan({ recordId: record.id, action });

      if (result.success) {
        toast.success(
          "message" in result && result.message
            ? result.message
            : "Receipt updated",
        );
        router.refresh();
      } else {
        toast.error("error" in result ? result.error : "Something went wrong");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-dark-100 bg-pattern bg-cover bg-top">
      <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col px-4 py-6">
      <Link
        href="/admin/book-requests"
        className="mb-6 inline-flex items-center gap-2 text-sm text-light-100/70 transition-colors hover:text-white"
      >
        <ArrowLeft className="size-4" />
        Back to borrow requests
      </Link>

      <div className="rounded-3xl border border-light-100/10 bg-dark-300 p-6 shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-light-100/60">
          Fast check-in / check-out
        </p>
        <h1 className="mt-1 text-2xl font-bold text-white">
          Scan Confirmation
        </h1>
        <p className="mt-1 font-mono text-xs text-light-100/60">
          Receipt ID: {record.id.slice(0, 8).toUpperCase()}
        </p>

        {/* Book */}
        <div className="mt-5 flex items-center gap-4 border-b border-light-100/10 pb-5">
          <div
            className="relative h-24 w-16 shrink-0 overflow-hidden rounded-md"
            style={{ backgroundColor: record.book.coverColor }}
          >
            <Image
              src={coverSrc}
              alt={record.book.title}
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-white">
              {record.book.title}
            </p>
            <p className="truncate text-sm text-light-100/70">
              {record.book.author}
            </p>
            <p className="mt-1 text-xs text-light-100/60">
              {record.book.availableCopies} / {record.book.totalCopies} copies
              available
            </p>
          </div>
        </div>

        {/* Student */}
        <div className="mt-5 border-b border-light-100/10 pb-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-light-100/60">
            Borrower
          </p>
          <p className="mt-1 text-base font-semibold text-white">
            {record.user.fullName}
          </p>
          <p className="text-sm text-light-100/70">
            Student ID: {record.user.universityId}
          </p>
        </div>

        {/* Dates */}
        <dl className="mt-5 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-light-100/70">Borrow date</dt>
            <dd className="text-white">{formatDate(record.borrowDate)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-light-100/70">Due date</dt>
            <dd className={isOverdue ? "font-semibold text-rose-400" : "text-white"}>
              {formatDate(record.dueDate)}
              {isOverdue && " (overdue)"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-light-100/70">Checked out</dt>
            <dd className={isCheckedOut || isReturned ? "text-white" : "text-light-100/50"}>
              {formatDate(record.pickedUpAt)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-light-100/70">Returned</dt>
            <dd className={isReturned ? "font-semibold text-green-400" : "text-light-100/50"}>
              {formatDate(record.returnDate)}
            </dd>
          </div>
          {record.renewCount > 0 && (
            <div className="flex justify-between">
              <dt className="text-light-100/70">Renewals</dt>
              <dd className="text-white">{record.renewCount} / 2</dd>
            </div>
          )}
        </dl>

        {/* Status */}
        <div className="mt-5">
          {isReturned ? (
            <div className="flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm font-semibold text-green-400">
              <Check className="size-4" />
              Book has been returned
            </div>
          ) : isCheckedOut ? (
            <div className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary">
              <Check className="size-4" />
              Book is with the student
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-400">
              <RotateCcw className="size-4" />
              Not yet picked up at the counter
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-3">
          {record.status === "BORROWED" && (
            <button
              type="button"
              onClick={() => handleAction("CHECK_IN")}
              disabled={isSubmitting}
              className="form-btn w-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogIn className="size-4" />
              {isSubmitting ? "Processing..." : "Check-in: mark as returned"}
            </button>
          )}

          {record.status === "BORROWED" && !record.pickedUpAt && (
            <button
              type="button"
              onClick={() => handleAction("CHECK_OUT")}
              disabled={isSubmitting}
              className="w-full cursor-pointer rounded-xl border border-light-100/15 bg-dark-100 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-dark-100/70 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut className="mr-2 inline size-4" />
              {isSubmitting ? "Processing..." : "Check-out: student received the book"}
            </button>
          )}

          {isReturned && (
            <p className="text-center text-sm text-light-100/60">
              No further action is required for this receipt.
            </p>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default ScanCheckInOut;

