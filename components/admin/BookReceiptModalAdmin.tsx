"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface BookReceiptModalProps {
  record: {
    id: string;
    borrowDate: string | Date;
    dueDate: string | Date;
    returnDate?: string | Date | null;
    status: string;
    book: {
      title: string;
      author: string;
      genre: string;
    };
    user: {
      fullName: string;
      email: string;
      universityId: number;
    };
  };
}

const BookReceiptModalAdmin = ({ record }: BookReceiptModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (dateValue: string | Date | undefined | null) => {
    if (!dateValue) return "N/A";
    const d = new Date(dateValue);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="book-receipt_admin-btn flex items-center gap-2 px-4 py-2 cursor-pointer">
          <Image
            src="/icons/admin/receipt.svg"
            alt="receipt"
            width={16}
            height={16}
          />
          Generate
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100">
          <DialogTitle className="text-lg font-bold text-dark-400">
            Borrow Receipt
          </DialogTitle>
        </DialogHeader>

        <div className="mt-5 space-y-4 text-sm">
          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="text-slate-500">Receipt ID:</span>
            <span className="font-mono text-xs font-semibold">
              {record.id.slice(0, 8).toUpperCase()}
            </span>
          </div>

          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="text-slate-500">Student Name:</span>
            <span className="font-semibold">{record.user.fullName}</span>
          </div>

          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="text-slate-500">Student ID:</span>
            <span className="font-semibold">{record.user.universityId}</span>
          </div>

          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="text-slate-500">Book Title:</span>
            <span className="font-semibold text-right line-clamp-1 max-w-[200px]">
              {record.book.title}
            </span>
          </div>

          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="text-slate-500">Author:</span>
            <span>{record.book.author}</span>
          </div>

          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="text-slate-500">Borrow Date:</span>
            <span>{formatDate(record.borrowDate)}</span>
          </div>

          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="text-slate-500">Due Date:</span>
            <span>{formatDate(record.dueDate)}</span>
          </div>

          {record.returnDate && (
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-slate-500">Return Date:</span>
              <span className="font-semibold text-green-600">
                {formatDate(record.returnDate)}
              </span>
            </div>
          )}

          <div className="flex justify-between pt-2">
            <span className="text-slate-500">Status:</span>
            <span
              className={`font-bold px-2 py-0.5 rounded text-xs ${
                record.status === "RETURNED"
                  ? "bg-green-100 text-green-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {record.status}
            </span>
          </div>

          <div className="flex flex-col items-center gap-2 pt-3">
            <div className="rounded-xl border border-slate-100 bg-white p-3">
              <Image
                src={`/api/qr/${record.id}`}
                alt="Scan this QR code at the library counter"
                width={160}
                height={160}
                unoptimized
              />
            </div>
            <p className="text-center text-xs leading-relaxed text-slate-500">
              Show this QR code at the counter for fast check-in/check-out.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookReceiptModalAdmin;
