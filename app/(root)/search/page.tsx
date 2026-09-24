import React from "react";
import Image from "next/image";
import { getAllBooks, getUserWishlistBookIds } from "@/lib/actions/book.actions";
import { auth } from "@/auth";
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
    availableOnly?: string;
  }>;
}

const SearchPage = async ({ searchParams }: SearchPageProps) => {
  const session = await auth();
  const resolvedParams = await searchParams;
  const query = resolvedParams.query || "";
  const genre = resolvedParams.genre || "";
  const sort = resolvedParams.sort || "latest";
  const availableOnly = resolvedParams.availableOnly === "true";

  const parsedPage = Number(resolvedParams.page);
  const requestedPage = Number.isInteger(parsedPage) && parsedPage >= 1 ? parsedPage : 1;

  const [result, wishlistResult] = await Promise.all([
    getAllBooks({
      query,
      genre,
      page: requestedPage,
      limit: 12,
      sort,
      availableOnly,
    }),
    session?.user?.id ? getUserWishlistBookIds() : Promise.resolve({ success: true, data: [] as string[] }),
  ]);

  const wishlistBookIds = wishlistResult.data || [];

  if (!result.success) {
    return (
      <div className="flex flex-col gap-12 sm:gap-16 pb-16">
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
        <section className="flex flex-col items-center justify-center rounded-3xl bg-dark-300/40 p-16 text-center border border-light-100/5">
          <Image src="/icons/error.svg" alt="error" width={48} height={48} className="mb-4 opacity-60" />
          <h2 className="text-xl font-bold text-white">Something went wrong</h2>
          <p className="mt-2 text-sm text-light-100 max-w-sm leading-relaxed">
            We couldn&apos;t load the book catalog. Please try again later.
          </p>
        </section>
      </div>
    );
  }

  const { books = [], genres = [], ...rest } = result.data || {};
  let totalPages = rest.totalPages ?? 1;

  let page = requestedPage;
  if (page > totalPages) {
    page = totalPages;
  }

  const finalResult = page !== requestedPage
    ? await getAllBooks({ query, genre, page, limit: 12, sort, availableOnly })
    : result;

  if (!finalResult.success) {
    return (
      <div className="flex flex-col gap-12 sm:gap-16 pb-16">
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
        <section className="flex flex-col items-center justify-center rounded-3xl bg-dark-300/40 p-16 text-center border border-light-100/5">
          <Image src="/icons/error.svg" alt="error" width={48} height={48} className="mb-4 opacity-60" />
          <h2 className="text-xl font-bold text-white">Something went wrong</h2>
          <p className="mt-2 text-sm text-light-100 max-w-sm leading-relaxed">
            We couldn&apos;t load the book catalog. Please try again later.
          </p>
        </section>
      </div>
    );
  }

  const finalBooks = finalResult.data?.books ?? books;

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
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-light-100/10 pb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              {query.trim() ? (
                <>
                  Search Result for <span className="text-primary font-semibold">{query}</span>
                </>
              ) : (
                "Search Results"
              )}
            </h2>
            <p className="text-sm text-light-100/70 mt-1">
              Found {rest.totalBooks ?? finalBooks.length} books in catalog
            </p>
          </div>

          <SearchFilter
            genres={genres}
            selectedGenre={genre}
            selectedSort={sort}
            availableOnly={availableOnly}
          />
        </div>

        {/* Book Grid or Not Found */}
        {finalBooks.length > 0 ? (
          <>
            <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 sm:gap-8">
              {finalBooks.map((book: any) => (
                <SearchBookCard
                  key={book.id}
                  id={book.id}
                  title={book.title}
                  author={book.author}
                  genre={book.genre}
                  coverColor={book.coverColor}
                  coverUrl={book.coverUrl}
                  isWishlisted={wishlistBookIds.includes(book.id)}
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

