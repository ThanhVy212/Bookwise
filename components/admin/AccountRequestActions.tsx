"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  approveAccountRequest,
  rejectAccountRequest,
} from "@/lib/actions/admin.actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AccountRequestActionsProps {
  userId: string;
}

const AccountRequestActions = ({ userId }: AccountRequestActionsProps) => {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const router = useRouter();

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      const result = await approveAccountRequest(userId);
      if (result.success) {
        toast.success("Account approved successfully");
        setShowApproveDialog(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to approve account");
      }
    } catch (error) {
      toast.error("Failed to approve account");
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    setIsRejecting(true);
    try {
      const result = await rejectAccountRequest(userId);
      if (result.success) {
        toast.success("Account request rejected");
        setShowRejectDialog(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to reject account");
      }
    } catch (error) {
      toast.error("Failed to reject account");
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => setShowApproveDialog(true)}
          className="confirm-trigger confirm-approve px-4 py-2 cursor-pointer"
        >
          Approve Account
        </button>
        <button
          onClick={() => setShowRejectDialog(true)}
          className="flex size-8 items-center justify-center rounded-full bg-red-100 text-red-500 hover:bg-red-200 transition-colors cursor-pointer"
          title="Reject account"
        >
          <span className="text-lg">×</span>
        </button>
      </div>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100">
              <div className="flex size-9 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-lg">
                ✓
              </div>
            </div>
            <DialogTitle className="text-center text-xl font-bold text-dark-400">
              Approve Account Request
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-slate-500 leading-relaxed">
              Approve the student&apos;s account request and grant access. A
              confirmation email will be sent upon approval.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex flex-col gap-2 w-full">
            <Button
              className="w-full h-11 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
              onClick={handleApprove}
              disabled={isApproving}
            >
              {isApproving ? "Approving..." : "Approve & Send Confirmation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-rose-100">
              <div className="flex size-9 items-center justify-center rounded-full bg-rose-500 text-white font-bold text-lg">
                !
              </div>
            </div>
            <DialogTitle className="text-center text-xl font-bold text-dark-400">
              Deny Account Request
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-slate-500 leading-relaxed">
              Denying this request will notify the student they&apos;re not
              eligible due to unsuccessful ID card verification.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex flex-col gap-2 w-full">
            <Button
              className="w-full h-11 rounded-xl bg-[#E25C2B] text-white text-sm font-semibold hover:bg-[#D04F20]"
              onClick={handleReject}
              disabled={isRejecting}
            >
              {isRejecting ? "Denying..." : "Deny & Notify Student"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AccountRequestActions;
