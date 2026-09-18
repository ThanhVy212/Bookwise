import { Skeleton } from "@/components/ui/skeleton";

const BorrowedBookCardSkeleton = () => {
  return (
    <div className="borrowed-book">
      <div className="flex flex-col items-center">
        <Skeleton className="book-cover_medium rounded-lg mb-4" />
        <Skeleton className="h-5 w-32 rounded" />
        <Skeleton className="mt-1 h-4 w-24 rounded" />
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-16 rounded" />
          <Skeleton className="h-4 w-20 rounded" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20 rounded" />
          <Skeleton className="h-4 w-20 rounded" />
        </div>
      </div>

      <Skeleton className="mt-4 h-10 w-full rounded-lg" />
    </div>
  );
};

export default BorrowedBookCardSkeleton;
