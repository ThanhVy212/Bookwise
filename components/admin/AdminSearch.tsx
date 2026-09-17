"use client";

import React, { useEffect, useState, useTransition, useCallback } from "react";
import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { X } from "lucide-react";

interface AdminSearchProps {
  placeholder?: string;
  className?: string;
}

const AdminSearch = ({
  placeholder = "Search users, books by title, author, or genre.",
  className = "",
}: AdminSearchProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("query") || "";

  const [value, setValue] = useState(initialQuery);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setValue(initialQuery);
  }, [initialQuery]);

  const updateSearch = useCallback(
    (newQuery: string) => {
      const trimmed = newQuery.trim();
      
      const isListPage =
        pathname === "/admin/books" ||
        pathname === "/admin/book-requests" ||
        pathname === "/admin/users" ||
        pathname === "/admin/account-requests";

      const targetPath = isListPage ? pathname : "/admin/books";
      const params = new URLSearchParams(isListPage ? searchParams.toString() : "");

      if (trimmed) {
        params.set("query", trimmed);
      } else {
        params.delete("query");
      }
      params.set("page", "1");

      const queryString = params.toString();
      startTransition(() => {
        router.push(queryString ? `${targetPath}?${queryString}` : targetPath);
      });
    },
    [searchParams, pathname, router, startTransition],
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      if (value !== initialQuery) {
        updateSearch(value);
      }
    }, 350);

    return () => clearTimeout(handler);
  }, [value, initialQuery, updateSearch]);

  const handleClear = () => {
    setValue("");
    updateSearch("");
  };

  return (
    <div
      className={`flex h-11 w-full max-w-md items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 shadow-2xs transition-all focus-within:border-primary-admin focus-within:ring-1 focus-within:ring-primary-admin/20 ${className}`}
    >
      <Image
        src="/icons/search.svg"
        alt="search"
        width={16}
        height={16}
        className="opacity-50 flex-shrink-0"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-dark-400 placeholder:text-slate-400 placeholder:text-xs sm:placeholder:text-sm outline-none border-none focus:ring-0"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          aria-label="Clear search"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
};

export default AdminSearch;
