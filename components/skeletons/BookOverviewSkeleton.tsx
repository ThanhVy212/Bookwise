import { Skeleton } from "@/components/ui/skeleton";

const BookOverviewSkeleton = () => {
  return (
    <section className="flex flex-col-reverse items-center justify-between gap-12 lg:flex-row lg:items-start lg:gap-16">
      <div className="flex flex-1 flex-col gap-5">
        <Skeleton className="h-16 w-full max-w-lg rounded sm:h-20 lg:h-24" />
        <div className="flex gap-4">
          <Skeleton className="h-5 w-32 rounded" />
          <Skeleton className="h-5 w-28 rounded" />
          <Skeleton className="h-5 w-16 rounded" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-5 w-36 rounded" />
          <Skeleton className="h-5 w-40 rounded" />
        </div>
        <div className="space-y-2 mt-2">
          <Skeleton className="h-5 w-full rounded" />
          <Skeleton className="h-5 w-full rounded" />
          <Skeleton className="h-5 w-3/4 rounded" />
        </div>
        <Skeleton className="mt-4 h-14 w-48 rounded-xl" />
      </div>
      <div className="relative flex flex-1 items-center justify-center pt-6 lg:pt-0">
        <Skeleton className="book-cover_wide rounded-lg" />
      </div>
    </section>
  );
};

export default BookOverviewSkeleton;
