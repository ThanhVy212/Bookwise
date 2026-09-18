import StudentCardSkeleton from "@/components/skeletons/StudentCardSkeleton";
import BorrowedBookCardSkeleton from "@/components/skeletons/BorrowedBookCardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

const ProfileLoading = () => {
  return (
    <div className="flex flex-col lg:flex-row items-start gap-10 lg:gap-14">
      <div className="w-full lg:w-auto shrink-0 flex justify-center lg:justify-start">
        <StudentCardSkeleton />
      </div>

      <div className="flex-1 w-full">
        <Skeleton className="h-9 w-40 rounded mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <BorrowedBookCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileLoading;
