import React, { Suspense } from "react";
import { Session } from "next-auth";
import AdminSearch from "@/components/admin/AdminSearch";

const Header = ({ session }: { session: Session }) => {
  const firstName = session?.user?.name?.split(" ")[0] || session?.user?.name || "Admin";

  return (
    <header className="admin-header">
      <div>
        <h2 className="text-2xl font-bold text-dark-400">
          Welcome, {firstName}
        </h2>
        <p className="text-sm sm:text-base text-slate-500 mt-0.5">
          Monitor all of your projects and tasks here
        </p>
      </div>

      <div className="w-full sm:w-auto">
        <Suspense fallback={<div className="h-11 w-full max-w-md rounded-lg bg-slate-100 animate-pulse" />}>
          <AdminSearch />
        </Suspense>
      </div>
    </header>
  );
};
export default Header;

