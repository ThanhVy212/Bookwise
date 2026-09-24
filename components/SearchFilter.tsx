"use client";

import React, { useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronDown, Check } from "lucide-react";

interface SearchFilterProps {
  genres: string[];
  selectedGenre?: string;
  selectedSort?: string;
  availableOnly?: boolean;
}

const SearchFilter = ({
  genres = [],
  selectedGenre = "",
  selectedSort = "latest",
  availableOnly = false,
}: SearchFilterProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all" && value !== "false") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateParam("genre", e.target.value);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateParam("sort", e.target.value);
  };

  const handleAvailabilityToggle = () => {
    updateParam("availableOnly", availableOnly ? null : "true");
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Availability Toggle Button */}
      <button
        onClick={handleAvailabilityToggle}
        type="button"
        className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs sm:text-sm font-medium border transition-colors cursor-pointer ${
          availableOnly
            ? "bg-primary/20 text-primary border-primary/40 hover:bg-primary/30"
            : "bg-dark-300 text-light-100 border-dark-100/50 hover:border-light-100/30 hover:text-white"
        }`}
      >
        <span
          className={`flex size-4 items-center justify-center rounded border ${
            availableOnly
              ? "bg-primary border-primary text-dark-100"
              : "border-light-100/40"
          }`}
        >
          {availableOnly && <Check className="size-3 stroke-[3]" />}
        </span>
        <span>Available Only</span>
      </button>

      {/* Genre Filter */}
      <div className="relative inline-flex items-center">
        <select
          value={selectedGenre || "all"}
          onChange={handleGenreChange}
          aria-label="Filter by genre"
          className="select-trigger appearance-none cursor-pointer rounded-lg bg-dark-300 pl-3.5 pr-9 py-2 text-xs sm:text-sm font-medium text-light-100 border border-dark-100/50 hover:border-light-100/30 focus:outline-none focus:ring-1 focus:ring-primary transition-all"
        >
          <option value="all" className="bg-dark-300 text-white">
            All Genres
          </option>
          {genres.map((genre) => (
            <option key={genre} value={genre} className="bg-dark-300 text-white">
              {genre}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 size-4 text-light-100 opacity-60" />
      </div>

      {/* Sort Filter */}
      <div className="relative inline-flex items-center">
        <select
          value={selectedSort || "latest"}
          onChange={handleSortChange}
          aria-label="Sort books"
          className="select-trigger appearance-none cursor-pointer rounded-lg bg-dark-300 pl-3.5 pr-9 py-2 text-xs sm:text-sm font-medium text-light-100 border border-dark-100/50 hover:border-light-100/30 focus:outline-none focus:ring-1 focus:ring-primary transition-all"
        >
          <option value="latest" className="bg-dark-300 text-white">
            Sort: Latest
          </option>
          <option value="highest_rated" className="bg-dark-300 text-white">
            Sort: Highest Rated
          </option>
          <option value="available" className="bg-dark-300 text-white">
            Sort: Most Available
          </option>
          <option value="title_asc" className="bg-dark-300 text-white">
            Sort: Title (A - Z)
          </option>
          <option value="title_desc" className="bg-dark-300 text-white">
            Sort: Title (Z - A)
          </option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 size-4 text-light-100 opacity-60" />
      </div>
    </div>
  );
};

export default SearchFilter;

