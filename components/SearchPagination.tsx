"use client";

import React, { useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SearchPaginationProps {
  currentPage: number;
  totalPages: number;
}

const SearchPagination = ({
  currentPage = 1,
  totalPages = 1,
}: SearchPaginationProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  if (totalPages <= 1) return null;

  const navigateToPage = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage, "...", totalPages);
      }
    }

    return pages;
  };

  const pages = generatePageNumbers();

  return (
    <div id="pagination" className="flex items-center justify-end gap-2 mt-12">
      {/* Prev button */}
      <button
        type="button"
        onClick={() => navigateToPage(currentPage - 1)}
        disabled={currentPage <= 1}
        className="pagination-btn_dark flex size-9 items-center justify-center rounded-md border border-dark-100 text-light-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:text-white"
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" />
      </button>

      {/* Page Numbers */}
      {pages.map((p, idx) => {
        if (p === "...") {
          return (
            <span key={`ellipsis-${idx}`} className="px-2 text-sm text-light-100/60">
              ...
            </span>
          );
        }

        const pageNum = Number(p);
        const isActive = pageNum === currentPage;

        return (
          <button
            key={`page-${pageNum}`}
            type="button"
            onClick={() => navigateToPage(pageNum)}
            className={`min-w-9 h-9 px-3 rounded-md text-sm font-semibold transition-all ${
              isActive
                ? "bg-primary text-dark-100 shadow-md font-bold"
                : "pagination-btn_dark border border-dark-100 text-light-100 hover:text-white"
            }`}
          >
            {pageNum}
          </button>
        );
      })}

      {/* Next button */}
      <button
        type="button"
        onClick={() => navigateToPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="pagination-btn_dark flex size-9 items-center justify-center rounded-md border border-dark-100 text-light-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:text-white"
        aria-label="Next page"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
};

export default SearchPagination;
