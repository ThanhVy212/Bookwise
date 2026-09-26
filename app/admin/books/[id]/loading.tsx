import { Skeleton } from "@/components/ui/skeleton";

const AdminBookDetailLoading = () => {
  return (
    <section className="w-full rounded-2xl bg-white p-4 sm:p-7">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <Skeleton className="h-48 w-36 rounded-lg shrink-0" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-8 w-64 rounded" />
          <Skeleton className="h-5 w-40 rounded" />
          <Skeleton className="h-5 w-32 rounded" />
          <Skeleton className="h-5 w-28 rounded" />
          <div className="space-y-2 mt-4">
            <Skeleton className="h-5 w-full rounded" />
            <Skeleton className="h-5 w-full rounded" />
            <Skeleton className="h-5 w-3/4 rounded" />
          </div>
          <div className="flex gap-3 mt-4">
            <Skeleton className="h-10 w-24 rounded-lg" />
            <Skeleton className="h-10 w-24 rounded-lg" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminBookDetailLoading;
