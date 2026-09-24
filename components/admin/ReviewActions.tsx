"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import { deleteReviewAdmin } from "@/lib/actions/admin.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ReviewActionsProps {
  reviewId: string;
  bookTitle: string;
  userName: string;
}

const ReviewActions = ({ reviewId, bookTitle, userName }: ReviewActionsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteReviewAdmin(reviewId);
      if (result.success) {
        toast.success("Review removed successfully");
        setIsOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to remove review");
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
        title="Delete review"
        aria-label="Delete review"
      >
        <Image
          src="/icons/admin/trash.svg"
          alt="delete"
          width={18}
          height={18}
        />
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-rose-100">
              <div className="flex size-9 items-center justify-center rounded-full bg-rose-500 text-white font-bold text-lg">
                !
              </div>
            </div>
            <DialogTitle className="text-center text-xl font-bold text-dark-400">
              Delete Community Review
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-slate-500 leading-relaxed">
              Are you sure you want to remove the review by{" "}
              <strong className="text-dark-400 font-semibold">{userName}</strong> for &quot;{bookTitle}&quot;?
              This action will recalculate the book&apos;s average rating and cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-6 flex flex-row items-center gap-3 w-full">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-11 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              onClick={() => setIsOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1 h-11 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? "Deleting..." : "Delete Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReviewActions;
