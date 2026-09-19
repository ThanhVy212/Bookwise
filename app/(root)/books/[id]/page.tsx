import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getBookById, getSimilarBooks, checkBookBorrowEligibility } from "@/lib/actions/book.actions";
import BookCover from "@/components/BookCover";
import BorrowBook from "@/components/BorrowBook";
import BookVideo from "@/components/BookVideo";

interface Props {
  params: Promise<{ id: string }>;
}

const Page = async ({ params }: Props) => {
  const { id } = await params;
  const session = await auth();

  const bookResult = await getBookById(id);

  if (!bookResult.success) {
    if (bookResult.type === "not_found") {
      notFound();
    }
    throw new Error(bookResult.message ?? "Failed to fetch book");
  }

  const book: Book = bookResult.data;

  const similarResult = await getSimilarBooks({
    currentBookId: id,
    genre: book.genre,
    limit: 6,
  });

  const similarBooks: Book[] = similarResult.data || [];

  let alreadyBorrowed = false;
  let userStatus: string | null = null;
  if (session?.user?.id) {
    const eligibility = await checkBookBorrowEligibility({ bookId: id });
    alreadyBorrowed = eligibility.alreadyBorrowed === true;
    if (eligibility.status) {
      userStatus = eligibility.status;
    }
  }

  return (
    <div className="flex flex-col gap-16 lg:gap-24">
      {/* Top Hero / Book Overview Section */}
      <section className="flex flex-col-reverse items-center justify-between gap-12 lg:flex-row lg:items-start lg:gap-16">
        <div className="flex flex-1 flex-col gap-6">
          <h1 className="text-4xl font-bold text-white sm:text-6xl lg:text-7xl leading-tight">
            {book.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-base sm:text-lg text-light-100">
            <p>
              By <span className="font-semibold text-light-200">{book.author}</span>
            </p>
            <p>
              Category:{" "}
              <span className="font-semibold text-light-200">{book.genre}</span>
            </p>
            <div className="flex items-center gap-1.5">
              <Image src="/icons/star.svg" alt="rating" width={18} height={18} />
              <p className="font-medium text-white">{book.rating}/5</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-base sm:text-lg text-light-100">
            <p>
              Total books:{" "}
              <span className="font-semibold text-primary">{book.totalCopies}</span>
            </p>
            <p>
              Available books:{" "}
              <span className="font-semibold text-primary">
                {book.availableCopies}
              </span>
            </p>
          </div>

          <p className="text-base sm:text-lg text-light-100 leading-relaxed text-justify">
            {book.description}
          </p>

          <div className="mt-2">
            <BorrowBook
              bookId={book.id}
              userId={session?.user?.id as string}
              alreadyBorrowed={alreadyBorrowed}
              userStatus={userStatus}
            />
          </div>
        </div>


        {/* 3D Book Cover */}
        <div className="relative flex flex-1 items-center justify-center pt-6 lg:pt-0">
          <div className="relative z-10">
            <BookCover
              variant="wide"
              coverColor={book.coverColor}
              coverUrl={book.coverUrl}
            />
          </div>

          <div className="absolute top-0 right-10 sm:right-16 rotate-12 opacity-40 blur-[1px] hidden sm:block">
            <BookCover
              variant="wide"
              coverColor={book.coverColor}
              coverUrl={book.coverUrl}
            />
          </div>
        </div>
      </section>

      {/* Bottom Section: Video & Summary on Left, Similar Books on Right */}
      <section className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-16">
        {/* Left Column (Video & Summary) */}
        <div className="flex flex-col gap-10 lg:col-span-2">
          {/* Video Section */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Video</h2>
            <BookVideo videoUrl={book.videoUrl} coverUrl={book.coverUrl} />
          </div>

          {/* Summary Section */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Summary</h2>
            <div className="space-y-4 text-base sm:text-lg text-light-100 leading-relaxed text-justify">
              {book.summary
                ? book.summary.split("\n").map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))
                : <p>{book.description}</p>}
            </div>
          </div>
        </div>

        {/* Right Column (More similar books) */}
        <div className="flex flex-col lg:col-span-1">
          <h2 className="text-2xl font-bold text-white mb-6">More similar books</h2>
          
          {similarBooks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-6">
              {similarBooks.map((simBook) => (
                <Link
                  key={simBook.id}
                  href={`/books/${simBook.id}`}
                  className="flex flex-col items-center transition-transform duration-200 hover:scale-105 group"
                >
                  <BookCover
                    variant="regular"
                    coverColor={simBook.coverColor}
                    coverUrl={simBook.coverUrl}
                  />
                  <p className="mt-2 text-sm font-semibold text-white line-clamp-1 text-center group-hover:text-primary transition-colors">
                    {simBook.title}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-light-100 text-sm">No similar books found.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Page;
