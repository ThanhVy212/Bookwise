"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { X } from "lucide-react";

const SearchNotFound = () => {
  const router = useRouter();
  const pathname = usePathname();

  const handleClear = () => {
    router.push(pathname);
  };

  return (
    <div id="not-found" className="my-16 flex w-full flex-col items-center justify-center text-center">
      {/* Circle Icon Container */}
      <div className="relative flex size-36 items-center justify-center rounded-full bg-dark-300 shadow-2xl border border-dark-100/40">
        <div className="relative flex flex-col items-center justify-center size-20 rounded-xl bg-dark-600/80 border border-white/10 p-3 shadow-inner">
          <div className="size-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center mb-2">
            <X className="size-4 text-primary stroke-[3]" />
          </div>
          <div className="w-8 h-1 rounded-full bg-light-100/30 mb-1" />
          <div className="w-5 h-1 rounded-full bg-light-100/20" />
        </div>
      </div>

      <h4 className="mt-6 text-2xl font-bold text-white">No Results Found</h4>
      <p className="mt-2 max-w-sm text-sm text-light-100 leading-relaxed">
        We couldn&apos;t find any books matching your search. Try using different keywords or check for typos.
      </p>

      <button
        type="button"
        onClick={handleClear}
        className="not-found-btn cursor-pointer transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]"
      >
        CLEAR SEARCH
      </button>
    </div>
  );
};

export default SearchNotFound;
