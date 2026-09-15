"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ImageKitProvider, Image as ImageKitImage } from "@imagekit/next";
import BookCoverSvg from "@/components/BookCoverSvg";
import config from "@/lib/config";

const variantStyles: Record<BookCoverVariant, string> = {
  extraSmall: "book-cover_extra_small",
  small: "book-cover_small",
  medium: "book-cover_medium",
  regular: "book-cover_regular",
  wide: "book-cover_wide",
};

const BookCover = ({
  className,
  variant = "regular",
  coverColor = "#012B48",
  coverUrl = "https://placeholder.co/400x600.png",
}: BookCoverProps) => {
  return (
    <ImageKitProvider urlEndpoint={config.env.imagekit.urlEndpoint}>
      <div
        className={cn(
          "relative transition-all duration-300",
          variantStyles[variant],
          className,
        )}
      >
        <BookCoverSvg coverColor={coverColor} />
        <div
          className="absolute z-10"
          style={{ left: "12%", width: "87.5%", height: "88%" }}
        >
          <ImageKitImage
            src={coverUrl}
            alt="Book cover"
            fill
            className="rounded-sm object-fill"
          />
        </div>
      </div>
    </ImageKitProvider>
  );
};
export default BookCover;
