import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBookById } from "@/lib/actions/book.actions";
import BookCover from "@/components/BookCover";
import BookVideo from "@/components/BookVideo";
import { ArrowLeft, Calendar, Edit } from "lucide-react";

const AdminBookDetailsPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const result = await getBookById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const book = result.data;

  const formattedDate = book.createdAt
    ? new Date(book.createdAt).toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "2-digit",
      })
    : "N/A";

  return (
    <div className="w-full">
      <Link
        href="/admin/books"
        className="mb-6 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-dark-200 transition-colors hover:bg-slate-50"
      >
        <ArrowLeft className="size-4" />
        Go back
      </Link>

      <section className="w-full rounded-2xl bg-white p-7 sm:p-10 shadow-2xs">
        {/* Top Section: Cover + Book Info */}
        <div className="flex flex-col gap-8 md:flex-row md:items-center">
          {/* Book Cover on Colored Background */}
          <div
            className="flex items-center justify-center rounded-2xl p-8 max-md:mx-auto max-w-xs shrink-0"
            style={{
              backgroundColor: book.coverColor ? `${book.coverColor}18` : "#f3f4f6",
            }}
          >
            <BookCover
              variant="medium"
              coverColor={book.coverColor}
              coverUrl={book.coverUrl}
            />
          </div>

          {/* Book Info */}
          <div className="flex flex-1 flex-col justify-between self-stretch py-2">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <span>Created at:</span>
                <span className="inline-flex items-center gap-1 text-slate-700">
                  <Calendar className="size-3.5 text-slate-500" />
                  {formattedDate}
                </span>
              </div>

              <h1 className="mt-3 text-2xl sm:text-3xl font-bold text-dark-400">
                {book.title}
              </h1>

              <p className="mt-2 text-base font-semibold text-slate-700">
                By {book.author}
              </p>

              <p className="mt-1 text-sm font-medium text-slate-500">
                {book.genre}
              </p>
            </div>

            <div className="mt-8">
              <Link
                href={`/admin/books/${book.id}/edit`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-admin px-8 py-3.5 text-sm font-semibold text-white shadow transition-all hover:bg-primary-admin/90 max-md:w-full"
              >
                <Edit className="size-4" />
                Edit Book
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section: Summary + Video */}
        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* Summary / Description */}
          <div>
            <h2 className="text-lg font-bold text-dark-400">Summary</h2>
            <div className="mt-4 space-y-4 text-sm sm:text-base leading-relaxed text-slate-600 text-justify">
              {book.summary ? (
                <p>{book.summary}</p>
              ) : null}
              {book.description && book.description !== book.summary ? (
                <p>{book.description}</p>
              ) : null}
              {!book.summary && !book.description && (
                <p className="text-slate-400 italic">No summary available for this book.</p>
              )}
            </div>
          </div>

          {/* Video */}
          <div>
            <h2 className="text-lg font-bold text-dark-400">Video</h2>
            <div className="mt-4">
              <BookVideo videoUrl={book.videoUrl} coverUrl={book.coverUrl} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminBookDetailsPage;
