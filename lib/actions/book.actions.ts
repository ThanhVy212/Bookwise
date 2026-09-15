"use server";

import { db } from "@/database/drizzle";
import { books } from "@/database/schema";
import { BookFormValues } from "@/lib/validations";

export const createBook = async (params: BookFormValues) => {
  try {
    const newBook = await db
      .insert(books)
      .values({
        ...params,
        availableCopies: params.totalCopies,
        description: params.description || params.summary,
        rating: params.rating ?? 5,
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
