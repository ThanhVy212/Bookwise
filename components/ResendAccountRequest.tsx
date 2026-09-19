"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { resendAccountRequest } from "@/lib/actions/auth.actions";
import Image from "next/image";

const ResendAccountRequest = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleResend = async () => {
    setLoading(true);

    try {
      const result = await resendAccountRequest();

      if (result.success) {
        toast.success("Account request resent successfully! Please wait for admin approval.");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to resend account request");
      }
    } catch (error) {
      toast.error("An error occurred while resending the request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleResend}
      disabled={loading}
      className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-dark-100 hover:bg-primary/90 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Image src="/icons/book.svg" alt="resend" width={18} height={18} />
      <span>{loading ? "SENDING..." : "RESEND ACCOUNT REQUEST"}</span>
    </button>
  );
};

export default ResendAccountRequest;
