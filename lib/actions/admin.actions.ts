"use server";

import { db } from "@/database/drizzle";
import { books, borrowRecords, users } from "@/database/schema";
import { auth } from "@/auth";
import { and, asc, desc, eq, ilike, or, sql, count } from "drizzle-orm";

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

    // Delete borrow records first
    await db.delete(borrowRecords).where(eq(borrowRecords.userId, userId));
    // Delete user
    await db.delete(users).where(eq(users.id, userId));

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

    const pendingUsers = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        universityId: users.universityId,
        universityCard: users.universityCard,
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

export const approveAccountRequest = async (userId: string) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    await db
      .update(users)
      .set({ status: "APPROVED" })
      .where(eq(users.id, userId));

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

    await db
      .update(users)
      .set({ status: "REJECTED" })
      .where(eq(users.id, userId));

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

    const updateData: any = { status };

    if (status === "RETURNED") {
      updateData.returnDate = new Date();
    }

    // Get the record first to update available copies
    const [record] = await db
      .select()
      .from(borrowRecords)
      .where(eq(borrowRecords.id, recordId))
      .limit(1);

    if (!record) {
      return { success: false, error: "Record not found" };
    }

    await db
      .update(borrowRecords)
      .set(updateData)
      .where(eq(borrowRecords.id, recordId));

    // If returning, increment available copies
    if (status === "RETURNED") {
      const [book] = await db
        .select()
        .from(books)
        .where(eq(books.id, record.bookId))
        .limit(1);

      if (book) {
        await db
          .update(books)
          .set({ availableCopies: book.availableCopies + 1 })
          .where(eq(books.id, record.bookId));
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating borrow record:", error);
    return { success: false, error: "Failed to update borrow record" };
  }
};

export const getAdminStats = async () => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
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

    return {
      success: true,
      data: {
        totalBooks: Number(totalBooksResult?.count || 0),
        totalUsers: Number(totalUsersResult?.count || 0),
        borrowedBooks: Number(borrowedBooksResult?.count || 0),
        pendingAccounts: Number(pendingAccountsResult?.count || 0),
      },
    };
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return { success: false, error: "Failed to fetch stats" };
  }
};

export const getRecentBorrowRequests = async (limit = 3) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
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

    // Delete borrow records first
    await db.delete(borrowRecords).where(eq(borrowRecords.bookId, bookId));
    // Delete book
    await db.delete(books).where(eq(books.id, bookId));

    return { success: true };
  } catch (error) {
    console.error("Error deleting book:", error);
    return { success: false, error: "Failed to delete book" };
  }
};
