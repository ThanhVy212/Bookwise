import { db } from "@/database/drizzle";
import { books, borrowRecords, users } from "@/database/schema";
import { and, eq, lt } from "drizzle-orm";
import { sendEmail } from "@/lib/workflow";
import { overdueNoticeEmail } from "@/lib/email-templates";
import { createNotification } from "@/lib/notifications";
import redis from "@/database/redis";

export interface OverdueProcessResult {
  success: boolean;
  totalOverdue: number;
  notifiedCount: number;
  skippedCount: number;
  errorCount: number;
  details: Array<{
    recordId: string;
    userId: string;
    userEmail: string;
    userName: string;
    bookTitle: string;
    dueDate: string;
    overdueDays: number;
    estimatedFine: number;
    notified: boolean;
    reason?: string;
  }>;
  message?: string;
  error?: string;
}

/**
 * Scan all active borrow records in the database, detect overdue records,
 * and dispatch automated email + in-app real-time notifications.
 *
 * @param force If true, ignores daily Redis rate-limiting deduplication.
 */
export const checkAndNotifyOverdueBorrows = async ({
  force = false,
}: { force?: boolean } = {}): Promise<OverdueProcessResult> => {
  try {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10); // YYYY-MM-DD (UTC)

    // Find all active borrows where dueDate < today
    const overdueList = await db
      .select({
        recordId: borrowRecords.id,
        borrowDate: borrowRecords.borrowDate,
        dueDate: borrowRecords.dueDate,
        userId: users.id,
        userName: users.fullName,
        userEmail: users.email,
        bookId: books.id,
        bookTitle: books.title,
      })
      .from(borrowRecords)
      .innerJoin(users, eq(borrowRecords.userId, users.id))
      .innerJoin(books, eq(borrowRecords.bookId, books.id))
      .where(
        and(
          eq(borrowRecords.status, "BORROWED"),
          lt(borrowRecords.dueDate, todayStr),
        ),
      );

    const totalOverdue = overdueList.length;
    let notifiedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    const details: OverdueProcessResult["details"] = [];

    const todayDateMidnight = new Date(todayStr).getTime();

    for (const record of overdueList) {
      const recordDueDateMidnight = new Date(record.dueDate).getTime();
      const diffMs = todayDateMidnight - recordDueDateMidnight;
      const overdueDays = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      const estimatedFine = overdueDays * 5000; // 5,000 VND / day

      const borrowDateStr = record.borrowDate
        ? new Date(record.borrowDate).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          })
        : undefined;

      const dueDateStr = new Date(record.dueDate).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });

      // Deduplication key per record & day: avoid duplicate emails on the same day
      const redisKey = `overdue_notified:${record.recordId}:${todayStr}`;

      if (!force) {
        try {
          const alreadyNotified = await redis.get(redisKey);
          if (alreadyNotified) {
            skippedCount++;
            details.push({
              recordId: record.recordId,
              userId: record.userId,
              userEmail: record.userEmail,
              userName: record.userName,
              bookTitle: record.bookTitle,
              dueDate: record.dueDate,
              overdueDays,
              estimatedFine,
              notified: false,
              reason: "Already notified today",
            });
            continue;
          }
        } catch (cacheErr) {
          // If Redis check fails, proceed with notification
          console.warn("Redis check error during overdue check:", cacheErr);
        }
      }

      try {
        // 1. Send Overdue Email
        if (record.userEmail) {
          await sendEmail({
            email: record.userEmail,
            subject: `⚠️ Urgent: Overdue Notice for "${record.bookTitle}"`,
            message: overdueNoticeEmail({
              fullName: record.userName,
              bookTitle: record.bookTitle,
              borrowDate: borrowDateStr,
              dueDate: dueDateStr,
              overdueDays,
              estimatedFine,
            }),
          });
        }

        // 2. Create In-App Notification (also broadcasts real-time via Socket.IO)
        await createNotification({
          userId: record.userId,
          title: "Book Return Overdue ⚠️",
          message: `The book "${record.bookTitle}" is overdue by ${overdueDays} ${overdueDays === 1 ? "day" : "days"} (due ${dueDateStr}). Estimated late fine: ${estimatedFine.toLocaleString("vi-VN")} VND. Please return it to the library.`,
          type: "OVERDUE",
          link: "/my-profile",
        });

        // 3. Mark as notified today in Redis with 24-hour expiration
        try {
          await redis.set(redisKey, "true", { ex: 86400 });
        } catch (cacheSetErr) {
          console.warn("Failed to set Redis key for overdue notification:", cacheSetErr);
        }

        notifiedCount++;
        details.push({
          recordId: record.recordId,
          userId: record.userId,
          userEmail: record.userEmail,
          userName: record.userName,
          bookTitle: record.bookTitle,
          dueDate: record.dueDate,
          overdueDays,
          estimatedFine,
          notified: true,
        });
      } catch (sendErr) {
        console.error(`Failed to notify user ${record.userEmail} for record ${record.recordId}:`, sendErr);
        errorCount++;
        details.push({
          recordId: record.recordId,
          userId: record.userId,
          userEmail: record.userEmail,
          userName: record.userName,
          bookTitle: record.bookTitle,
          dueDate: record.dueDate,
          overdueDays,
          estimatedFine,
          notified: false,
          reason: "Failed to dispatch email or in-app notification",
        });
      }
    }

    return {
      success: true,
      totalOverdue,
      notifiedCount,
      skippedCount,
      errorCount,
      details,
      message: `Scanned ${totalOverdue} overdue records: ${notifiedCount} notified, ${skippedCount} skipped (already sent today), ${errorCount} errors.`,
    };
  } catch (error: any) {
    console.error("Error in checkAndNotifyOverdueBorrows:", error);
    return {
      success: false,
      totalOverdue: 0,
      notifiedCount: 0,
      skippedCount: 0,
      errorCount: 1,
      details: [],
      error: error?.message || "Failed to process overdue borrows",
    };
  }
};
