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
