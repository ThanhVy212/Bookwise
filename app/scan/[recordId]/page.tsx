import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/database/drizzle";
import { books, borrowRecords, users } from "@/database/schema";
import ScanCheckInOut from "@/components/ScanCheckInOut";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ScanPage = async ({
  params,
}: {
  params: Promise<{ recordId: string }>;
}) => {
  const { recordId } = await params;

  if (!UUID_PATTERN.test(recordId)) notFound();

  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const [actingUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (actingUser?.role !== "ADMIN") redirect("/");

  const [record] = await db
    .select({
      id: borrowRecords.id,
      status: borrowRecords.status,
      borrowDate: borrowRecords.borrowDate,
      dueDate: borrowRecords.dueDate,
      returnDate: borrowRecords.returnDate,
      pickedUpAt: borrowRecords.pickedUpAt,
      renewCount: borrowRecords.renewCount,
      book: {
        title: books.title,
        author: books.author,
        coverUrl: books.coverUrl,
        coverColor: books.coverColor,
        availableCopies: books.availableCopies,
        totalCopies: books.totalCopies,
      },
      user: {
        fullName: users.fullName,
        universityId: users.universityId,
      },
    })
    .from(borrowRecords)
    .innerJoin(books, eq(borrowRecords.bookId, books.id))
    .innerJoin(users, eq(borrowRecords.userId, users.id))
    .where(eq(borrowRecords.id, recordId))
    .limit(1);

  if (!record) notFound();

  return <ScanCheckInOut record={JSON.parse(JSON.stringify(record))} />;
};

export default ScanPage;
