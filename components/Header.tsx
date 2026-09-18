"use client";

import Link from "next/link";
import { cn, getInitials, getImageKitUrl } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";

const Header = ({
  session,
  avatar,
}: {
  session: Session;
  avatar?: string | null;
}) => {
  const pathname = usePathname();
  const avatarUrl = avatar ? getImageKitUrl(avatar) : null;

  return (
    <header className="my-10 flex items-center justify-between gap-5">
      <Link href="/" className="flex items-center gap-2.5">
        <Image src="/icons/logo.svg" alt="logo" width={38} height={32} />
        <span className="text-2xl font-bold text-white tracking-wide">
          BookWise
        </span>
      </Link>

      <ul className="flex flex-row items-center gap-6 sm:gap-8">
        <li>
          <Link
            href="/"
            className={cn(
              "text-base font-medium cursor-pointer transition-colors",
              pathname === "/" ? "text-light-200" : "text-light-100 hover:text-white",
            )}
          >
            Home
          </Link>
        </li>

        <li>
          <Link
            href="/search"
            className={cn(
              "text-base font-medium cursor-pointer transition-colors",
              pathname.startsWith("/search") || pathname.startsWith("/library")
                ? "text-light-200"
                : "text-light-100 hover:text-white",
            )}
          >
            Search
          </Link>
        </li>

        <li>
          <Link href="/my-profile" className="flex items-center gap-2.5 group">
            <Avatar className="size-9 ring-1 ring-light-100/20">
              {avatarUrl && (
                <AvatarImage src={avatarUrl} alt={session?.user?.name || "User"} />
              )}
              <AvatarFallback className="bg-light-100 text-dark-100 font-semibold text-xs">
                {getInitials(session?.user?.name || "IN")}
              </AvatarFallback>
            </Avatar>
            <span className="text-base font-semibold text-white group-hover:text-primary transition-colors max-sm:hidden">
              {session?.user?.name || "User"}
            </span>
          </Link>
        </li>

        <li>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/sign-in" })}
            className="flex items-center justify-center rounded-lg p-1.5 text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
            title="Logout"
            aria-label="Logout"
          >
            <Image src="/icons/logout.svg" alt="logout" width={22} height={22} />
          </button>
        </li>
      </ul>
    </header>
  );
};
export default Header;

