"use server";

import { db } from "@/database/drizzle";
import { books, borrowRecords, users, wishlists, reviews } from "@/database/schema";
import { BookFormValues } from "@/lib/validations";
import { and, asc, desc, eq, gt, ilike, ne, or, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { sendEmail } from "@/lib/workflow";
import { borrowConfirmationEmail, receiptEmail } from "@/lib/email-templates";
import { createNotification } from "@/lib/actions/notification.actions";

export const getBookById = async (bookId: string) => {
  try {
    const [book] = await db
      .select()
      .from(books)
      .where(eq(books.id, bookId))
      .limit(1);

    if (!book) {
      return { success: false, type: "not_found" as const };
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(book)),
    };
  } catch (error) {
    console.error("Error fetching book:", error);
    return {
      success: false,
      type: "database_error" as const,
      message: "An error occurred while fetching the book",
    };
  }
};

export const createBook = async (params: BookFormValues) => {
  try {
    const newBook = await db
      .insert(books)
      .values({
        ...params,
        description: params.description ?? "",
        availableCopies: params.totalCopies,
        rating: params.rating ?? 4,
      })
      .returning();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(newBook[0])),
    };
  } catch (error) {
    console.error("Error creating book:", error);

    return {
      success: false,
      message: "An error occurred while creating the book",
    };
  }
};

export const checkBookBorrowEligibility = async ({
  bookId,
}: {
  bookId: string;
}) => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        isEligible: false,
        message: "Please sign in to borrow books",
      };
    }

    const userId = session.user.id;

    const [user] = await db
      .select({ status: users.status })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return {
        isEligible: false,
        message: "User not found",
      };
    }

    if (user.status === "PENDING") {
      return {
        isEligible: false,
        message: "Your account is pending approval. Please wait for admin approval before borrowing books.",
        status: "PENDING" as const,
      };
    }

    if (user.status === "REJECTED") {
      return {
        isEligible: false,
        message: "Your account registration was rejected. Please contact admin for assistance.",
        status: "REJECTED" as const,
      };
    }

    const [book] = await db
      .select()
      .from(books)
      .where(eq(books.id, bookId))
      .limit(1);

    if (!book) {
      return {
        isEligible: false,
        message: "Book not found",
      };
    }

    if (book.availableCopies <= 0) {
      return {
        isEligible: false,
        message: "Book is not available for borrowing",
        outOfCopies: true,
      };
    }

    const existingBorrow = await db
      .select()
      .from(borrowRecords)
      .where(
        and(
          eq(borrowRecords.bookId, bookId),
          eq(borrowRecords.userId, userId),
          eq(borrowRecords.status, "BORROWED"),
        ),
      )
      .limit(1);

    if (existingBorrow.length > 0) {
      return {
        isEligible: false,
        message: "You have already borrowed this book",
        alreadyBorrowed: true,
      };
    }

    return {
      isEligible: true,
      message: "Book is available for borrowing",
    };
  } catch (error) {
    console.error("Error checking borrow eligibility:", error);
    return {
      isEligible: false,
      message: "An error occurred while checking eligibility",
    };
  }
};

export const borrowBook = async ({ bookId }: { bookId: string }) => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Please sign in to borrow books",
      };
    }

    const userId = session.user.id;

    const [user] = await db
      .select({
        status: users.status,
        fullName: users.fullName,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    if (user.status === "PENDING") {
      return {
        success: false,
        error: "Your account is pending approval. Please wait for admin approval before borrowing books.",
      };
    }

    if (user.status === "REJECTED") {
      return {
        success: false,
        error: "Your account registration was rejected. Please contact admin for assistance.",
      };
    }

    // Due date: 7 days from now formatted as YYYY-MM-DD
    const dueDateTime = new Date();
    dueDateTime.setDate(dueDateTime.getDate() + 7);
    const dueDate = dueDateTime.toISOString().slice(0, 10);

    // Database transaction to prevent race conditions
    const txResult = await db.transaction(async (tx) => {
      // 1. Check if user already has an active borrow of this book
      const existingBorrow = await tx
        .select()
        .from(borrowRecords)
        .where(
          and(
            eq(borrowRecords.bookId, bookId),
            eq(borrowRecords.userId, userId),
            eq(borrowRecords.status, "BORROWED"),
          ),
        )
        .limit(1);

      if (existingBorrow.length > 0) {
        throw new Error("ALREADY_BORROWED");
      }

      // 2. Decrement available copies atomically only if availableCopies > 0
      const updatedBooks = await tx
        .update(books)
        .set({
          availableCopies: sql`${books.availableCopies} - 1`,
        })
        .where(and(eq(books.id, bookId), gt(books.availableCopies, 0)))
        .returning();

      if (updatedBooks.length === 0) {
        throw new Error("OUT_OF_COPIES");
      }

      const book = updatedBooks[0];

      // 3. Create borrow record
      const [borrowRecord] = await tx
        .insert(borrowRecords)
        .values({
          userId,
          bookId,
          borrowDate: new Date(),
          dueDate,
          status: "BORROWED",
          renewCount: 0,
        })
        .returning();

      return { borrowRecord, book };
    });

    const { borrowRecord, book } = txResult;

    if (user.email) {
      const borrowDateStr = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
      const dueDateStr = new Date(dueDate).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });

      await sendEmail({
        email: user.email,
        subject: `You've Borrowed ${book.title}!`,
        message: borrowConfirmationEmail(
          user.fullName,
          book.title,
          borrowDateStr,
          dueDateStr,
        ),
      }).catch(() => {});

      await sendEmail({
        email: user.email,
        subject: `Your Receipt for ${book.title} is Ready!`,
        message: receiptEmail(
          user.fullName,
          book.title,
          book.author,
          book.genre,
          borrowDateStr,
          dueDateStr,
          7,
        ),
      }).catch(() => {});

      // In-App Notification
      await createNotification({
        userId,
        title: "Book Borrowed Successfully 📚",
        message: `You borrowed "${book.title}". Please return by ${dueDateStr}.`,
        type: "BORROW",
        link: "/my-profile",
      }).catch(() => {});
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(borrowRecord)),
    };
  } catch (error: any) {
    console.error("Error borrowing book:", error);
    if (error?.message === "ALREADY_BORROWED") {
      return {
        success: false,
        error: "You have already borrowed this book",
      };
    }
    if (error?.message === "OUT_OF_COPIES") {
      return {
        success: false,
        error: "Book is not available for borrowing",
      };
    }
    return {
      success: false,
      error: "An error occurred while borrowing the book",
    };
  }
};


export const getUserBorrowedBooks = async (userId: string) => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized", data: [] };
    }

    const isOwnRecords = session.user.id === userId;
    const isAdmin = (session.user as any).role === "ADMIN";

    if (!isOwnRecords && !isAdmin) {
      return { success: false, error: "Forbidden", data: [] };
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
          rating: books.rating,
          totalCopies: books.totalCopies,
          availableCopies: books.availableCopies,
          description: books.description,
          coverColor: books.coverColor,
          coverUrl: books.coverUrl,
          videoUrl: books.videoUrl,
          summary: books.summary,
          createdAt: books.createdAt,
        },
      })
      .from(borrowRecords)
      .innerJoin(books, eq(borrowRecords.bookId, books.id))
      .where(eq(borrowRecords.userId, userId))
      .orderBy(desc(borrowRecords.borrowDate));

    return {
      success: true,
      data: JSON.parse(JSON.stringify(records)),
    };
  } catch (error) {
    console.error("Error fetching user borrowed books:", error);
    return {
      success: false,
      error: "An error occurred while fetching borrowed books",
      data: [],
    };
  }
};

export const getSimilarBooks = async ({
  currentBookId,
  genre,
  limit = 6,
}: {
  currentBookId: string;
  genre?: string;
  limit?: number;
}) => {
  try {
    let similarBooks: Book[] = [];

    if (genre) {
      similarBooks = await db
        .select()
        .from(books)
        .where(and(ne(books.id, currentBookId), eq(books.genre, genre)))
        .limit(limit);
    }

    if (similarBooks.length < limit) {
      const remainingLimit = limit - similarBooks.length;
      const excludedIds = [currentBookId, ...similarBooks.map((b) => b.id)];

      const extraBooks = await db
        .select()
        .from(books)
        .where(
          sql`${books.id} NOT IN (${sql.join(
            excludedIds.map((id) => sql`${id}`),
            sql`, `,
          )})`,
        )
        .limit(remainingLimit)
        .orderBy(desc(books.createdAt));

      similarBooks = [...similarBooks, ...extraBooks];
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(similarBooks)),
    };
  } catch (error) {
    console.error("Error fetching similar books:", error);
    return {
      success: false,
      data: [],
    };
  }
};

export const getAllBooks = async ({
  query = "",
  genre = "",
  page = 1,
  limit = 12,
  sort = "latest",
  availableOnly = false,
}: {
  query?: string;
  genre?: string;
  page?: number;
  limit?: number;
  sort?: string;
  availableOnly?: boolean;
} = {}) => {
  try {
    const conditions = [];

    if (query && query.trim()) {
      const searchPattern = `%${query.trim().toLowerCase()}%`;
      conditions.push(
        or(
          ilike(books.title, searchPattern),
          ilike(books.author, searchPattern),
          ilike(books.genre, searchPattern),
          ilike(books.description, searchPattern),
        ),
      );
    }

    if (genre && genre !== "all" && genre !== "All" && genre !== "Department") {
      conditions.push(eq(books.genre, genre));
    }

    if (availableOnly) {
      conditions.push(gt(books.availableCopies, 0));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(books)
      .where(whereClause);

    const totalBooks = Number(countResult?.count || 0);
    const totalPages = Math.max(1, Math.ceil(totalBooks / limit));
    const offset = Math.max(0, (page - 1) * limit);

    let orderByClause;
    if (sort === "oldest") {
      orderByClause = asc(books.createdAt);
    } else if (sort === "highest_rated") {
      orderByClause = desc(books.rating);
    } else if (sort === "available") {
      orderByClause = desc(books.availableCopies);
    } else if (sort === "title_asc") {
      orderByClause = asc(books.title);
    } else if (sort === "title_desc") {
      orderByClause = desc(books.title);
    } else {
      orderByClause = desc(books.createdAt);
    }

    const bookList = await db
      .select({
        id: books.id,
        title: books.title,
        author: books.author,
        genre: books.genre,
        rating: books.rating,
        coverUrl: books.coverUrl,
        coverColor: books.coverColor,
        description: books.description,
        totalCopies: books.totalCopies,
        availableCopies: books.availableCopies,
        videoUrl: books.videoUrl,
        summary: books.summary,
        createdAt: books.createdAt,
        wishlistCount: sql<number>`(
          SELECT count(*)::int FROM ${wishlists} WHERE ${wishlists.bookId} = ${books.id}
        )`,
      })
      .from(books)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(orderByClause);

    // Get all distinct genres for the filter dropdown
    const genresResult = await db
      .selectDistinct({ genre: books.genre })
      .from(books);
    const genres = genresResult
      .map((g) => g.genre)
      .filter(Boolean)
      .sort();

    return {
      success: true,
      data: {
        books: JSON.parse(JSON.stringify(bookList)),
        totalBooks,
        totalPages,
        currentPage: page,
        genres,
      },
    };
  } catch (error) {
    console.error("Error fetching all books:", error);
    return {
      success: false,
      data: {
        books: [],
        totalBooks: 0,
        totalPages: 1,
        currentPage: 1,
        genres: [] as string[],
      },
    };
  }
};

// Wishlist Server Actions
export const toggleWishlist = async (params: string | { bookId: string }) => {
  try {
    const bookId = typeof params === "string" ? params : params?.bookId;
    if (!bookId) {
      return { success: false, error: "Book ID is required" };
    }

    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Please sign in to save books" };
    }

    const userId = session.user.id;

    const existing = await db
      .select()
      .from(wishlists)
      .where(and(eq(wishlists.userId, userId), eq(wishlists.bookId, bookId)))
      .limit(1);

    if (existing.length > 0) {
      await db
        .delete(wishlists)
        .where(and(eq(wishlists.userId, userId), eq(wishlists.bookId, bookId)));
      return { success: true, isWishlisted: false, message: "Removed from saved books" };
    } else {
      await db.insert(wishlists).values({ userId, bookId });
      return { success: true, isWishlisted: true, message: "Saved to your reading list" };
    }
  } catch (error) {
    console.error("Error toggling wishlist:", error);
    return { success: false, error: "Failed to update wishlist" };
  }
};

export const checkIsBookWishlisted = async (params: string | { bookId: string }) => {
  try {
    const bookId = typeof params === "string" ? params : params?.bookId;
    if (!bookId) {
      return { isWishlisted: false };
    }

    const session = await auth();
    if (!session?.user?.id) {
      return { isWishlisted: false };
    }

    const [existing] = await db
      .select()
      .from(wishlists)
      .where(
        and(
          eq(wishlists.userId, session.user.id),
          eq(wishlists.bookId, bookId),
        ),
      )
      .limit(1);

    return { isWishlisted: !!existing };
  } catch (error) {
    console.error("Error checking wishlist status:", error);
    return { isWishlisted: false };
  }
};

export const getUserWishlistBookIds = async () => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: true, data: [] };
    }

    const items = await db
      .select({ bookId: wishlists.bookId })
      .from(wishlists)
      .where(eq(wishlists.userId, session.user.id));

    return {
      success: true,
      data: items.map((i) => i.bookId),
    };
  } catch (error) {
    console.error("Error fetching wishlist IDs:", error);
    return { success: false, data: [] };
  }
};

export const getUserWishlist = async () => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized", data: [] };
    }

    const savedBooks = await db
      .select({
        id: books.id,
        title: books.title,
        author: books.author,
        genre: books.genre,
        rating: books.rating,
        totalCopies: books.totalCopies,
        availableCopies: books.availableCopies,
        description: books.description,
        coverColor: books.coverColor,
        coverUrl: books.coverUrl,
        videoUrl: books.videoUrl,
        summary: books.summary,
        savedAt: wishlists.createdAt,
      })
      .from(wishlists)
      .innerJoin(books, eq(wishlists.bookId, books.id))
      .where(eq(wishlists.userId, session.user.id))
      .orderBy(desc(wishlists.createdAt));

    return {
      success: true,
      data: JSON.parse(JSON.stringify(savedBooks)),
    };
  } catch (error) {
    console.error("Error fetching user wishlist:", error);
    return { success: false, error: "Failed to fetch saved books", data: [] };
  }
};

// Reviews & Ratings Server Actions
export const addOrUpdateReview = async ({
  bookId,
  rating,
  comment,
}: {
  bookId: string;
  rating: number;
  comment: string;
}) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Please sign in to write a review" };
    }

    const userId = session.user.id;
    const validatedRating = Math.max(1, Math.min(5, Math.round(rating)));

    if (!comment || !comment.trim()) {
      return { success: false, error: "Comment cannot be empty" };
    }

    // Check if user has already reviewed
    const existing = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.userId, userId), eq(reviews.bookId, bookId)))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(reviews)
        .set({ rating: validatedRating, comment: comment.trim(), createdAt: new Date() })
        .where(eq(reviews.id, existing[0].id));
    } else {
      await db.insert(reviews).values({
        userId,
        bookId,
        rating: validatedRating,
        comment: comment.trim(),
      });
    }

    // Recalculate book average rating
    const [avgResult] = await db
      .select({ avgRating: sql<number>`round(avg(${reviews.rating}))` })
      .from(reviews)
      .where(eq(reviews.bookId, bookId));

    const avgRating = Number(avgResult?.avgRating || validatedRating);
    await db.update(books).set({ rating: avgRating }).where(eq(books.id, bookId));

    return { success: true, message: "Review submitted successfully" };
  } catch (error) {
    console.error("Error submitting review:", error);
    return { success: false, error: "Failed to submit review" };
  }
};

export const getBookReviews = async (bookId: string) => {
  try {
    const reviewList = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        user: {
          id: users.id,
          fullName: users.fullName,
          avatarUrl: users.avatarUrl,
          universityId: users.universityId,
        },
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.bookId, bookId))
      .orderBy(desc(reviews.createdAt));

    const totalReviews = reviewList.length;
    const avgRating =
      totalReviews > 0
        ? Number(
            (
              reviewList.reduce((acc, r) => acc + r.rating, 0) / totalReviews
            ).toFixed(1),
          )
        : 0;

    return {
      success: true,
      data: {
        reviews: JSON.parse(JSON.stringify(reviewList)),
        totalReviews,
        avgRating,
      },
    };
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return {
      success: false,
      data: { reviews: [], totalReviews: 0, avgRating: 0 },
    };
  }
};

export const deleteReview = async (reviewId: string) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const [review] = await db
      .select()
      .from(reviews)
      .where(eq(reviews.id, reviewId))
      .limit(1);

    if (!review) {
      return { success: false, error: "Review not found" };
    }

    const isOwner = review.userId === session.user.id;
    const isAdmin = (session.user as any).role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return { success: false, error: "Forbidden" };
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
    console.error("Error deleting review:", error);
    return { success: false, error: "Failed to delete review" };
  }
};

// Renew Borrowed Book Server Action
export const renewBorrowedBook = async ({ recordId }: { recordId: string }) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Please sign in to renew books" };
    }

    const [record] = await db
      .select({
        id: borrowRecords.id,
        userId: borrowRecords.userId,
        bookId: borrowRecords.bookId,
        dueDate: borrowRecords.dueDate,
        status: borrowRecords.status,
        renewCount: borrowRecords.renewCount,
        bookTitle: books.title,
      })
      .from(borrowRecords)
      .innerJoin(books, eq(borrowRecords.bookId, books.id))
      .where(eq(borrowRecords.id, recordId))
      .limit(1);

    if (!record) {
      return { success: false, error: "Borrow record not found" };
    }

    const isOwner = record.userId === session.user.id;
    const isAdmin = (session.user as any).role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return { success: false, error: "Unauthorized" };
    }

    if (record.status !== "BORROWED") {
      return { success: false, error: "Only active borrows can be renewed" };
    }

    if (record.renewCount >= 2) {
      return {
        success: false,
        error: "You have reached the maximum of 2 renewals for this book",
      };
    }

    // Check if overdue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(record.dueDate);
    dueDate.setHours(0, 0, 0, 0);

    if (today > dueDate) {
      return {
        success: false,
        error:
          "Overdue books cannot be renewed. Please return the book to the library.",
      };
    }

    // Extend due date by 7 days
    const newDueDateObj = new Date(dueDate);
    newDueDateObj.setDate(newDueDateObj.getDate() + 7);
    const newDueDate = newDueDateObj.toISOString().slice(0, 10);

    await db
      .update(borrowRecords)
      .set({
        dueDate: newDueDate,
        renewCount: record.renewCount + 1,
      })
      .where(eq(borrowRecords.id, recordId));

    await createNotification({
      userId: record.userId,
      title: "Book Renewal Successful ⏳",
      message: `You extended the borrowing period for "${record.bookTitle}". New due date: ${newDueDateObj.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}.`,
      type: "RENEW",
      link: "/my-profile",
    }).catch(() => {});

    return {
      success: true,
      message: `Book renewed! New due date: ${newDueDateObj.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}`,
      newDueDate,
      renewCount: record.renewCount + 1,
    };
  } catch (error) {
    console.error("Error renewing book:", error);
    return { success: false, error: "Failed to renew book" };
  }
};

export const updateBook = async (
  bookId: string,
  params: Partial<BookFormValues>,
) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const [actingUser] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (actingUser?.role !== "ADMIN") {
      return { success: false, message: "Unauthorized" };
    }

    const [existingBook] = await db
      .select()
      .from(books)
      .where(eq(books.id, bookId))
      .limit(1);

    if (!existingBook) {
      return { success: false, message: "Book not found" };
    }

    let availableCopies = existingBook.availableCopies;
    if (params.totalCopies !== undefined) {
      const [{ count: activeBorrowCount }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(borrowRecords)
        .where(
          and(
            eq(borrowRecords.bookId, bookId),
            eq(borrowRecords.status, "BORROWED"),
          ),
        );

      if (params.totalCopies < activeBorrowCount) {
        return {
          success: false,
          message: `Cannot set total copies below the number of active borrows (${activeBorrowCount})`,
        };
      }

      const copyDiff = params.totalCopies - existingBook.totalCopies;
      availableCopies = Math.max(0, existingBook.availableCopies + copyDiff);
    }

    const [updatedBook] = await db
      .update(books)
      .set({
        ...params,
        availableCopies,
      })
      .where(eq(books.id, bookId))
      .returning();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(updatedBook)),
    };
  } catch (error) {
    console.error("Error updating book:", error);
    return {
      success: false,
      message: "An error occurred while updating the book",
    };
  }
};

