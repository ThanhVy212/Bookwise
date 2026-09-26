import { Skeleton } from "@/components/ui/skeleton";

const AdminBookEditLoading = () => {
  return (
    <section className="w-full rounded-2xl bg-white p-4 sm:p-7">
      <Skeleton className="h-6 w-32 rounded mb-8" />
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <Skeleton className="h-4 w-24 rounded mb-2" />
            <Skeleton className="h-14 w-full rounded-lg" />
          </div>
          <div>
            <Skeleton className="h-4 w-24 rounded mb-2" />
            <Skeleton className="h-14 w-full rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <Skeleton className="h-4 w-24 rounded mb-2" />
            <Skeleton className="h-14 w-full rounded-lg" />
          </div>
          <div>
            <Skeleton className="h-4 w-24 rounded mb-2" />
            <Skeleton className="h-14 w-full rounded-lg" />
          </div>
        </div>
        <div>
          <Skeleton className="h-4 w-32 rounded mb-2" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
        <div>
          <Skeleton className="h-4 w-32 rounded mb-2" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
        <div>
          <Skeleton className="h-4 w-40 rounded mb-2" />
          <Skeleton className="h-14 w-full rounded-lg" />
        </div>
        <Skeleton className="h-14 w-full rounded-lg" />
      </div>
    </section>
  );
};

export default AdminBookEditLoading;
