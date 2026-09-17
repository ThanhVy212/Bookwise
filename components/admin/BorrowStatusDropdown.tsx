"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateBorrowRecordStatus } from "@/lib/actions/admin.actions";
import { Check, ChevronDown } from "lucide-react";

interface BorrowStatusDropdownProps {
  recordId: string;
  currentStatus: string;
  isOverdue?: boolean;
}

const BorrowStatusDropdown = ({
  recordId,
  currentStatus,
  isOverdue = false,
}: BorrowStatusDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStatusChange = async (newStatus: "BORROWED" | "RETURNED") => {
    if (newStatus === currentStatus) {
      setIsOpen(false);
      return;
    }

    setIsUpdating(true);
    try {
      const result = await updateBorrowRecordStatus({
        recordId,
        status: newStatus,
      });

      if (result.success) {
        toast.success(`Status updated to ${newStatus === "BORROWED" ? "Borrowed" : "Returned"}`);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update status");
      }
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setIsUpdating(false);
      setIsOpen(false);
    }
  };

  const displayStatus = isOverdue && currentStatus === "BORROWED" ? "Late Return" : currentStatus === "BORROWED" ? "Borrowed" : "Returned";

  const getStatusStyle = () => {
    if (isOverdue && currentStatus === "BORROWED") {
      return "bg-rose-50 text-rose-600 hover:bg-rose-100/70";
    }
    if (currentStatus === "BORROWED") {
      return "bg-purple-50 text-purple-600 hover:bg-purple-100/70";
    }
    return "bg-sky-50 text-sky-600 hover:bg-sky-100/70";
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        className={`inline-flex min-w-[105px] items-center justify-between gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer border border-transparent shadow-2xs ${getStatusStyle()}`}
      >
        <span>{displayStatus}</span>
        <ChevronDown className="size-3 opacity-60 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-36 rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl">
          <button
            type="button"
            onClick={() => handleStatusChange("BORROWED")}
            className={`w-full px-3 py-2 text-left text-xs font-medium rounded-lg hover:bg-slate-50 flex items-center justify-between text-purple-600 ${
              currentStatus === "BORROWED" && !isOverdue ? "bg-purple-50/50 font-semibold" : ""
            }`}
          >
            <span>Borrowed</span>
            {currentStatus === "BORROWED" && !isOverdue && (
              <Check className="size-3.5 text-purple-600" />
            )}
          </button>
          
          <button
            type="button"
            onClick={() => handleStatusChange("RETURNED")}
            className={`w-full px-3 py-2 text-left text-xs font-medium rounded-lg hover:bg-slate-50 flex items-center justify-between text-sky-600 ${
              currentStatus === "RETURNED" ? "bg-sky-50/50 font-semibold" : ""
            }`}
          >
            <span>Returned</span>
            {currentStatus === "RETURNED" && (
              <Check className="size-3.5 text-sky-600" />
            )}
          </button>

          <button
            type="button"
            onClick={() => handleStatusChange("BORROWED")}
            className={`w-full px-3 py-2 text-left text-xs font-medium rounded-lg hover:bg-slate-50 flex items-center justify-between text-rose-600 ${
              isOverdue && currentStatus === "BORROWED" ? "bg-rose-50/50 font-semibold" : ""
            }`}
          >
            <span>Late Return</span>
            {isOverdue && currentStatus === "BORROWED" && (
              <Check className="size-3.5 text-rose-600" />
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default BorrowStatusDropdown;

