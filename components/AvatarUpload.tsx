"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import {
  ImageKitProvider,
  upload,
  Image as ImageKitImage,
} from "@imagekit/next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials, cn, getImageKitUrl } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import config from "@/lib/config";
import { Camera, Loader2 } from "lucide-react";
import { updateUserAvatar } from "@/lib/actions/auth.actions";

const authenticator = async (folder: string) => {
  const response = await fetch(
    `${config.env.apiEndpoint}/api/imagekit?folder=${encodeURIComponent(folder)}`,
  );

  if (!response.ok) {
    throw new Error("Failed to authenticate with ImageKit");
  }

  const data = await response.json();
  return { token: data.token, expire: data.expire, signature: data.signature };
};

interface AvatarUploadProps {
  userId: string;
  avatarUrl?: string | null;
  fullName: string;
  size?: "sm" | "default" | "lg";
  className?: string;
  fallbackClassName?: string;
}

const sizeClasses = {
  sm: "size-9",
  default: "size-20",
  lg: "size-24",
};

const AvatarUpload = ({
  userId,
  avatarUrl,
  fullName,
  size = "default",
  className,
  fallbackClassName,
}: AvatarUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(
    avatarUrl ?? null,
  );

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.add({
        type: "warning",
        title: "File Too Large",
        description: "Avatar must be less than 5MB.",
      });
      event.target.value = "";
      return;
    }

    try {
      setIsUploading(true);

      const auth = await authenticator("avatars");

      const result = await upload({
        file,
        fileName: file.name,
        folder: "avatars",
        publicKey: config.env.imagekit.publicKey!,
        token: auth.token,
        expire: auth.expire,
        signature: auth.signature,
      });

      const filePath = result.filePath;
      if (!filePath) {
        throw new Error("ImageKit did not return a file path.");
      }

      const saveResult = await updateUserAvatar({ userId, avatarUrl: filePath });

      if (!saveResult.success) {
        throw new Error(saveResult.error || "Failed to save avatar");
      }

      setCurrentAvatar(filePath);

      toast.add({
        type: "success",
        title: "Avatar Updated",
        description: "Your avatar has been updated successfully.",
      });
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast.add({
        type: "error",
        title: "Upload Failed",
        description: "Failed to update avatar. Please try again.",
      });
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  return (
    <ImageKitProvider urlEndpoint={config.env.imagekit.urlEndpoint}>
      <div className={cn("relative group", className)}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />

        <Avatar className={cn(sizeClasses[size], "ring-2 ring-primary/30 shadow-md")}>
          {currentAvatar && (
            <AvatarImage
              src={getImageKitUrl(currentAvatar)}
              alt={fullName}
            />
          )}
          <AvatarFallback
            className={cn(
              "bg-amber-100 text-dark-100 font-bold",
              fallbackClassName,
            )}
          >
            {getInitials(fullName)}
          </AvatarFallback>
        </Avatar>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={cn(
            "absolute inset-0 flex items-center justify-center rounded-full",
            "bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
            "cursor-pointer disabled:cursor-not-allowed",
          )}
        >
          {isUploading ? (
            <Loader2 className="size-5 text-white animate-spin" />
          ) : (
            <Camera className="size-5 text-white" />
          )}
        </button>
      </div>
    </ImageKitProvider>
  );
};

export default AvatarUpload;
