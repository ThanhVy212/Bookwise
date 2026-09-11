"use server";

import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";
import { hash } from "bcryptjs";
import { signIn } from "@/auth";

export const signInWithCredentials = async (
  params: Pick<AuthCredentials, "email" | "password">,
) => {
  const { email, password } = params;

  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return { success: false, error: result.error };
    }

    return { success: true };
  } catch (err) {
    console.log("Failed to sigIn", err);
    return { success: false, error: err };
  }
};

export const signUp = async (params: AuthCredentials) => {
  const { fullName, email, universityId, password, universityCard } = params;
  const normalizedEmail = email.toLowerCase();

  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existingUser.length > 0) {
      return { success: false, error: "User already exists" };
    }

    const hashedPassword = await hash(password, 10);

    await db.insert(users).values({
      fullName,
      email: normalizedEmail,
      universityId,
      password: hashedPassword,
      universityCard,
    });

    const signInResult = await signInWithCredentials({
      email: normalizedEmail,
      password,
    });

    if (!signInResult.success) {
      return { success: true, signInFailed: true };
    }

    return { success: true };
  } catch (err) {
    console.log("Failed to signUp", err);
    return { success: false, error: err };
  }
};
