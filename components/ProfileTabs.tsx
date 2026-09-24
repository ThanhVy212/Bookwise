"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import BorrowedBookCard from "@/components/BorrowedBookCard";
import WishlistedBookCard from "@/components/WishlistedBookCard";
import { BookMarked, Bookmark } from "lucide-react";

interface ProfileTabsProps {
  borrowedBooks: any[];
  wishlistedBooks: any[];
  userName: string;
  universityId: number | string;
  initialTab?: "borrowed" | "saved";
}

const ProfileTabs = ({
  borrowedBooks,
  wishlistedBooks: initialWishlistedBooks,
  userName,
  universityId,
  initialTab = "borrowed",
}: ProfileTabsProps) => {
  const [activeTab, setActiveTab] = useState<"borrowed" | "saved">(initialTab);
  const [wishlist, setWishlist] = useState<any[]>(initialWishlistedBooks);

  const handleRemoveWishlist = (bookId: string) => {
    setWishlist((prev) => prev.filter((b) => b.id !== bookId));
  };

  return (
    <div className="flex-1 w-full">
      {/* Tabs Header */}
      <div className="flex items-center gap-4 border-b border-light-100/10 pb-4 mb-8">
        <button
          type="button"
          onClick={() => setActiveTab("borrowed")}
          className={`flex items-center gap-2 pb-2 text-lg font-semibold transition-all relative cursor-pointer ${
            activeTab === "borrowed"
              ? "text-primary font-bold"
              : "text-light-100/60 hover:text-light-100"
          }`}
        >
          <BookMarked className="size-5" />
          <span>Borrowed books</span>
          <span
            className={`ml-1.5 rounded-full px-2 py-0.5 text-xs font-bold ${
              activeTab === "borrowed"
                ? "bg-primary/20 text-primary"
                : "bg-dark-300 text-light-100/60"
            }`}
          >
            {borrowedBooks.length}
          </span>
          {activeTab === "borrowed" && (
            <div className="absolute -bottom-4 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("saved")}
          className={`flex items-center gap-2 pb-2 text-lg font-semibold transition-all relative cursor-pointer ${
            activeTab === "saved"
              ? "text-primary font-bold"
              : "text-light-100/60 hover:text-light-100"
          }`}
        >
          <Bookmark className="size-5" />
          <span>Saved for later</span>
          <span
            className={`ml-1.5 rounded-full px-2 py-0.5 text-xs font-bold ${
              activeTab === "saved"
                ? "bg-primary/20 text-primary"
                : "bg-dark-300 text-light-100/60"
            }`}
          >
            {wishlist.length}
          </span>
          {activeTab === "saved" && (
            <div className="absolute -bottom-4 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>

      {/* Tab Content: Borrowed */}
      {activeTab === "borrowed" && (
        <>
          {borrowedBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {borrowedBooks.map((record: any) => (
                <BorrowedBookCard
                  key={record.id}
                  record={record}
                  userName={userName}
                  universityId={universityId}
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
        </>
      )}

      {/* Tab Content: Saved */}
      {activeTab === "saved" && (
        <>
          {wishlist.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {wishlist.map((book: any) => (
                <WishlistedBookCard
                  key={book.id}
                  book={book}
                  onRemove={handleRemoveWishlist}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-3xl bg-dark-300/40 p-12 text-center border border-light-100/5">
              <Bookmark className="size-16 text-light-100/30 mb-2" />
              <h3 className="mt-4 text-xl font-bold text-white">
                No saved books yet
              </h3>
              <p className="mt-2 text-sm text-light-100 max-w-sm leading-relaxed">
                Click the &quot;Save for Later&quot; or heart button on any book to add it
                to your personal reading list.
              </p>
              <Link
                href="/"
                className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 font-semibold text-dark-100 hover:bg-primary/90 transition-colors shadow-md"
              >
                Browse Library
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProfileTabs;
