"use client";

import Image from "next/image";
import { adminSideBarLinks } from "@/constants";
import Link from "next/link";
import { cn, getInitials, getImageKitUrl } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

const Sidebar = ({
  session,
  avatar,
}: {
  session: Session;
  avatar?: string | null;
}) => {
  const pathname = usePathname();
  const avatarUrl = avatar ? getImageKitUrl(avatar) : null;

  return (
    <div className="admin-sidebar">
      <div>
        <div className="logo">
          <Image
            src="/icons/admin/logo.svg"
            alt="logo"
            width={37}
            height={37}
          />

          <h1>BookWise</h1>
        </div>

        <div className="mt-10 flex flex-col gap-5">
          {adminSideBarLinks.map((link) => {
            const isSelected =
              (link.route !== "/admin" &&
                pathname.includes(link.route) &&
                link.route.length > 1) ||
              pathname === link.route;

            return (
              <Link href={link.route} key={link.route}>
                <div
                  className={cn(
                    "link",
                    isSelected && "bg-primary-admin shadow-sm",
                  )}
                >
                  <div className="relative size-5">
                    <Image
                      src={link.img}
                      alt={link.text}
                      fill
                      sizes="20px"                      className={`${isSelected ? "brightness-0 invert" : ""} object-contain`}
                    />
                  </div>

                  <p className={cn(isSelected ? "text-white" : "text-dark")}>
                    {link.text}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div>
        <div className="user">
          <Avatar className="size-10 shrink-0">
            {avatarUrl && (
              <AvatarImage src={avatarUrl} alt={session?.user?.name || "Admin"} />
            )}
            <AvatarFallback className="bg-amber-100">
              {getInitials(session?.user?.name || "IN")}
            </AvatarFallback>
          </Avatar>

          <div className="flex min-w-0 flex-1 flex-col max-md:hidden">
            <p className="truncate font-semibold text-dark-200">
              {session?.user?.name}
            </p>
            <p className="truncate text-light-500 text-xs">
              {session?.user?.email}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/sign-in" })}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-500 transition-colors hover:bg-red-100"
          title="Logout"
          aria-label="Logout"
        >
          <LogOut className="size-4" />
          Logout
        </button>
      </div>
    </div>
  );
};
export default Sidebar;
