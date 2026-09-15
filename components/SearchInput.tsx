"use client";

import React, { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { X } from "lucide-react";

interface SearchInputProps {
  placeholder?: string;
  className?: string;
}

const SearchInput = ({
  placeholder = "Search books by title, author, or genre...",
  className = "",
}: SearchInputProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("query") || "";

  const [value, setValue] = useState(initialQuery);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setValue(initialQuery);
  }, [initialQuery]);

  const updateSearch = (newQuery: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newQuery.trim()) {
      params.set("query", newQuery.trim());
    } else {
      params.delete("query");
    }

    params.set("page", "1"); // Reset page when query changes

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      if (value !== initialQuery) {
        updateSearch(value);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [value]);

  const handleClear = () => {
    setValue("");
    updateSearch("");
  };

  return (
    <div className={`search max-w-xl mx-auto ${className}`}>
      <Image
        src="/icons/search-fill.svg"
        alt="search"
        width={22}
        height={22}
        className="opacity-70 mr-3 flex-shrink-0"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="search-input bg-transparent outline-none flex-1 text-base text-white placeholder:text-light-100/60"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="p-1 rounded-full text-light-100 hover:text-white hover:bg-white/10 transition-colors ml-2"
          aria-label="Clear search"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
