import { Skeleton } from "@/components/ui/skeleton";

const StudentCardSkeleton = () => {
  return (
    <div className="relative w-full max-w-[420px]">
      <div className="relative mx-auto -mb-3 flex h-7 w-12 items-center justify-center rounded-t-lg bg-[#2D3348]">
        <div className="h-2 w-5 rounded-full bg-dark-100/90" />
      </div>

      <div className="relative flex flex-col gap-6 rounded-3xl bg-[#171B26] p-7 sm:p-8 border border-light-100/10">
        <div className="flex items-center gap-5">
          <Skeleton className="size-20 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-7 w-40 rounded" />
            <Skeleton className="h-4 w-48 rounded" />
          </div>
        </div>

        <div>
          <Skeleton className="h-3 w-20 rounded mb-1" />
          <Skeleton className="h-6 w-36 rounded" />
        </div>

        <div>
          <Skeleton className="h-3 w-20 rounded mb-1" />
          <Skeleton className="h-8 w-32 rounded" />
        </div>

        <div className="h-48 w-full rounded-2xl" />
      </div>
    </div>
  );
};

export default StudentCardSkeleton;
