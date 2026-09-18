import { Skeleton } from "@/components/ui/skeleton";

const BookDetailSkeleton = () => {
  return (
    <div className="flex flex-col gap-16 lg:gap-24">
      {/* Top Hero / Book Overview Section */}
      <section className="flex flex-col-reverse items-center justify-between gap-12 lg:flex-row lg:items-start lg:gap-16">
        <div className="flex flex-1 flex-col gap-6">
          <Skeleton className="h-16 w-full max-w-lg rounded sm:h-20 lg:h-24" />
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Skeleton className="h-5 w-32 rounded" />
            <Skeleton className="h-5 w-28 rounded" />
            <Skeleton className="h-5 w-16 rounded" />
          </div>
          <div className="flex flex-wrap gap-6">
            <Skeleton className="h-5 w-36 rounded" />
            <Skeleton className="h-5 w-40 rounded" />
          </div>
          <div className="space-y-2 mt-2">
            <Skeleton className="h-5 w-full rounded" />
            <Skeleton className="h-5 w-full rounded" />
            <Skeleton className="h-5 w-3/4 rounded" />
          </div>
          <Skeleton className="mt-2 h-14 w-48 rounded-xl" />
        </div>

        <div className="relative flex flex-1 items-center justify-center pt-6 lg:pt-0">
          <Skeleton className="book-cover_wide rounded-lg" />
          <div className="absolute top-0 right-10 sm:right-16 rotate-12 opacity-40 hidden sm:block">
            <Skeleton className="book-cover_wide rounded-lg" />
          </div>
        </div>
      </section>

      {/* Bottom Section: Video & Summary on Left, Similar Books on Right */}
      <section className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-16">
        <div className="flex flex-col gap-10 lg:col-span-2">
          {/* Video Section */}
          <div>
            <Skeleton className="h-7 w-20 rounded mb-4" />
            <Skeleton className="h-64 w-full rounded-2xl lg:h-80" />
          </div>

          {/* Summary Section */}
          <div>
            <Skeleton className="h-7 w-24 rounded mb-4" />
            <div className="space-y-3">
              <Skeleton className="h-5 w-full rounded" />
              <Skeleton className="h-5 w-full rounded" />
              <Skeleton className="h-5 w-full rounded" />
              <Skeleton className="h-5 w-5/6 rounded" />
              <Skeleton className="h-5 w-full rounded" />
              <Skeleton className="h-5 w-2/3 rounded" />
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:col-span-1">
          <Skeleton className="h-7 w-48 rounded mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <Skeleton className="book-cover_regular rounded-lg" />
                <Skeleton className="mt-2 h-4 w-3/4 rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default BookDetailSkeleton;
