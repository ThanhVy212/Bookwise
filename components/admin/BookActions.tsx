"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteBook } from "@/lib/actions/admin.actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface BookActionsProps {
  bookId: string;
  bookTitle: string;
}

const BookActions = ({ bookId, bookTitle }: BookActionsProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteBook(bookId);
      if (result.success) {
        toast.success("Book deleted successfully");
        setShowDeleteDialog(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete book");
      }
    } catch (error) {
      toast.error("Failed to delete book");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowDeleteDialog(true)}
        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
        title="Delete book"
      >
        <Image
          src="/icons/admin/trash.svg"
          alt="delete"
          width={18}
          height={18}
        />
      </button>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-rose-100">
              <div className="flex size-9 items-center justify-center rounded-full bg-rose-500 text-white font-bold text-lg">
                !
              </div>
            </div>
            <DialogTitle className="text-center text-xl font-bold text-dark-400">
              Delete Book
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-slate-500 leading-relaxed">
              Are you sure you want to delete &quot;{bookTitle}&quot;? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex flex-row items-center gap-3 w-full">
            <Button
              variant="outline"
              className="flex-1 h-11 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 h-11 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Book"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BookActions;
