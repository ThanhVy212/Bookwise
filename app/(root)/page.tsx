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

  if (lastestBooks.length === 0) {
    return (
      <section className="flex flex-col items-center justify-center rounded-3xl bg-dark-300/40 p-16 text-center border border-light-100/5">
        <h2 className="text-2xl font-bold text-white">No books available</h2>
        <p className="mt-3 text-base text-light-100 max-w-md leading-relaxed">
          The library catalog is empty. Check back later for new additions.
        </p>
      </section>
    );
  }

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
