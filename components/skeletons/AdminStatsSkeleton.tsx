import { Skeleton } from "@/components/ui/skeleton";

const AdminStatsSkeleton = () => {
  return (
    <div className="w-full space-y-8">
      {/* 3 Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-white p-6 shadow-2xs">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="mt-4 h-9 w-20 rounded" />
          </div>
        ))}
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        {/* Borrow Requests */}
        <div className="rounded-2xl bg-white p-6 sm:p-7 shadow-2xs">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-36 rounded" />
            <Skeleton className="h-7 w-16 rounded-lg" />
          </div>
          <div className="mt-5 flex flex-col gap-3.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3.5 rounded-xl bg-light-300 p-3.5">
                <Skeleton className="h-10 w-8 rounded" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="mt-1 h-3 w-1/2 rounded" />
                  <Skeleton className="mt-2 h-3 w-1/3 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recently Added Books */}
        <div className="rounded-2xl bg-white p-6 sm:p-7 shadow-2xs">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-44 rounded" />
            <Skeleton className="h-7 w-16 rounded-lg" />
          </div>
          <Skeleton className="mt-5 h-12 w-full rounded-xl" />
          <div className="mt-3.5 flex flex-col gap-3.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3.5 rounded-xl bg-light-300 p-3.5">
                <Skeleton className="h-10 w-8 rounded" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="mt-1 h-3 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Account Requests */}
      <div className="rounded-2xl bg-white p-6 sm:p-7 shadow-2xs">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-36 rounded" />
          <Skeleton className="h-7 w-16 rounded-lg" />
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center rounded-xl bg-light-300 p-4">
              <Skeleton className="size-12 rounded-full" />
              <Skeleton className="mt-3 h-3 w-20 rounded" />
              <Skeleton className="mt-1 h-3 w-24 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminStatsSkeleton;
