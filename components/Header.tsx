"use client";

import Link from "next/link";
import { cn, getInitials, getImageKitUrl } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import NotificationDropdown from "@/components/NotificationDropdown";

const Header = ({
  session,
  avatar,
}: {
  session: Session;
  avatar?: string | null;
}) => {
  const pathname = usePathname();
  const avatarUrl = avatar ? getImageKitUrl(avatar) : null;

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  const handleSignOut = () => signOut({ callbackUrl: "/sign-in" });

  return (
    <header className="relative my-6 flex items-center justify-between gap-4 sm:my-10 sm:gap-5">
      <Link href="/" className="flex items-center gap-2.5">
        <Image src="/icons/logo.svg" alt="logo" width={38} height={32} />
        <span className="text-2xl font-bold text-white tracking-wide max-xs:hidden">
          BookWise
        </span>
      </Link>

      <div className="flex flex-row items-center gap-2.5 sm:gap-7">
        {/* Desktop navigation */}
        <ul className="hidden flex-row items-center gap-4 sm:flex sm:gap-7">
          <li>
            <Link
              href="/"
              className={cn(
                "text-base font-medium cursor-pointer transition-colors",
                pathname === "/"
                  ? "text-light-200"
                  : "text-light-100 hover:text-white",
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
                pathname.startsWith("/search") ||
                  pathname.startsWith("/library")
                  ? "text-light-200"
                  : "text-light-100 hover:text-white",
              )}
            >
              Search
            </Link>
          </li>
        </ul>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="flex size-9 items-center justify-center rounded-lg text-light-100 hover:bg-dark-300 hover:text-white transition-all cursor-pointer sm:hidden"
          title="Menu"
          aria-label="Menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>

        {/* In-App Notifications */}
        <NotificationDropdown variant="dark" />

        <div className="shrink-0">
          <Link href="/my-profile" className="flex items-center gap-2.5 group">
            <Avatar className="size-9 ring-1 ring-light-100/20">
              {avatarUrl && (
                <AvatarImage
                  src={avatarUrl}
                  alt={session?.user?.name || "User"}
                />
              )}
              <AvatarFallback className="bg-light-100 text-dark-100 font-semibold text-xs">
                {getInitials(session?.user?.name || "IN")}
              </AvatarFallback>
            </Avatar>
            <span className="text-base font-semibold text-white group-hover:text-primary transition-colors max-md:hidden">
              {session?.user?.name || "User"}
            </span>
          </Link>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="flex size-9 shrink-0 items-center justify-center rounded-lg p-1.5 text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
          title="Logout"
          aria-label="Logout"
        >
          <Image src="/icons/logout.svg" alt="logout" width={22} height={22} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          ref={menuRef}
          className="absolute left-0 right-0 top-full z-50 mt-3 rounded-2xl border border-light-100/15 bg-dark-100 p-2 shadow-2xl sm:hidden"
        >
          <Link
            href="/"
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-colors",
              pathname === "/"
                ? "bg-dark-300 text-light-200"
                : "text-light-100 hover:bg-dark-300 hover:text-white",
            )}
          >
            Home
          </Link>

          <Link
            href="/search"
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-colors",
              pathname.startsWith("/search") ||
                pathname.startsWith("/library")
                ? "bg-dark-300 text-light-200"
                : "text-light-100 hover:bg-dark-300 hover:text-white",
            )}
          >
            Search
          </Link>

          <Link
            href="/my-profile"
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-colors",
              pathname.startsWith("/my-profile")
                ? "bg-dark-300 text-light-200"
                : "text-light-100 hover:bg-dark-300 hover:text-white",
            )}
          >
            My Profile
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="size-4.5" />
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
