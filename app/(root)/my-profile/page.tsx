import React from "react";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import { getUserById } from "@/lib/actions/auth.actions";
import { getUserBorrowedBooks } from "@/lib/actions/book.actions";
import StudentCard from "@/components/StudentCard";
import BorrowedBookCard from "@/components/BorrowedBookCard";
import Link from "next/link";
import Image from "next/image";

const Page = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const [userResult, borrowedResult] = await Promise.all([
    getUserById(session.user.id),
    getUserBorrowedBooks(session.user.id),
  ]);

  if (!userResult.success) {
    notFound();
  }

  const user = userResult.data;

  const borrowedBooks = borrowedResult.success ? borrowedResult.data : [];

  return (
    <div className="flex flex-col lg:flex-row items-start gap-10 lg:gap-14">
      {/* Left Column: Student Profile Badge */}
      <div className="w-full lg:w-auto shrink-0 flex justify-center lg:justify-start">
        <StudentCard user={user} />
      </div>

      {/* Right Column: Borrowed Books */}
      <div className="flex-1 w-full">
        <h1 className="text-3xl font-bold text-white mb-8">Borrowed books</h1>

        {borrowedBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {borrowedBooks.map((record: any) => (
              <BorrowedBookCard
                key={record.id}
                record={record}
                userName={user.fullName}
                universityId={user.universityId}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl bg-dark-300/40 p-12 text-center border border-light-100/5">
            <Image
              src="/images/no-books.png"
              alt="no books"
              width={180}
              height={180}
              className="opacity-60"
            />
            <h3 className="mt-6 text-xl font-bold text-white">
              No borrowed books yet
            </h3>
            <p className="mt-2 text-sm text-light-100 max-w-sm leading-relaxed">
              Explore our collection of books and start borrowing your favorite
              titles today!
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 font-semibold text-dark-100 hover:bg-primary/90 transition-colors shadow-md"
            >
              Browse Library
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
