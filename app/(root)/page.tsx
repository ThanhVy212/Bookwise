import BookOverview from "@/components/BookOverview";
import BookList from "@/components/BookList";
import { auth } from "@/auth";
import { db } from "@/database/drizzle";
import { books } from "@/database/schema";
import { desc } from "drizzle-orm";
import { getUserWishlistBookIds } from "@/lib/actions/book.actions";

const Home = async () => {
  const session = await auth();

  const [lastestBooks, popularBooks, wishlistResult] = await Promise.all([
    db
      .select()
      .from(books)
      .limit(13)
      .orderBy(desc(books.createdAt)) as Promise<Book[]>,
    db
      .select()
      .from(books)
      .limit(6)
      .orderBy(desc(books.rating), desc(books.createdAt)) as Promise<Book[]>,
    session?.user?.id ? getUserWishlistBookIds() : Promise.resolve({ success: true, data: [] as string[] }),
  ]);

  const wishlistBookIds = wishlistResult.data || [];

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

  const featuredBook = lastestBooks[0];

  return (
    <>
      <BookOverview
        {...featuredBook}
        userId={session?.user?.id as string}
        isWishlisted={wishlistBookIds.includes(featuredBook.id)}
      />

      <BookList
        title="Popular Books"
        books={popularBooks}
        wishlistBookIds={wishlistBookIds}
        className="mt-28"
      />

      <BookList
        title="Latest Books"
        books={lastestBooks.slice(1)}
        wishlistBookIds={wishlistBookIds}
        className="mt-24"
      />
    </>
  );
};

export default Home;

