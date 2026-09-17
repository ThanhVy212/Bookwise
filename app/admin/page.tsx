import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  getAdminStats,
  getRecentBorrowRequests,
  getRecentlyAddedBooks,
  getAccountRequests,
} from "@/lib/actions/admin.actions";
import { getInitials } from "@/lib/utils";
import BookCover from "@/components/BookCover";
import { Calendar, Eye, Plus } from "lucide-react";

const AdminDashboard = async () => {
  const stats = await getAdminStats();
  const borrowRequests = await getRecentBorrowRequests(3);
  const recentBooks = await getRecentlyAddedBooks(6);
  const accountRequests = await getAccountRequests();

  const statsData = stats.success ? stats.data : null;

  return (
    <div className="w-full space-y-8">
      {/* 3 Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {/* Borrowed Books */}
        <div className="rounded-2xl bg-white p-6 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              Borrowed Books
            </span>
          </div>
          <p className="mt-4 text-3xl font-bold text-dark-400">
            {statsData?.borrowedBooks || 0}
          </p>
        </div>

        {/* Total Users */}
        <div className="rounded-2xl bg-white p-6 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              Total Users
            </span>
          </div>
          <p className="mt-4 text-3xl font-bold text-dark-400">
            {statsData?.totalUsers || 0}
          </p>
        </div>

        {/* Total Books */}
        <div className="rounded-2xl bg-white p-6 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              Total Books
            </span>
          </div>
          <p className="mt-4 text-3xl font-bold text-dark-400">
            {statsData?.totalBooks || 0}
          </p>
        </div>
      </div>

      {/* Middle Section: Borrow Requests + Recently Added Books */}
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        {/* Borrow Requests */}
        <div className="rounded-2xl bg-white p-6 sm:p-7 shadow-2xs">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-dark-400">Borrow Requests</h3>
            <Link
              href="/admin/book-requests"
              className="rounded-lg bg-light-300 px-3 py-1.5 text-xs font-semibold text-primary-admin transition-colors hover:bg-light-400"
            >
              View all
            </Link>
          </div>

          {borrowRequests.success && borrowRequests.data.length > 0 ? (
            <div className="mt-5 flex flex-col gap-3.5">
              {borrowRequests.data.map((request: any) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between gap-4 rounded-xl bg-light-300 p-3.5 transition-colors hover:bg-light-400/70"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <BookCover
                      variant="extraSmall"
                      coverColor={request.book.coverColor}
                      coverUrl={request.book.coverUrl}
                    />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-dark-400">
                        {request.book.title}
                      </p>
                      <p className="truncate text-xs text-slate-500 mt-0.5">
                        By {request.book.author} • {request.book.genre}
                      </p>
                      <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                        <span className="font-semibold text-dark-200 truncate">
                          {request.user.fullName}
                        </span>
                        <span className="inline-flex items-center gap-1 text-slate-400">
                          <Calendar className="size-3 text-slate-400" />
                          {new Date(request.borrowDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "2-digit",
                              day: "2-digit",
                              year: "2-digit",
                            },
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/admin/books/${request.book.id || request.bookId}`}
                    className="flex size-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 transition-colors hover:text-primary-admin hover:border-primary-admin"
                    title="View Book Details"
                  >
                    <Eye className="size-4" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 flex flex-col items-center justify-center rounded-xl bg-light-300 py-12 text-center">
              <p className="text-sm font-semibold text-dark-400">
                No Pending Book Requests
              </p>
              <p className="mt-1 text-xs text-slate-500">
                There are no borrow book requests awaiting your review.
              </p>
            </div>
          )}
        </div>

        {/* Recently Added Books */}
        <div className="rounded-2xl bg-white p-6 sm:p-7 shadow-2xs">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-dark-400">
              Recently Added Books
            </h3>
            <Link
              href="/admin/books"
              className="rounded-lg bg-light-300 px-3 py-1.5 text-xs font-semibold text-primary-admin transition-colors hover:bg-light-400"
            >
              View all
            </Link>
          </div>

          <Link
            href="/admin/books/new"
            className="mt-5 flex items-center gap-3 rounded-xl bg-light-300 p-3.5 font-bold text-dark-400 transition-colors hover:bg-light-400/70"
          >
            <div className="flex size-9 items-center justify-center rounded-full bg-white text-slate-700 shadow-2xs">
              <Plus className="size-5" />
            </div>
            <span className="text-sm">Add New Book</span>
          </Link>

          {recentBooks.success && recentBooks.data.length > 0 ? (
            <div className="mt-3.5 flex flex-col gap-3.5">
              {recentBooks.data.map((book: any) => (
                <Link
                  href={`/admin/books/${book.id}`}
                  key={book.id}
                  className="flex items-center gap-3.5 rounded-xl bg-light-300 p-3.5 transition-colors hover:bg-light-400/70"
                >
                  <BookCover
                    variant="extraSmall"
                    coverColor={book.coverColor}
                    coverUrl={book.coverUrl}
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-dark-400">
                      {book.title}
                    </p>
                    <p className="truncate text-xs text-slate-500 mt-0.5">
                      By {book.author} • {book.genre}
                    </p>
                    <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                      <Calendar className="size-3 text-slate-400" />
                      <span>
                        {new Date(book.createdAt).toLocaleDateString("en-US", {
                          month: "2-digit",
                          day: "2-digit",
                          year: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* Bottom Section: Account Requests */}
      <div className="rounded-2xl bg-white p-6 sm:p-7 shadow-2xs">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-dark-400">Account Requests</h3>
          <Link
            href="/admin/account-requests"
            className="rounded-lg bg-light-300 px-3 py-1.5 text-xs font-semibold text-primary-admin transition-colors hover:bg-light-400"
          >
            View all
          </Link>
        </div>

        {accountRequests.success && accountRequests.data.length > 0 ? (
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            {accountRequests.data.slice(0, 6).map((user: any, index: number) => {
              const bgColors = [
                "bg-emerald-100 text-emerald-800",
                "bg-blue-100 text-blue-800",
                "bg-amber-100 text-amber-800",
                "bg-rose-100 text-rose-800",
                "bg-purple-100 text-purple-800",
                "bg-indigo-100 text-indigo-800",
              ];
              const colorClass = bgColors[index % bgColors.length];

              return (
                <div
                  key={user.id}
                  className="flex flex-col items-center justify-center rounded-xl bg-light-300 p-4 text-center transition-colors hover:bg-light-400/70"
                >
                  <div
                    className={`flex size-12 items-center justify-center rounded-full text-sm font-bold ${colorClass}`}
                  >
                    {getInitials(user.fullName)}
                  </div>
                  <p className="mt-3 w-full truncate text-xs font-bold text-dark-400">
                    {user.fullName}
                  </p>
                  <p className="w-full truncate text-[11px] text-slate-400 mt-0.5">
                    {user.email}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-5 flex flex-col items-center justify-center rounded-xl bg-light-300 py-12 text-center">
            <p className="text-sm font-semibold text-dark-400">
              No Pending Account Requests
            </p>
            <p className="mt-1 text-xs text-slate-500">
              There are currently no account requests awaiting approval.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
