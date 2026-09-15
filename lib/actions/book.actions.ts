"use server";

import { db } from "@/database/drizzle";
import { books, borrowRecords, users } from "@/database/schema";
import { BookFormValues } from "@/lib/validations";
import { and, asc, desc, eq, ilike, ne, or, sql } from "drizzle-orm";

export const getBookById = async (bookId: string) => {
  try {
    const [book] = await db
      .select()
      .from(books)
      .where(eq(books.id, bookId))
      .limit(1);

    if (!book) {
      return { success: false, message: "Book not found" };
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(book)),
    };
  } catch (error) {
    console.error("Error fetching book:", error);
    return {
      success: false,
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
  userId,
}: {
  bookId: string;
  userId: string;
}) => {
  try {
    if (!userId) {
      return {
        isEligible: false,
        message: "Please sign in to borrow books",
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

export const borrowBook = async ({
  bookId,
  userId,
}: {
  bookId: string;
  userId: string;
}) => {
  try {
    if (!userId) {
      return {
        success: false,
        error: "Please sign in to borrow books",
      };
    }

    const [book] = await db
      .select()
      .from(books)
      .where(eq(books.id, bookId))
      .limit(1);

    if (!book) {
      return {
        success: false,
        error: "Book not found",
      };
    }

    if (book.availableCopies <= 0) {
      return {
        success: false,
        error: "Book is not available for borrowing",
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
        success: false,
        error: "You have already borrowed this book",
      };
    }

    // Due date: 7 days from now formatted as YYYY-MM-DD
    const dueDateTime = new Date();
    dueDateTime.setDate(dueDateTime.getDate() + 7);
    const dueDate = dueDateTime.toISOString().slice(0, 10);

    const [borrowRecord] = await db
      .insert(borrowRecords)
      .values({
        userId,
        bookId,
        borrowDate: new Date(),
        dueDate,
        status: "BORROWED",
      })
      .returning();

    await db
      .update(books)
      .set({
        availableCopies: book.availableCopies - 1,
      })
      .where(eq(books.id, bookId));

    return {
      success: true,
      data: JSON.parse(JSON.stringify(borrowRecord)),
    };
  } catch (error) {
    console.error("Error borrowing book:", error);
    return {
      success: false,
      error: "An error occurred while borrowing the book",
    };
  }
};

export const getUserBorrowedBooks = async (userId: string) => {
  try {
    if (!userId) {
      return { success: false, data: [] };
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
    let similarBooks = [];

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
}: {
  query?: string;
  genre?: string;
  page?: number;
  limit?: number;
  sort?: string;
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
    } else {
      orderByClause = desc(books.createdAt);
    }

    const bookList = await db
      .select()
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
        books: JSON.parse(JSON.stringify(bookList)) as Book[],
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
        books: [] as Book[],
        totalBooks: 0,
        totalPages: 1,
        currentPage: 1,
        genres: [] as string[],
      },
    };
  }
};


