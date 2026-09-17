import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getAllBooks } from "@/lib/actions/book.actions";
import BookActions from "@/components/admin/BookActions";
import BookCover from "@/components/BookCover";

const BooksPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const query = params.query || "";
  const sort = params.sort || "latest";

  const result = await getAllBooks({ page, limit: 10, query, sort });

  if (!result.success) {
    return (
      <section className="w-full rounded-2xl bg-white p-7">
        <p className="text-red-500">Failed to load books</p>
      </section>
    );
  }

  const { books, totalBooks, totalPages, currentPage } = result.data;

  return (
    <section className="w-full rounded-2xl bg-white p-7">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">All Books</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">A-Z</span>
            <Image
              src="/icons/admin/sort.svg"
              alt="sort"
              width={16}
              height={16}
            />
          </div>
          <Button className="admin-btn" asChild>
            <Link href="/admin/books/new" className="flex items-center gap-2 text-white">
              <span>+</span> Create a New Book
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-7 w-full overflow-x-auto">
        <table className="w-full min-w-[700px]">
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
              <th className="pb-4 text-left text-sm font-medium text-slate-500">
                Date Created
              </th>
              <th className="pb-4 text-right text-sm font-medium text-slate-500">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {books.map((book: any) => (
              <tr
                key={book.id}
                className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
              >
                <td className="py-4">
                  <Link
                    href={`/admin/books/${book.id}`}
                    className="flex items-center gap-3 group"
                  >
                    <BookCover
                      variant="extraSmall"
                      coverColor={book.coverColor}
                      coverUrl={book.coverUrl}
                    />
                    <span className="font-medium text-dark-400 group-hover:text-primary-admin transition-colors">
                      {book.title}
                    </span>
                  </Link>
                </td>
                <td className="py-4 text-sm text-slate-500">{book.author}</td>
                <td className="py-4 text-sm text-slate-500">{book.genre}</td>
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
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-7 flex items-center justify-end gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (pageNum) => (
              <a
                key={pageNum}
                href={`/admin/books?page=${pageNum}${query ? `&query=${query}` : ""}`}
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
