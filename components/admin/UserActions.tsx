"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateUserRole, deleteUser } from "@/lib/actions/admin.actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface UserActionsProps {
  userId: string;
  currentRole: string;
  showDelete?: boolean;
}

const UserActions = ({
  userId,
  currentRole,
  showDelete = false,
}: UserActionsProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const roleMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isRoleMenuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target as Node)) {
        setIsRoleMenuOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsRoleMenuOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isRoleMenuOpen]);

  const handleRoleChange = async (newRole: "USER" | "ADMIN") => {
    if (newRole === currentRole) return;

    setIsUpdating(true);
    try {
      const result = await updateUserRole({ userId, role: newRole });
      if (result.success) {
        toast.success(`User role updated to ${newRole}`);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update role");
      }
    } catch (error) {
      toast.error("Failed to update role");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteUser(userId);
      if (result.success) {
        toast.success("User deleted successfully");
        setShowDeleteDialog(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete user");
      }
    } catch (error) {
      toast.error("Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  if (showDelete) {
    return (
      <>
        <button
          onClick={() => setShowDeleteDialog(true)}
          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          title="Delete user"
        >
          <Image src="/icons/admin/trash.svg" alt="delete" width={18} height={18} />
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
                Delete User
              </DialogTitle>
              <DialogDescription className="text-center text-sm text-slate-500 leading-relaxed">
                Are you sure you want to delete this user? This action cannot be
                undone.
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
                {isDeleting ? "Deleting..." : "Delete User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <div className="relative inline-block" ref={roleMenuRef}>
      <button
        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
          currentRole === "ADMIN"
            ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
            : "bg-green-100 text-green-700 hover:bg-green-200"
        }`}
        disabled={isUpdating}
        onClick={() => setIsRoleMenuOpen((prev) => !prev)}
        aria-expanded={isRoleMenuOpen}
      >
        {currentRole}
        <Image
          src="/icons/admin/chevron-down.svg"
          alt="dropdown"
          width={12}
          height={12}
        />
      </button>

      {isRoleMenuOpen && (
        <div className="absolute left-0 top-full z-10 mt-1 w-32 rounded-lg border border-gray-100 bg-white shadow-lg">
          <button
            onClick={() => { handleRoleChange("USER"); setIsRoleMenuOpen(false); }}
            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
              currentRole === "USER" ? "font-semibold" : ""
            }`}
          >
            User
            {currentRole === "USER" && (
              <span className="ml-2 text-green-500">✓</span>
            )}
          </button>
          <button
            onClick={() => { handleRoleChange("ADMIN"); setIsRoleMenuOpen(false); }}
            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
              currentRole === "ADMIN" ? "font-semibold" : ""
            }`}
          >
            Admin
            {currentRole === "ADMIN" && (
              <span className="ml-2 text-green-500">✓</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default UserActions;
