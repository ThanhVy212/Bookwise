import React from "react";
import { getAllBooks } from "@/lib/actions/book.actions";
import SearchInput from "@/components/SearchInput";
import SearchFilter from "@/components/SearchFilter";
import SearchBookCard from "@/components/SearchBookCard";
import SearchPagination from "@/components/SearchPagination";
import SearchNotFound from "@/components/SearchNotFound";

interface SearchPageProps {
  searchParams: Promise<{
    query?: string;
    genre?: string;
    page?: string;
    sort?: string;
  }>;
}

const SearchPage = async ({ searchParams }: SearchPageProps) => {
  const resolvedParams = await searchParams;
  const query = resolvedParams.query || "";
  const genre = resolvedParams.genre || "";
  const page = Number(resolvedParams.page) || 1;
  const sort = resolvedParams.sort || "latest";

  const result = await getAllBooks({
    query,
    genre,
    page,
    limit: 12,
    sort,
  });

  const { books = [], totalPages = 1, genres = [] } = result.data || {};

  return (
    <div className="flex flex-col gap-12 sm:gap-16 pb-16">
      {/* Hero Search Section */}
      <section className="flex flex-col items-center justify-center pt-4 sm:pt-8">
        <p className="text-xs sm:text-sm font-semibold tracking-widest text-light-100 uppercase text-center mb-3">
          DISCOVER YOUR NEXT GREAT READ:
        </p>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white text-center leading-tight max-w-2xl">
          Explore and Search for{" "}
          <span className="text-primary font-bold">Any Book</span> In Our Library
        </h1>

        <div className="w-full max-w-xl mt-8">
          <SearchInput />
        </div>
      </section>

      {/* Results Header & Grid Section */}
      <section className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-light-100/10 pb-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            {query.trim() ? (
              <>
                Search Result for <span className="text-primary font-semibold">{query}</span>
              </>
            ) : (
              "Search Results"
            )}
          </h2>

          <SearchFilter genres={genres} selectedGenre={genre} />
        </div>

        {/* Book Grid or Not Found */}
        {books.length > 0 ? (
          <>
            <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 sm:gap-8">
              {books.map((book) => (
                <SearchBookCard
                  key={book.id}
                  id={book.id}
                  title={book.title}
                  author={book.author}
                  genre={book.genre}
                  coverColor={book.coverColor}
                  coverUrl={book.coverUrl}
                />
              ))}
            </div>

            <SearchPagination currentPage={page} totalPages={totalPages} />
          </>
        ) : (
          <SearchNotFound />
        )}
      </section>
    </div>
  );
};

export default SearchPage;
