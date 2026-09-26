import React, { Suspense } from "react";
import { Session } from "next-auth";
import AdminSearch from "@/components/admin/AdminSearch";
import NotificationDropdown from "@/components/NotificationDropdown";
import MobileNav from "@/components/admin/MobileNav";

const Header = ({
  session,
  avatar,
}: {
  session: Session;
  avatar?: string | null;
}) => {
  const firstName =
    session?.user?.name?.split(" ")[0] || session?.user?.name || "Admin";

  return (
    <header className="admin-header">
      <div className="flex items-center gap-3">
        <MobileNav session={session} avatar={avatar} />

        <div>
          <h2 className="text-xl font-bold text-dark-400 sm:text-2xl">
            Welcome, {firstName}
          </h2>
          <p className="mt-0.5 hidden text-sm text-slate-500 sm:block">
            Monitor all of your projects and tasks here
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        <Suspense
          fallback={
            <div className="h-11 w-full max-w-md rounded-lg bg-slate-100 animate-pulse" />
          }
        >
          <AdminSearch />
        </Suspense>

        <NotificationDropdown variant="light" />
      </div>
    </header>
  );
};
export default Header;
