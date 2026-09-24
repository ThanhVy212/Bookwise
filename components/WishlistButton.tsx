"use client";

import React, { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleWishlist } from "@/lib/actions/book.actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  bookId: string;
  initialIsWishlisted?: boolean;
  variant?: "button" | "icon";
  className?: string;
  onWishlistChange?: (isWishlisted: boolean) => void;
}

const WishlistButton = ({
  bookId,
  initialIsWishlisted = false,
  variant = "button",
  className,
  onWishlistChange,
}: Props) => {
  const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const nextState = !isWishlisted;
    setIsWishlisted(nextState);

    startTransition(async () => {
      try {
        const result = await toggleWishlist(bookId);
        if (!result.success) {
          setIsWishlisted(!nextState); // rollback
          toast.error(result.error || "Failed to update saved books");
        } else {
          setIsWishlisted(result.isWishlisted ?? nextState);
          onWishlistChange?.(result.isWishlisted ?? nextState);
          if (result.isWishlisted) {
            toast.success("Saved to your reading list ❤️");
          } else {
            toast.info("Removed from saved books");
          }
        }
      } catch {
        setIsWishlisted(!nextState); // rollback
        toast.error("Failed to update saved books");
      }
    });
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        disabled={isPending}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleToggle();
        }}
        className={cn(
          "flex size-9 items-center justify-center rounded-full bg-dark-300/80 backdrop-blur-md transition-all hover:scale-110 active:scale-95 disabled:opacity-50",
          isWishlisted ? "text-red-500" : "text-light-100 hover:text-white",
          className,
        )}
        title={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
      >
        <Heart
          className={cn("size-5", isWishlisted && "fill-current text-red-500")}
        />
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleToggle}
      className={cn(
        "min-h-14 w-fit inline-flex flex-row items-center justify-center gap-3 rounded-xl px-8 py-3.5 font-bebas-neue text-2xl font-bold uppercase tracking-wider transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md max-md:w-full cursor-pointer disabled:opacity-50",
        isWishlisted
          ? "border-2 border-red-500/60 bg-red-500/15 text-red-400 hover:bg-red-500/25"
          : "border-2 border-light-100/20 bg-dark-300/60 text-light-100 hover:bg-dark-300 hover:text-white",
        className,
      )}
    >
      <Heart
        className={cn(
          "size-6 transition-transform duration-200",
          isWishlisted ? "fill-current text-red-500 scale-110" : "text-light-100",
        )}
      />
      <span>{isWishlisted ? "SAVED IN WISHLIST" : "SAVE FOR LATER"}</span>
    </button>
  );
};

export default WishlistButton;
