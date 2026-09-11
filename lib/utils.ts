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
