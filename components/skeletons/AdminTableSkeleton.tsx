import { Skeleton } from "@/components/ui/skeleton";

interface AdminTableSkeletonProps {
  columns: number;
  rows?: number;
  hasHeader?: boolean;
}

const AdminTableSkeleton = ({
  columns,
  rows = 5,
  hasHeader = true,
}: AdminTableSkeletonProps) => {
  return (
    <section className="w-full rounded-2xl bg-white p-7">
      {hasHeader && (
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40 rounded" />
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
      )}

      <div className="mt-7 w-full overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="pb-4 text-left">
                  <Skeleton className="h-4 w-24 rounded" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-gray-50"
              >
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="py-4">
                    {colIndex === 0 ? (
                      <div className="flex items-center gap-3">
                        <Skeleton className="size-10 rounded-full" />
                        <div>
                          <Skeleton className="h-4 w-28 rounded" />
                          <Skeleton className="mt-1 h-3 w-36 rounded" />
                        </div>
                      </div>
                    ) : colIndex === columns - 1 ? (
                      <div className="flex justify-end gap-2">
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <Skeleton className="h-8 w-8 rounded-lg" />
                      </div>
                    ) : (
                      <Skeleton className="h-4 w-20 rounded" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-7 flex items-center justify-end gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="size-10 rounded-lg" />
        ))}
      </div>
    </section>
  );
};

export default AdminTableSkeleton;
