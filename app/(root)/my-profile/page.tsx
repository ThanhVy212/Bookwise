import React from "react";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import { getUserById } from "@/lib/actions/auth.actions";
import { getUserBorrowedBooks, getUserWishlist } from "@/lib/actions/book.actions";
import StudentCard from "@/components/StudentCard";
import ResendAccountRequest from "@/components/ResendAccountRequest";
import ProfileTabs from "@/components/ProfileTabs";

const Page = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

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
  const wishlistedBooks = wishlistResult.success ? wishlistResult.data : [];

  return (
    <div className="flex flex-col lg:flex-row items-start gap-10 lg:gap-14">
      {/* Left Column: Student Profile Badge */}
      <div className="w-full lg:w-auto shrink-0 flex flex-col items-center lg:items-start">
        <StudentCard user={user} />
        {user.status === "REJECTED" && <ResendAccountRequest />}
      </div>

      {/* Right Column: Profile Tabs (Borrowed Books & Saved for Later) */}
      <ProfileTabs
        borrowedBooks={borrowedBooks}
        wishlistedBooks={wishlistedBooks}
        userName={user.fullName}
        universityId={user.universityId}
      />
    </div>
  );
};

export default Page;
