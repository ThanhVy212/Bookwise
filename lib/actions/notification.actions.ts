"use server";

import { db } from "@/database/drizzle";
import { notifications, users } from "@/database/schema";
import { auth } from "@/auth";
import { and, desc, eq, sql } from "drizzle-orm";
import { emitSocketNotification } from "@/lib/socket-server";
import { isSafeNotificationLink } from "@/lib/notifications";

export const getUserNotifications = async () => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized", data: [], unreadCount: 0 };
    }

    const userId = session.user.id;

    const notifList = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(20);

    const [unreadResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false),
        ),
      );

    return {
      success: true,
      data: JSON.parse(JSON.stringify(notifList)),
      unreadCount: Number(unreadResult?.count || 0),
    };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return { success: false, error: "Failed to fetch notifications", data: [], unreadCount: 0 };
  }
};

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    await db
      .update(notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, session.user.id),
        ),
      );

    return { success: true };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { success: false, error: "Failed to update notification" };
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, session.user.id));

    return { success: true };
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return { success: false, error: "Failed to update notifications" };
  }
};

export const sendCustomNotificationAdmin = async ({
  recipientType,
  userId,
  title,
  message,
  type = "ANNOUNCEMENT",
  link,
}: {
  recipientType: "ALL" | "SPECIFIC";
  userId?: string;
  title: string;
  message: string;
  type?: string;
  link?: string;
}) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const [actingUser] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (actingUser?.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    if (!title?.trim() || !message?.trim()) {
      return { success: false, error: "Title and message are required" };
    }

    if (!isSafeNotificationLink(link)) {
      return { success: false, error: "Invalid notification link" };
    }

    if (recipientType === "SPECIFIC") {
      if (!userId) {
        return { success: false, error: "Please select a recipient" };
      }

      const [newNotif] = await db
        .insert(notifications)
        .values({
          userId,
          title: title.trim(),
          message: message.trim(),
          type,
          link: link?.trim() || null,
          isRead: false,
        })
        .returning();

      const notifData = JSON.parse(JSON.stringify(newNotif));
      emitSocketNotification(userId, notifData);

      return {
        success: true,
        message: "Notification sent successfully via Socket.IO",
        count: 1,
      };
    } else {
      const allUsers = await db.select({ id: users.id }).from(users);

      if (allUsers.length === 0) {
        return { success: false, error: "No users found" };
      }

      const notifValues = allUsers.map((u) => ({
        userId: u.id,
        title: title.trim(),
        message: message.trim(),
        type,
        link: link?.trim() || null,
        isRead: false,
      }));

      const insertedRows = await db
        .insert(notifications)
        .values(notifValues)
        .returning();

      const notifRows = JSON.parse(JSON.stringify(insertedRows));
      for (const notif of notifRows) {
        emitSocketNotification(notif.userId, notif);
      }

      return {
        success: true,
        message: `Notification broadcast to all ${allUsers.length} users via Socket.IO`,
        count: allUsers.length,
      };
    }
  } catch (error) {
    console.error("Error sending custom notification:", error);
    return { success: false, error: "Failed to send notification" };
  }
};

export const getSentNotificationsAdmin = async ({
  limit = 20,
}: { limit?: number } = {}) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, data: [] };
    }

    const [actingUser] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (actingUser?.role !== "ADMIN") {
      return { success: false, data: [] };
    }

    const list = await db
      .select({
        id: notifications.id,
        title: notifications.title,
        message: notifications.message,
        type: notifications.type,
        link: notifications.link,
        isRead: notifications.isRead,
        createdAt: notifications.createdAt,
        user: {
          id: users.id,
          fullName: users.fullName,
          email: users.email,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(notifications)
      .innerJoin(users, eq(notifications.userId, users.id))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(list)),
    };
  } catch (error) {
    console.error("Error fetching sent notifications admin:", error);
    return { success: false, data: [] };
  }
};
