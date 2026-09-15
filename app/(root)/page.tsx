import BookOverview from "@/components/BookOverview";
import BookList from "@/components/BookList";
import { auth } from "@/auth";
import { db } from "@/database/drizzle";
import { books } from "@/database/schema";
import { desc } from "drizzle-orm";

const Home = async () => {
  const session = await auth();

  const lastestBooks = (await db
    .select()
    .from(books)
    .limit(13)
    .orderBy(desc(books.createdAt))) as Book[];

  return (
    <>
      <BookOverview {...lastestBooks[0]} userId={session?.user?.id as string} />

      <BookList
        title="Latest Books"
        books={lastestBooks.slice(1)}
        className="mt-28"
      />
    </>
  );
};

export default Home;
