"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BookReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
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
  };
  userName?: string;
  universityId?: number | string;
}

const BookReceiptModal = ({
  isOpen,
  onClose,
  record,
  userName,
  universityId,
}: BookReceiptModalProps) => {
  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-dark-300 p-6 border border-light-100/10 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-light-100 hover:text-white transition-colors cursor-pointer"
        >
          <X className="size-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-light-100/10 pb-4">
          <Image src="/icons/receipt.svg" alt="receipt" width={24} height={24} />
          <h3 className="text-xl font-bold text-white">Borrow Receipt</h3>
        </div>

        {/* Receipt Content */}
        <div className="mt-5 space-y-4 text-sm">
          <div className="flex justify-between border-b border-light-100/5 pb-2">
            <span className="text-light-100">Receipt ID:</span>
            <span className="font-mono text-xs text-white font-semibold">
              {record.id.slice(0, 8).toUpperCase()}
            </span>
          </div>

          <div className="flex justify-between border-b border-light-100/5 pb-2">
            <span className="text-light-100">Student Name:</span>
            <span className="font-semibold text-white">{userName || "Student"}</span>
          </div>

          {universityId && (
            <div className="flex justify-between border-b border-light-100/5 pb-2">
              <span className="text-light-100">Student ID:</span>
              <span className="font-semibold text-white">{universityId}</span>
            </div>
          )}

          <div className="flex justify-between border-b border-light-100/5 pb-2">
            <span className="text-light-100">Book Title:</span>
            <span className="font-semibold text-white text-right line-clamp-1 max-w-[200px]">
              {record.book.title}
            </span>
          </div>

          <div className="flex justify-between border-b border-light-100/5 pb-2">
            <span className="text-light-100">Author:</span>
            <span className="text-light-200">{record.book.author}</span>
          </div>

          <div className="flex justify-between border-b border-light-100/5 pb-2">
            <span className="text-light-100">Borrow Date:</span>
            <span className="text-white">{formatDate(record.borrowDate)}</span>
          </div>

          <div className="flex justify-between border-b border-light-100/5 pb-2">
            <span className="text-light-100">Due Date:</span>
            <span className="text-white">{formatDate(record.dueDate)}</span>
          </div>

          {record.returnDate && (
            <div className="flex justify-between border-b border-light-100/5 pb-2">
              <span className="text-light-100">Return Date:</span>
              <span className="text-green-500 font-semibold">
                {formatDate(record.returnDate)}
              </span>
            </div>
          )}

          <div className="flex justify-between pt-2">
            <span className="text-light-100">Status:</span>
            <span
              className={`font-bold px-2 py-0.5 rounded text-xs ${
                record.status === "RETURNED"
                  ? "bg-green-500/20 text-green-400"
                  : "bg-primary/20 text-primary"
              }`}
            >
              {record.status}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <Button
            onClick={onClose}
            className="bg-primary text-dark-100 hover:bg-primary/90 font-semibold px-5"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookReceiptModal;
