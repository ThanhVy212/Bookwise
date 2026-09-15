"use client";

import React from "react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { ImageKitProvider, Image as ImageKitImage } from "@imagekit/next";
import config from "@/lib/config";

interface StudentCardProps {
  user: {
    fullName: string;
    email: string;
    universityId: number | string;
    universityCard?: string;
    status?: string;
  };
}

const StudentCard = ({ user }: StudentCardProps) => {
  const isImageKitPath =
    user.universityCard &&
    user.universityCard.startsWith("/") &&
    !user.universityCard.startsWith("http");

  return (
    <div className="relative w-full max-w-[420px]">
      {/* Top Lanyard Clip */}
      <div className="relative mx-auto -mb-3 flex h-7 w-12 items-center justify-center rounded-t-lg bg-[#2D3348] shadow-md z-10 border-t border-x border-light-100/10">
        <div className="h-2 w-5 rounded-full bg-dark-100/90 shadow-inner" />
      </div>

      {/* Main Badge Card */}
      <div className="relative flex flex-col gap-6 rounded-3xl bg-[#171B26] p-7 sm:p-8 border border-light-100/10 shadow-2xl">
        {/* User Info Header */}
        <div className="flex items-center gap-5">
          <Avatar className="size-20 ring-2 ring-primary/30 shadow-md">
            <AvatarFallback className="bg-amber-100 text-dark-100 text-2xl font-bold">
              {getInitials(user.fullName || "Adrian")}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              {user.status === "APPROVED" && (
                <Image
                  src="/icons/verified.svg"
                  alt="verified"
                  width={16}
                  height={16}
                />
              )}
              <span className="text-xs font-medium text-[#FFE1BD]">
                {user.status === "APPROVED" ? "Verified Student" : user.status || "N/A"}
              </span>
            </div>

            <h2 className="text-2xl font-bold text-white">{user.fullName}</h2>
            <p className="text-sm text-light-100 break-all">{user.email}</p>
          </div>
        </div>

        {/* University Name */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-light-100/70">
            University
          </p>
          <p className="text-lg font-bold text-white mt-0.5">JS Mastery Pro</p>
        </div>

        {/* Student ID */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-light-100/70">
            Student ID
          </p>
          <p className="text-2xl font-extrabold text-white tracking-wider mt-0.5">
            {user.universityId}
          </p>
        </div>

        {/* University Card Preview Graphic */}
        <div className="relative mt-2 overflow-hidden rounded-2xl border border-light-100/15 shadow-xl bg-gradient-to-br from-[#1E2638] via-[#151B28] to-[#0D111A]">
          {user.universityCard && user.universityCard.trim() !== "" ? (
            isImageKitPath ? (
              <ImageKitProvider urlEndpoint={config.env.imagekit.urlEndpoint}>
                <div className="relative h-48 w-full">
                  <ImageKitImage
                    src={user.universityCard}
                    alt="University Card"
                    fill
                    className="object-cover rounded-xl"
                  />
                </div>
              </ImageKitProvider>
            ) : user.universityCard.startsWith("http") ? (
              <div className="relative h-48 w-full">
                <Image
                  src={user.universityCard}
                  alt="University Card"
                  fill
                  className="object-cover rounded-xl"
                />
              </div>
            ) : (
              <StylizedUniversityCard user={user} />
            )
          ) : (
            <StylizedUniversityCard user={user} />
          )}
        </div>
      </div>
    </div>
  );
};

const StylizedUniversityCard = ({
  user,
}: {
  user: { fullName: string; universityId: number | string; email: string };
}) => {
  return (
    <div className="relative p-4 sm:p-5 text-white flex flex-col justify-between h-48 sm:h-52 bg-gradient-to-r from-[#111A2E] via-[#19273C] to-[#0F1829]">
      {/* Background patterns */}
      <div className="absolute top-0 right-0 size-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-3 border-b border-light-100/10 pb-2.5">
        <div className="flex size-9 items-center justify-center rounded-full bg-primary/20 ring-1 ring-primary/40">
          <Image src="/icons/logo.svg" alt="crest" width={22} height={22} />
        </div>
        <div>
          <h4 className="text-xs sm:text-sm font-bold tracking-wide text-white">
            JS Mastery University
          </h4>
          <p className="text-[9px] text-light-100/70 italic">
            Empowering Dreams, Inspiring Futures
          </p>
        </div>
      </div>

      {/* Body info */}
      <div className="flex items-center justify-between gap-3 my-auto pt-2">
        <div className="flex size-14 sm:size-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-400 p-0.5 shadow-md">
          <div className="flex size-full items-center justify-center rounded-[10px] bg-dark-100 text-base font-bold text-primary">
            {getInitials(user.fullName || "Adrian")}
          </div>
        </div>

        <div className="flex-1 space-y-0.5 text-[10px] sm:text-xs">
          <div className="flex gap-2">
            <span className="w-16 text-light-100/70">Student ID</span>
            <span className="font-semibold text-white">: {user.universityId}</span>
          </div>
          <div className="flex gap-2">
            <span className="w-16 text-light-100/70">Full Name</span>
            <span className="font-semibold text-white line-clamp-1">
              : {user.fullName}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="w-16 text-light-100/70">Department</span>
            <span className="font-semibold text-white">: Web Development</span>
          </div>
        </div>

        {/* QR Code Graphic Mock */}
        <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-lg bg-white p-1 shadow-sm">
          <div className="grid size-full grid-cols-4 gap-0.5 bg-black p-0.5">
            <div className="bg-white col-span-2 row-span-2" />
            <div className="bg-white" />
            <div className="bg-white" />
            <div className="bg-white" />
            <div className="bg-white col-span-2 row-span-2" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between border-t border-light-100/10 pt-2 text-[8px] text-light-100/60">
        <span>University No: +1 (800) 456-7890</span>
        <span>Website: www.jsmastery.pro</span>
      </div>
    </div>
  );
};

export default StudentCard;
