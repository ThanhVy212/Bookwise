import React from "react";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import { getUserById } from "@/lib/actions/auth.actions";
import { getUserBorrowedBooks, getUserWishlist } from "@/lib/actions/book.actions";
import StudentCard from "@/components/StudentCard";
import BorrowedBookCard from "@/components/BorrowedBookCard";
import WishlistedBookCard from "@/components/WishlistedBookCard";
import ResendAccountRequest from "@/components/ResendAccountRequest";
import Link from "next/link";
import Image from "next/image";
import { BookMarked, Heart } from "lucide-react";

interface ProfilePageProps {
  searchParams?: Promise<{ tab?: string }>;
}

const Page = async ({ searchParams }: ProfilePageProps) => {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const resolvedParams = searchParams ? await searchParams : {};
  const activeTab = resolvedParams.tab === "wishlist" ? "wishlist" : "borrowed";

  const [userResult, borrowedResult, wishlistResult] = await Promise.all([
    getUserById(session.user.id),
    getUserBorrowedBooks(session.user.id),
    getUserWishlist(),
  ]);

  if (!userResult.success) {
    notFound();
  }

  const user = userResult.data;
  const borrowedBooks = borrowedResult.success ? borrowedResult.data : [];
  const wishlistBooks = wishlistResult.success ? wishlistResult.data : [];

  return (
    <div className="flex flex-col lg:flex-row items-start gap-10 lg:gap-14">
      {/* Left Column: Student Profile Badge */}
      <div className="w-full lg:w-auto shrink-0 flex flex-col items-center lg:items-start">
        <StudentCard user={user} />
        {user.status === "REJECTED" && <ResendAccountRequest />}
      </div>

      {/* Right Column: Tabbed Content */}
      <div className="flex-1 w-full">
        {/* Profile Tabs */}
        <div className="flex items-center gap-3 border-b border-light-100/10 pb-4 mb-8">
          <Link
            href="/my-profile?tab=borrowed"
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              activeTab === "borrowed"
                ? "bg-primary text-dark-100 shadow-md"
                : "bg-dark-300/60 text-light-100 hover:text-white hover:bg-dark-300"
            }`}
          >
            <BookMarked className="size-4" />
            <span>Borrowed Books ({borrowedBooks.length})</span>
          </Link>

          <Link
            href="/my-profile?tab=wishlist"
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              activeTab === "wishlist"
                ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                : "bg-dark-300/60 text-light-100 hover:text-white hover:bg-dark-300"
            }`}
          >
            <Heart className={`size-4 ${activeTab === "wishlist" ? "fill-white" : ""}`} />
            <span>Saved for Later ({wishlistBooks.length})</span>
          </Link>
        </div>

        {/* Tab 1: Borrowed Books */}
        {activeTab === "borrowed" && (
          <div>
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
        )}

        {/* Tab 2: Wishlist / Saved Books */}
        {activeTab === "wishlist" && (
          <div>
            {wishlistBooks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {wishlistBooks.map((book: any) => (
                  <WishlistedBookCard key={book.id} book={book} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-3xl bg-dark-300/40 p-12 text-center border border-light-100/5">
                <div className="size-20 rounded-full bg-rose-500/10 flex items-center justify-center mb-4">
                  <Heart className="size-10 text-rose-400" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  Your reading list is empty
                </h3>
                <p className="mt-2 text-sm text-light-100 max-w-sm leading-relaxed">
                  Click the heart icon on any book to save it to your wishlist and read later!
                </p>
                <Link
                  href="/search"
                  className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 font-semibold text-dark-100 hover:bg-primary/90 transition-colors shadow-md"
                >
                  Discover Books
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;

