"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import StudentCard from "@/components/StudentCard";
import { X } from "lucide-react";

interface ViewIdCardModalProps {
  user: {
    fullName: string;
    email: string;
    universityId: number | string;
    universityCard?: string;
    status?: string;
  };
}

const ViewIdCardModal = ({ user }: ViewIdCardModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
        >
          <Image
            src="/icons/admin/eye.svg"
            alt="view"
            width={16}
            height={16}
          />
          <span>View ID Card</span>
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-[460px] bg-transparent border-none p-0 shadow-none">
        <div className="relative flex flex-col items-center">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="absolute -top-3 -right-2 z-20 flex size-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md hover:bg-white/30 transition-colors"
            title="Close"
          >
            <X className="size-4" />
          </button>
          <StudentCard user={user} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewIdCardModal;
