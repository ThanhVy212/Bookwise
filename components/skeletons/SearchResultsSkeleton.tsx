import { Skeleton } from "@/components/ui/skeleton";

const SearchResultsSkeleton = () => {
  return (
    <div className="flex flex-col gap-12 sm:gap-16 pb-16">
      {/* Hero Search Section */}
      <section className="flex flex-col items-center justify-center pt-4 sm:pt-8">
        <Skeleton className="h-4 w-64 rounded mb-3" />
        <Skeleton className="h-12 w-full max-w-xl rounded sm:h-14 lg:h-16" />
        <Skeleton className="mt-8 h-14 w-full max-w-xl rounded-xl" />
      </section>

      {/* Results Header & Grid Section */}
      <section className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-light-100/10 pb-4">
          <Skeleton className="h-8 w-64 rounded" />
          <Skeleton className="h-10 w-40 rounded-lg" />
        </div>

        <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 sm:gap-8">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <Skeleton className="book-cover_regular rounded-lg" />
              <Skeleton className="mt-2 h-5 w-3/4 rounded" />
              <Skeleton className="mt-1.5 h-4 w-1/2 rounded" />
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-end gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-10 rounded-lg" />
          ))}
        </div>
      </section>
    </div>
  );
};

export default SearchResultsSkeleton;
