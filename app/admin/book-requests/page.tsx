import React from "react";
import Image from "next/image";
import Link from "next/link";
import { getAllBorrowRecords } from "@/lib/actions/admin.actions";
import { getInitials } from "@/lib/utils";
import BorrowStatusDropdown from "@/components/admin/BorrowStatusDropdown";
import BookReceiptModal from "@/components/admin/BookReceiptModalAdmin";
import BookCover from "@/components/BookCover";
import { ArrowUpDown } from "lucide-react";

const BorrowRequestsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const query = params.query || "";
  const sort = params.sort || "oldest";

  const result = await getAllBorrowRecords({ page, limit: 10, query, sort });

  if (!result.success) {
    return (
      <section className="w-full rounded-2xl bg-white p-7 shadow-2xs">
        <p className="text-red-500">Failed to load borrow records</p>
      </section>
    );
  }

  const { records, totalRecords, totalPages, currentPage } = result.data;
  const nextSort = sort === "oldest" ? "newest" : "oldest";

  return (
    <section className="w-full rounded-2xl bg-white p-7 shadow-2xs">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-dark-400">Borrow Book Requests</h2>
        <Link
          href={`/admin/book-requests?sort=${nextSort}&page=1${query ? `&query=${query}` : ""}`}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <span>{sort === "oldest" ? "Oldest to Recent" : "Recent to Oldest"}</span>
          <ArrowUpDown className="size-3.5 text-slate-400" />
        </Link>
      </div>

      <div className="mt-7 w-full overflow-x-auto min-h-[380px] pb-28">
        <table className="w-full min-w-[950px] table-fixed">
          <colgroup>
            <col className="w-[25%]" />
            <col className="w-[23%]" />
            <col className="w-[14%]" />
            <col className="w-[11%]" />
            <col className="w-[11%]" />
            <col className="w-[11%]" />
            <col className="w-[11%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-slate-100">
              <th className="pb-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Book
              </th>
              <th className="pb-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                User Requested
              </th>
              <th className="pb-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Status
              </th>
              <th className="pb-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Borrowed date
              </th>
              <th className="pb-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Return date
              </th>
              <th className="pb-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Due Date
              </th>
              <th className="pb-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Receipt
              </th>
            </tr>
          </thead>
          <tbody>
            {records.map((record: any) => {
              const isOverdue =
                record.status === "BORROWED" &&
                new Date(record.dueDate) < new Date();

              return (
                <tr
                  key={record.id}
                  className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors"
                >
                  <td className="py-4">
                    <Link
                      href={`/admin/books/${record.book.id || record.bookId}`}
                      className="flex items-center gap-3 group"
                    >
                      <BookCover
                        variant="extraSmall"
                        coverColor={record.book.coverColor}
                        coverUrl={record.book.coverUrl}
                      />
                      <span className="font-semibold text-dark-400 line-clamp-1 max-w-[200px] text-sm group-hover:text-primary-admin transition-colors">
                        {record.book.title}
                      </span>
                    </Link>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-900">
                        {getInitials(record.user.fullName)}
                      </div>
                      <div>
                        <p className="font-semibold text-dark-400 text-sm">
                          {record.user.fullName}
                        </p>
                        <p className="text-xs text-slate-400">
                          {record.user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <BorrowStatusDropdown
                      recordId={record.id}
                      currentStatus={record.status}
                      isOverdue={isOverdue}
                    />
                  </td>
                  <td className="py-4 text-sm text-slate-500">
                    {new Date(record.borrowDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "2-digit",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-4 text-sm text-slate-500">
                    {record.returnDate
                      ? new Date(record.returnDate).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "2-digit",
                            year: "numeric",
                          },
                        )
                      : "-"}
                  </td>
                  <td className="py-4 text-sm text-slate-500">
                    {new Date(record.dueDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "2-digit",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-4">
                    <div className="flex justify-end">
                      <BookReceiptModal record={record} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {records.length === 0 && (
        <div className="mt-10 flex flex-col items-center justify-center py-16">
          <Image
            src="/icons/admin/empty-state.svg"
            alt="empty"
            width={80}
            height={80}
            className="opacity-50"
          />
          <p className="mt-4 text-lg font-semibold text-dark-400">
            No Borrow Records
          </p>
          <p className="text-sm text-slate-500">
            There are no borrow records to display.
          </p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-7 flex items-center justify-end gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (pageNum) => (
              <a
                key={pageNum}
                href={`/admin/book-requests?page=${pageNum}${sort ? `&sort=${sort}` : ""}${query ? `&query=${query}` : ""}`}
                className={`flex size-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  pageNum === currentPage
                    ? "bg-primary-admin text-white"
                    : "bg-light-300 text-dark-400 hover:bg-light-400"
                }`}
              >
                {pageNum}
              </a>
            ),
          )}
        </div>
      )}
    </section>
  );
};

export default BorrowRequestsPage;
