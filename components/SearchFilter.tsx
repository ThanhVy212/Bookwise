"use client";

import React, { useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";

interface SearchFilterProps {
  genres: string[];
  selectedGenre?: string;
}

const SearchFilter = ({ genres = [], selectedGenre = "" }: SearchFilterProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const genre = e.target.value;
    const params = new URLSearchParams(searchParams.toString());

    if (genre && genre !== "all") {
      params.set("genre", genre);
    } else {
      params.delete("genre");
    }

    params.set("page", "1");

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="relative inline-flex items-center">
      <select
        value={selectedGenre || "all"}
        onChange={handleGenreChange}
        aria-label="Filter by department"
        className="select-trigger appearance-none cursor-pointer rounded-lg bg-dark-300 pl-4 pr-10 py-2.5 text-sm font-medium text-light-100 border border-dark-100/50 hover:border-light-100/30 focus:outline-none focus:ring-1 focus:ring-primary transition-all"
      >
        <option value="all" className="bg-dark-300 text-white">
          Filter by: Department
        </option>
        {genres.map((genre) => (
          <option key={genre} value={genre} className="bg-dark-300 text-white">
            {genre}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 size-4 text-light-100 opacity-60" />
    </div>
  );
};

export default SearchFilter;
