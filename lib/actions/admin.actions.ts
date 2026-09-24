"use server";

import { db } from "@/database/drizzle";
import { books, borrowRecords, users, reviews } from "@/database/schema";
import { auth } from "@/auth";
import { and, asc, desc, eq, ilike, or, sql, count } from "drizzle-orm";
import { sendEmail } from "@/lib/workflow";
import {
  approvalEmail,
  rejectionEmail,
  returnConfirmationEmail,
  receiptEmail,
} from "@/lib/email-templates";


export const getAllUsers = async ({
  query = "",
  page = 1,
  limit = 10,
}: {
  query?: string;
  page?: number;
  limit?: number;
} = {}) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const [actingUser] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (actingUser?.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const conditions = [];

    if (query && query.trim()) {
      const searchPattern = `%${query.trim().toLowerCase()}%`;
      conditions.push(
        or(
          ilike(users.fullName, searchPattern),
          ilike(users.email, searchPattern),
          sql`CAST(${users.universityId} AS TEXT) ILIKE ${searchPattern}`,
        ),
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(whereClause);

    const totalUsers = Number(countResult?.count || 0);
    const totalPages = Math.max(1, Math.ceil(totalUsers / limit));
    const offset = Math.max(0, (page - 1) * limit);

    const userList = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        universityId: users.universityId,
        universityCard: users.universityCard,
        avatarUrl: users.avatarUrl,
        status: users.status,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(asc(users.fullName));

    // Get borrow count for each user
    const usersWithBorrowCount = await Promise.all(
      userList.map(async (user) => {
        const [borrowCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(borrowRecords)
          .where(eq(borrowRecords.userId, user.id));

        return {
          ...user,
          booksBorrowed: Number(borrowCount?.count || 0),
        };
      }),
    );

    return {
      success: true,
      data: {
        users: JSON.parse(JSON.stringify(usersWithBorrowCount)),
        totalUsers,
        totalPages,
        currentPage: page,
      },
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      success: false,
      error: "An error occurred while fetching users",
      data: { users: [], totalUsers: 0, totalPages: 1, currentPage: 1 },
    };
  }
};

export const updateUserRole = async ({
  userId,
  role,
}: {
  userId: string;
  role: "USER" | "ADMIN";
}) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const [actingUser] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (actingUser?.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    await db.update(users).set({ role }).where(eq(users.id, userId));

    return { success: true };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { success: false, error: "Failed to update user role" };
  }
};

export const deleteUser = async (userId: string) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const [actingUser] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (actingUser?.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    // Delete borrow records and user in a single transaction
    await db.transaction(async (tx) => {
      await tx.delete(borrowRecords).where(eq(borrowRecords.userId, userId));
      await tx.delete(users).where(eq(users.id, userId));
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: "Failed to delete user" };
  }
};

export const getAccountRequests = async () => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const [actingUser] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (actingUser?.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const pendingUsers = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        universityId: users.universityId,
        universityCard: users.universityCard,
        avatarUrl: users.avatarUrl,
        status: users.status,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.status, "PENDING"))
      .orderBy(asc(users.createdAt));

    return {
      success: true,
      data: JSON.parse(JSON.stringify(pendingUsers)),
    };
  } catch (error) {
    console.error("Error fetching account requests:", error);
    return {
      success: false,
      error: "An error occurred while fetching account requests",
      data: [],
    };
  }
};

import { createNotification } from "@/lib/actions/notification.actions";

export const approveAccountRequest = async (userId: string) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const [actingUser] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (actingUser?.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const [targetUser] = await db
      .select({ email: users.email, fullName: users.fullName })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    await db
      .update(users)
      .set({ status: "APPROVED" })
      .where(eq(users.id, userId));

    if (targetUser) {
      await sendEmail({
        email: targetUser.email,
        subject: "Your BookWise Account Has Been Approved!",
        message: approvalEmail(targetUser.fullName),
      }).catch(() => {});

      await createNotification({
        userId,
        title: "Account Approved! 🎉",
        message:
          "Your BookWise student account has been approved. You can now borrow books and explore our catalog!",
        type: "ACCOUNT_APPROVED",
        link: "/",
      }).catch(() => {});
    }

    return { success: true };
  } catch (error) {
    console.error("Error approving account:", error);
    return { success: false, error: "Failed to approve account" };
  }
};

export const rejectAccountRequest = async (userId: string) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const [actingUser] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (actingUser?.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const [targetUser] = await db
      .select({ email: users.email, fullName: users.fullName })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    await db
      .update(users)
      .set({ status: "REJECTED" })
      .where(eq(users.id, userId));

    if (targetUser) {
      await sendEmail({
        email: targetUser.email,
        subject: "Your BookWise Account Was Not Approved",
        message: rejectionEmail(targetUser.fullName),
      }).catch(() => {});

      await createNotification({
        userId,
        title: "Account Request Rejected ⚠️",
        message:
          "Your account registration was not approved. Please verify your student card or contact the library.",
        type: "ACCOUNT_REJECTED",
        link: "/my-profile",
      }).catch(() => {});
    }

    return { success: true };
  } catch (error) {
    console.error("Error rejecting account:", error);
    return { success: false, error: "Failed to reject account" };
  }
};


export const getAllBorrowRecords = async ({
  query = "",
  page = 1,
  limit = 10,
  sort = "oldest",
}: {
  query?: string;
  page?: number;
  limit?: number;
  sort?: string;
} = {}) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const [actingUser] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (actingUser?.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const conditions = [];

    if (query && query.trim()) {
      const searchPattern = `%${query.trim().toLowerCase()}%`;
      conditions.push(
        or(
          ilike(books.title, searchPattern),
          ilike(users.fullName, searchPattern),
          ilike(users.email, searchPattern),
        ),
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(borrowRecords)
      .innerJoin(books, eq(borrowRecords.bookId, books.id))
      .innerJoin(users, eq(borrowRecords.userId, users.id))
      .where(whereClause);

    const totalRecords = Number(countResult?.count || 0);
    const totalPages = Math.max(1, Math.ceil(totalRecords / limit));
    const offset = Math.max(0, (page - 1) * limit);

    let orderByClause;
    if (sort === "newest") {
      orderByClause = desc(borrowRecords.borrowDate);
    } else {
      orderByClause = asc(borrowRecords.borrowDate);
    }

    const records = await db
      .select({
        id: borrowRecords.id,
        userId: borrowRecords.userId,
        bookId: borrowRecords.bookId,
        borrowDate: borrowRecords.borrowDate,
        dueDate: borrowRecords.dueDate,
        returnDate: borrowRecords.returnDate,
        status: borrowRecords.status,
        renewCount: borrowRecords.renewCount,
        createdAt: borrowRecords.createdAt,
        book: {
          id: books.id,
          title: books.title,
          author: books.author,
          genre: books.genre,
          coverUrl: books.coverUrl,
          coverColor: books.coverColor,
        },
        user: {
          id: users.id,
          fullName: users.fullName,
          email: users.email,
          universityId: users.universityId,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(borrowRecords)
      .innerJoin(books, eq(borrowRecords.bookId, books.id))
      .innerJoin(users, eq(borrowRecords.userId, users.id))
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(orderByClause);

    return {
      success: true,
      data: {
        records: JSON.parse(JSON.stringify(records)),
        totalRecords,
        totalPages,
        currentPage: page,
      },
    };
  } catch (error) {
    console.error("Error fetching borrow records:", error);
    return {
      success: false,
      error: "An error occurred while fetching borrow records",
      data: { records: [], totalRecords: 0, totalPages: 1, currentPage: 1 },
    };
  }
};

export const updateBorrowRecordStatus = async ({
  recordId,
  status,
}: {
  recordId: string;
  status: "BORROWED" | "RETURNED";
}) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const [actingUser] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (actingUser?.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const updateData: any = { status };

    if (status === "RETURNED") {
      updateData.returnDate = new Date();
    }

    // Transaction for atomic update of borrow record and book inventory
    const result = await db.transaction(async (tx) => {
      const [record] = await tx
        .select()
        .from(borrowRecords)
        .where(eq(borrowRecords.id, recordId))
        .limit(1);

      if (!record) {
        throw new Error("RECORD_NOT_FOUND");
      }

      await tx
        .update(borrowRecords)
        .set(updateData)
        .where(eq(borrowRecords.id, recordId));

      let book = null;
      let borrower = null;

      // If returning, increment available copies atomically
      if (status === "RETURNED" && record.status !== "RETURNED") {
        const [updatedBook] = await tx
          .update(books)
          .set({ availableCopies: sql`${books.availableCopies} + 1` })
          .where(eq(books.id, record.bookId))
          .returning();

        book = updatedBook;

        const [user] = await tx
          .select({ email: users.email, fullName: users.fullName })
          .from(users)
          .where(eq(users.id, record.userId))
          .limit(1);

        borrower = user;
      }

      return { record, book, borrower };
    });

    if (status === "RETURNED" && result.borrower && result.book) {
      await sendEmail({
        email: result.borrower.email,
        subject: `Thank You for Returning ${result.book.title}!`,
        message: returnConfirmationEmail(
          result.borrower.fullName,
          result.book.title,
        ),
      }).catch(() => {});

      await createNotification({
        userId: result.record.userId,
        title: "Book Returned Successfully ✅",
        message: `Thank you for returning "${result.book.title}". We hope you enjoyed reading it!`,
        type: "RETURN",
        link: "/my-profile",
      }).catch(() => {});
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error updating borrow record:", error);
    return {
      success: false,
      error: error?.message || "Failed to update borrow record",
    };
  }
};

export const getAdminStats = async () => {

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const [actingUser] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (actingUser?.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const [totalBooksResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(books);

    const [totalUsersResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);

    const [borrowedBooksResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(borrowRecords)
      .where(eq(borrowRecords.status, "BORROWED"));

    const [pendingAccountsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.status, "PENDING"));

    const [totalWishlistsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(wishlists);

    return {
      success: true,
      data: {
        totalBooks: Number(totalBooksResult?.count || 0),
        totalUsers: Number(totalUsersResult?.count || 0),
        borrowedBooks: Number(borrowedBooksResult?.count || 0),
        pendingAccounts: Number(pendingAccountsResult?.count || 0),
        totalWishlists: Number(totalWishlistsResult?.count || 0),
      },
    };
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return { success: false, error: "Failed to fetch stats" };
  }
};

export const getTopWishlistedBooks = async (limit = 5) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized", data: [] };
    }

    const [actingUser] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (actingUser?.role !== "ADMIN") {
      return { success: false, error: "Unauthorized", data: [] };
    }

    const topBooks = await db
      .select({
        id: books.id,
        title: books.title,
        author: books.author,
        genre: books.genre,
        coverUrl: books.coverUrl,
        coverColor: books.coverColor,
        totalCopies: books.totalCopies,
        availableCopies: books.availableCopies,
        wishlistCount: sql<number>`count(${wishlists.id})::int`,
      })
      .from(books)
      .innerJoin(wishlists, eq(books.id, wishlists.bookId))
      .groupBy(books.id)
      .orderBy(desc(sql`count(${wishlists.id})`))
      .limit(limit);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(topBooks)),
    };
  } catch (error) {
    console.error("Error fetching top wishlisted books:", error);
    return { success: false, error: "Failed to fetch top wishlisted books", data: [] };
  }
};


export const getRecentBorrowRequests = async (limit = 3) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const [actingUser] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (actingUser?.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const records = await db
      .select({
        id: borrowRecords.id,
        userId: borrowRecords.userId,
        bookId: borrowRecords.bookId,
        borrowDate: borrowRecords.borrowDate,
        dueDate: borrowRecords.dueDate,
        status: borrowRecords.status,
        book: {
          id: books.id,
          title: books.title,
          author: books.author,
          genre: books.genre,
          coverUrl: books.coverUrl,
          coverColor: books.coverColor,
        },
        user: {
          id: users.id,
          fullName: users.fullName,
          email: users.email,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(borrowRecords)
      .innerJoin(books, eq(borrowRecords.bookId, books.id))
      .innerJoin(users, eq(borrowRecords.userId, users.id))
      .where(eq(borrowRecords.status, "BORROWED"))
      .orderBy(desc(borrowRecords.borrowDate))
      .limit(limit);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(records)),
    };
  } catch (error) {
    console.error("Error fetching recent borrow requests:", error);
    return { success: false, data: [] };
  }
};

export const getRecentlyAddedBooks = async (limit = 6) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const [actingUser] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (actingUser?.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const recentBooks = await db
      .select()
      .from(books)
      .orderBy(desc(books.createdAt))
      .limit(limit);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(recentBooks)),
    };
  } catch (error) {
    console.error("Error fetching recently added books:", error);
    return { success: false, data: [] };
  }
};

export const deleteBook = async (bookId: string) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const [actingUser] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (actingUser?.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    // Delete borrow records and book in a single transaction
    await db.transaction(async (tx) => {
      await tx.delete(borrowRecords).where(eq(borrowRecords.bookId, bookId));
      await tx.delete(books).where(eq(books.id, bookId));
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting book:", error);
    return { success: false, error: "Failed to delete book" };
  }
};

export const getAllReviewsAdmin = async ({
  page = 1,
  limit = 10,
  query = "",
  rating,
}: {
  page?: number;
  limit?: number;
  query?: string;
  rating?: number;
} = {}) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const [actingUser] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (actingUser?.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const offset = (page - 1) * limit;
    const conditions = [];

    if (query) {
      conditions.push(
        or(
          ilike(books.title, `%${query}%`),
          ilike(users.fullName, `%${query}%`),
          ilike(reviews.comment, `%${query}%`),
        ),
      );
    }

    if (rating !== undefined && rating > 0) {
      conditions.push(eq(reviews.rating, rating));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const reviewList = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        user: {
          id: users.id,
          fullName: users.fullName,
          email: users.email,
          avatarUrl: users.avatarUrl,
          universityId: users.universityId,
        },
        book: {
          id: books.id,
          title: books.title,
          author: books.author,
          coverUrl: books.coverUrl,
          coverColor: books.coverColor,
        },
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.id))
      .innerJoin(books, eq(reviews.bookId, books.id))
      .where(whereClause)
      .orderBy(desc(reviews.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ total }] = await db
      .select({ total: count() })
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.id))
      .innerJoin(books, eq(reviews.bookId, books.id))
      .where(whereClause);

    return {
      success: true,
      data: {
        reviews: JSON.parse(JSON.stringify(reviewList)),
        totalReviews: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  } catch (error) {
    console.error("Error fetching admin reviews:", error);
    return {
      success: false,
      data: { reviews: [], totalReviews: 0, totalPages: 1, currentPage: 1 },
    };
  }
};

export const deleteReviewAdmin = async (reviewId: string) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const [actingUser] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (actingUser?.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const [review] = await db
      .select({
        id: reviews.id,
        bookId: reviews.bookId,
        userId: reviews.userId,
      })
      .from(reviews)
      .where(eq(reviews.id, reviewId))
      .limit(1);

    if (!review) {
      return { success: false, error: "Review not found" };
    }

    await db.delete(reviews).where(eq(reviews.id, reviewId));

    // Recalculate book average rating
    const [avgResult] = await db
      .select({ avgRating: sql<number>`round(avg(${reviews.rating}))` })
      .from(reviews)
      .where(eq(reviews.bookId, review.bookId));

    const avgRating = Number(avgResult?.avgRating || 4);
    await db.update(books).set({ rating: avgRating }).where(eq(books.id, review.bookId));

    return { success: true, message: "Review deleted successfully" };
  } catch (error) {
    console.error("Error deleting review as admin:", error);
    return { success: false, error: "Failed to delete review" };
  }
};
