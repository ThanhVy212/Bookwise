import { db } from "@/database/drizzle";
import { notifications } from "@/database/schema";
import { emitSocketNotification } from "@/lib/socket-server";

// Only same-origin relative paths are allowed (e.g. "/my-profile").
// Rejects absolute URLs, protocol-relative ("//host"), backslash tricks, and control chars.
export const isSafeNotificationLink = (link?: string | null): boolean => {
  if (link === undefined || link === null) return true;
  const trimmed = link.trim();
  if (trimmed === "") return true;
  if (!trimmed.startsWith("/")) return false;
  if (trimmed.startsWith("//")) return false;
  if (trimmed.includes("\\")) return false;
  for (let i = 0; i < trimmed.length; i++) {
    const code = trimmed.charCodeAt(i);
    if (code < 32 || code === 127) return false;
  }
  return true;
};

export const createNotification = async ({
  userId,
  title,
  message,
  type = "GENERAL",
  link,
}: {
  userId: string;
  title: string;
  message: string;
  type?: string;
  link?: string;
}) => {
  try {
    if (!isSafeNotificationLink(link)) {
      return { success: false, error: "Invalid notification link" };
    }

    const [newNotif] = await db
      .insert(notifications)
      .values({
        userId,
        title,
        message,
        type,
        link,
        isRead: false,
      })
      .returning();

    const notifData = JSON.parse(JSON.stringify(newNotif));
    emitSocketNotification(userId, notifData);

    return { success: true, data: notifData };
  } catch (error) {
    console.error("Error creating notification:", error);
    return { success: false, error: "Failed to create notification" };
  }
};
