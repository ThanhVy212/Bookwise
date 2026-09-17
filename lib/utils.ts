import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getInitials = (name: string): string =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .join(" ")
    .toUpperCase()
    .slice(0, 2);

const IMAGEKIT_URL_ENDPOINT =
  process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "";

export const getImageKitUrl = (filePath: string): string => {
  if (!filePath) return "";
  if (filePath.startsWith("http")) return filePath;
  return `${IMAGEKIT_URL_ENDPOINT}${filePath}`;
};
