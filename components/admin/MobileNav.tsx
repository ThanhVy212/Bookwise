"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Session } from "next-auth";
import { LogOut, Menu, X } from "lucide-react";
import { adminSideBarLinks } from "@/constants";
import { cn, getInitials, getImageKitUrl } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const MobileNav = ({
  session,
  avatar,
}: {
  session: Session;
  avatar?: string | null;
}) => {
  const pathname = usePathname();
  const avatarUrl = avatar ? getImageKitUrl(avatar) : null;

  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (buttonRef.current?.contains(target)) return;
      setOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-dark-400 shadow-2xs transition-colors hover:bg-slate-50 cursor-pointer md:hidden"
        title="Menu"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          <div
            ref={panelRef}
            className="absolute left-0 top-0 flex h-full w-72 max-w-[85%] flex-col justify-between overflow-y-auto bg-white px-5 pb-6 pt-8 shadow-2xl custom-scrollbar"
          >
            <div>
              <div className="flex items-center justify-between border-b border-dashed border-primary-admin/20 pb-6">
                <div className="flex items-center gap-2">
                  <Image
                    src="/icons/admin/logo.svg"
                    alt="logo"
                    width={32}
                    height={32}
                  />
                  <h1 className="text-xl font-semibold text-primary-admin">
                    BookWise
                  </h1>
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex size-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-dark-400 cursor-pointer"
                  title="Close menu"
                  aria-label="Close menu"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="mt-6 flex flex-col gap-2">
                {adminSideBarLinks.map((link) => {
                  const isSelected =
                    (link.route !== "/admin" &&
                      pathname.includes(link.route) &&
                      link.route.length > 1) ||
                    pathname === link.route;

                  return (
                    <Link
                      href={link.route}
                      key={link.route}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex w-full flex-row items-center gap-2.5 rounded-lg px-4 py-3.5 transition-colors",
                        isSelected
                          ? "bg-primary-admin shadow-sm"
                          : "hover:bg-light-300",
                      )}
                    >
                      <div className="relative size-5 shrink-0">
                        <Image
                          src={link.img}
                          alt={link.text}
                          fill
                          sizes="20px"
                          className={`${
                            isSelected ? "brightness-0 invert" : ""
                          } object-contain`}
                        />
                      </div>

                      <p
                        className={cn(
                          "text-base font-medium",
                          isSelected ? "text-white" : "text-dark",
                        )}
                      >
                        {link.text}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="pt-8">
              <div className="flex w-full items-center gap-3 rounded-full border border-light-400 px-4 py-2 shadow-sm">
                <Avatar className="size-10 shrink-0">
                  {avatarUrl && (
                    <AvatarImage
                      src={avatarUrl}
                      alt={session?.user?.name || "Admin"}
                    />
                  )}
                  <AvatarFallback className="bg-amber-100">
                    {getInitials(session?.user?.name || "IN")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex min-w-0 flex-col">
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
                className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-500 transition-colors hover:bg-red-100"
                title="Logout"
                aria-label="Logout"
              >
                <LogOut className="size-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileNav;
