import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getAllBooks } from "@/lib/actions/book.actions";
import BookActions from "@/components/admin/BookActions";
import BookCover from "@/components/BookCover";
import AdminSearch from "@/components/admin/AdminSearch";
import { Heart } from "lucide-react";

const BooksPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const params = await searchParams;
  const page = Math.max(1, Math.floor(Number(params.page) || 1));
  const query = params.query || "";
  const sort = params.sort || "latest";

  const result = await getAllBooks({ page, limit: 10, query, sort });

  if (!result.success) {
    return (
      <section className="w-full rounded-2xl bg-white p-4 sm:p-7 shadow-xs">
        <p className="text-red-500">Failed to load books</p>
      </section>
    );
  }

  const { books, totalBooks, totalPages, currentPage } = result.data;

  return (
    <section className="w-full rounded-2xl bg-white p-4 sm:p-7 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-dark-400">All Books</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Total {totalBooks} books in library collection
          </p>
        </div>

        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
          <AdminSearch
            placeholder="Search by title, author, genre..."
            className="w-full sm:w-64 lg:w-80"
          />

          <Button className="admin-btn" asChild>
            <Link href="/admin/books/new" className="flex items-center gap-2 text-white">
              <span>+</span> Create a New Book
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-7 w-full overflow-x-auto">
        <table className="w-full min-w-[750px]">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="pb-4 text-left text-sm font-medium text-slate-500">
                Book Title
              </th>
              <th className="pb-4 text-left text-sm font-medium text-slate-500">
                Author
              </th>
              <th className="pb-4 text-left text-sm font-medium text-slate-500">
                Genre
              </th>
              <th className="pb-4 text-center text-sm font-medium text-slate-500">
                Copies (Avail / Total)
              </th>
              <th className="pb-4 text-center text-sm font-medium text-slate-500">
                Wishlist
              </th>
              <th className="pb-4 text-left text-sm font-medium text-slate-500">
                Date Created
              </th>
              <th className="pb-4 text-right text-sm font-medium text-slate-500">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {books.length > 0 ? (
              books.map((book: any) => (
                <tr
                  key={book.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4">
                    <Link
                      href={`/admin/books/${book.id}`}
                      className="flex items-center gap-3 group max-w-xs"
                    >
                      <BookCover
                        variant="extraSmall"
                        coverColor={book.coverColor}
                        coverUrl={book.coverUrl}
                      />
                      <span className="font-medium text-dark-400 group-hover:text-primary-admin transition-colors line-clamp-2">
                        {book.title}
                      </span>
                    </Link>
                  </td>
                  <td className="py-4 text-sm text-slate-500">{book.author}</td>
                  <td className="py-4 text-sm text-slate-500">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                      {book.genre}
                    </span>
                  </td>
                  <td className="py-4 text-center text-sm font-medium">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        book.availableCopies > 0
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-rose-50 text-rose-600"
                      }`}
                    >
                      {book.availableCopies} / {book.totalCopies}
                    </span>
                  </td>
                  <td className="py-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-600">
                      <Heart className="size-3 fill-rose-500 text-rose-500" />
                      {book.wishlistCount || 0}
                    </span>
                  </td>
                  <td className="py-4 text-sm text-slate-500">
                    {new Date(book.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "2-digit",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/books/${book.id}/edit`}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit book"
                      >
                        <Image
                          src="/icons/admin/edit.svg"
                          alt="edit"
                          width={18}
                          height={18}
                        />
                      </Link>
                      <BookActions bookId={book.id} bookTitle={book.title} />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  No books found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-[11px] text-slate-400 md:hidden">
        Scroll horizontally to see all columns
      </p>

      {totalPages > 1 && (
        <div className="mt-7 flex items-center justify-end gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (pageNum) => (
              <a
                key={pageNum}
                href={`/admin/books?${new URLSearchParams({ page: String(pageNum), ...(query && { query }), ...(sort && { sort }) }).toString()}`}
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

export default BooksPage;

