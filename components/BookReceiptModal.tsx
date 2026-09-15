"use client";

import React from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Dialog } from "@base-ui/react/dialog";

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
    <Dialog.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" />
        <Dialog.Popup className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-dark-300 p-6 border border-light-100/10 shadow-2xl">
            {/* Close Button */}
            <Dialog.Close
              aria-label="Close receipt"
              className="absolute top-4 right-4 text-light-100 hover:text-white transition-colors cursor-pointer"
            >
              <X className="size-5" />
            </Dialog.Close>

            {/* Header */}
            <div className="flex items-center gap-3 border-b border-light-100/10 pb-4">
              <Image src="/icons/receipt.svg" alt="receipt" width={24} height={24} />
              <Dialog.Title className="text-xl font-bold text-white">
                Borrow Receipt
              </Dialog.Title>
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
              <Dialog.Close
                className="bg-primary text-dark-100 hover:bg-primary/90 font-semibold px-5 rounded-md"
              >
                Close
              </Dialog.Close>
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default BookReceiptModal;
