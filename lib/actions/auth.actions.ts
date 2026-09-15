"use server";

import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";
import { hash } from "bcryptjs";
import { signIn } from "@/auth";
import { headers } from "next/headers";
import ratelimit from "@/lib/ratelimit";
import { redirect } from "next/navigation";
import { workflowClient } from "@/lib/workflow";
import config from "@/lib/config";

export const signInWithCredentials = async (
  params: Pick<AuthCredentials, "email" | "password">,
) => {
  const { email, password } = params;

  const ip = (await headers()).get("x-forwarded-for") || "127.0.0.1";
  const { success } = await ratelimit.limit(ip);

  if (!success) return redirect("/too-fast");

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

  const ip = (await headers()).get("x-forwarded-for") || "127.0.0.1";
  const { success } = await ratelimit.limit(ip);

  if (!success) return redirect("/too-fast");

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

    await workflowClient.trigger({
      url: `${config.env.prodApiEndpoint}/api/workflow/onboarding`,
      body: {
        email,
        fullName,
      },
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

export const getUserById = async (userId: string) => {
  try {
    const user = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        universityId: users.universityId,
        universityCard: users.universityCard,
        status: users.status,
        role: users.role,
        lastActivityDate: users.lastActivityDate,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      return { success: false, error: "User not found" };
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(user[0])),
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return {
      success: false,
      error: "An error occurred while fetching the user",
    };
  }
};

