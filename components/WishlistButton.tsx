"use client";

import React, { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { toggleWishlist } from "@/lib/actions/book.actions";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  bookId: string;
  initialIsWishlisted?: boolean;
  variant?: "icon" | "button" | "pill";
  className?: string;
}

const WishlistButton = ({
  bookId,
  initialIsWishlisted = false,
  variant = "icon",
  className = "",
}: WishlistButtonProps) => {
  const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const previousState = isWishlisted;
    setIsWishlisted(!previousState);

    startTransition(async () => {
      try {
        const result = await toggleWishlist({ bookId });
        if (!result.success) {
          setIsWishlisted(previousState);
          toast.error(result.error || "Failed to update saved books");
          if (result.error?.includes("sign in")) {
            router.push("/sign-in");
          }
          return;
        }

        setIsWishlisted(result.isWishlisted ?? false);
        toast.success(result.message || (result.isWishlisted ? "Added to Wishlist" : "Removed from Wishlist"));
        router.refresh();
      } catch {
        setIsWishlisted(previousState);
        toast.error("An error occurred while saving book");
      }
    });
  };

  if (variant === "button") {
    return (
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold text-sm transition-all duration-200 cursor-pointer",
          isWishlisted
            ? "bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30"
            : "bg-dark-300 text-light-100 border border-light-100/10 hover:bg-dark-200 hover:text-white",
          className
        )}
        title={isWishlisted ? "Remove from saved books" : "Save for later"}
        type="button"
      >
        <Heart
          className={cn(
            "size-5 transition-transform duration-200",
            isWishlisted ? "fill-rose-500 text-rose-500 scale-110" : "text-light-100",
            isPending && "animate-pulse"
          )}
        />
        <span>{isWishlisted ? "Saved in Wishlist" : "Save for Later"}</span>
      </button>
    );
  }

  if (variant === "pill") {
    return (
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer",
          isWishlisted
            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
            : "bg-dark-200/80 text-light-100 hover:text-white border border-light-100/10",
          className
        )}
        type="button"
      >
        <Heart
          className={cn(
            "size-3.5",
            isWishlisted ? "fill-rose-500 text-rose-500" : "text-light-100"
          )}
        />
        <span>{isWishlisted ? "Saved" : "Save"}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        "flex size-9 items-center justify-center rounded-full transition-all duration-200 cursor-pointer backdrop-blur-md shadow-md",
        isWishlisted
          ? "bg-rose-500/30 text-rose-400 border border-rose-500/50 hover:bg-rose-500/40"
          : "bg-dark-300/80 text-light-100 border border-light-100/20 hover:bg-dark-200 hover:text-white hover:scale-105",
        className
      )}
      title={isWishlisted ? "Remove from saved books" : "Save for later"}
      type="button"
    >
      <Heart
        className={cn(
          "size-4.5 transition-transform duration-200",
          isWishlisted ? "fill-rose-500 text-rose-500 scale-110" : "text-light-100",
          isPending && "animate-pulse"
        )}
      />
    </button>
  );
};

export default WishlistButton;
