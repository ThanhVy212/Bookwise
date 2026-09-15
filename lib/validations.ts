import * as z from "zod";

export const signInSchema = z.object({
  email: z.email("Email is required"),
  password: z.string().min(6, "The password must be at least 6 characters"),
});

export const signUpSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  email: z.email("Email is required"),
  universityId: z.number({ error: "University ID is required" }).min(1, "University ID must be at least 1"),
  universityCard: z.string().nonempty("University Card is required"),
  password: z.string().min(6, "The password must be at least 6 characters"),
});

export const authSchema = z.object({
  fullName: z.string().optional(),
  email: z.email("Email is required"),
  universityId: z.number().optional(),
  universityCard: z.string().optional(),
  password: z.string().min(6, "The password must be at least 6 characters"),
});

export type AuthFormValues = z.infer<typeof authSchema>;

export const bookSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title cannot exceed 100 characters"),
  author: z
    .string()
    .trim()
    .min(2, "Author must be at least 2 characters")
    .max(100, "Author cannot exceed 100 characters"),
  genre: z
    .string()
    .trim()
    .min(2, "Genre must be at least 2 characters")
    .max(50, "Genre cannot exceed 50 characters"),
  rating: z
    .number()
    .min(1, "Rating must be between 1 and 5")
    .max(5, "Rating must be between 1 and 5"),
  totalCopies: z
    .number()
    .int("Total copies must be an integer")
    .min(1, "Total copies must be greater than 0")
    .max(10000, "Total copies cannot exceed 10,000"),
  description: z.string().trim().optional(),
  coverUrl: z.string().nonempty("Book cover image is required"),
  coverColor: z
    .string()
    .trim()
    .regex(
      /^#([0-9a-fA-F]{6})$/i,
      "Cover color must be a valid hex code (e.g. #000000)",
    ),
  videoUrl: z.string().nonempty("Book video is required"),
  summary: z
    .string()
    .trim()
    .min(10, "Summary must be at least 10 characters"),
});

export type BookFormValues = z.infer<typeof bookSchema>;
