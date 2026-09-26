import React, { ReactNode } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";

const Layout = async ({ children }: { children: ReactNode }) => {
  const session = await auth();

  if (!session?.user?.id) redirect("/sign-in");

  const [userData] = await db
    .select({ avatarUrl: users.avatarUrl, role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (userData?.role !== "ADMIN") redirect("/");

  return (
    <main className="flex min-h-screen w-full flex-row">
      <Sidebar session={session} avatar={userData?.avatarUrl} />

      <div className="admin-container">
        <Header session={session} avatar={userData?.avatarUrl} />
        {children}
      </div>
    </main>
  );
};
export default Layout;
