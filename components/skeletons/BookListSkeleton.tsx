import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import BookCardSkeleton from "./BookCardSkeleton";

interface BookListSkeletonProps {
  count?: number;
  showTitle?: boolean;
  className?: string;
}

const BookListSkeleton = ({ count = 6, showTitle = true, className }: BookListSkeletonProps) => {
  return (
    <div className={cn(className)}>
      {showTitle && <Skeleton className="h-8 w-40 rounded mb-10" />}
      <div className="book-list">
        {Array.from({ length: count }).map((_, i) => (
          <BookCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};

export default BookListSkeleton;
