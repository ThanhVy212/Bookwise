import { Skeleton } from "@/components/ui/skeleton";

const BookCardSkeleton = () => {
  return (
    <div className="flex flex-col items-center">
      <Skeleton className="book-cover_regular rounded-lg" />
      <Skeleton className="mt-2 h-5 w-3/4 rounded" />
      <Skeleton className="mt-1.5 h-4 w-1/2 rounded" />
    </div>
  );
};

export default BookCardSkeleton;
