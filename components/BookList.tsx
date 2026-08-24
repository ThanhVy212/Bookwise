import BookCard from "@/components/BookCard";

const BookList = ({ title, books, className }: BookListProps) => {
  return (
    <section className={className}>
      <h2 className="font-semibold text-4xl text-light-100">{title}</h2>

      <ul className="book-list">
        {books.map((book: Book) => (
          <BookCard key={book.id} {...book} />
        ))}
      </ul>
    </section>
  );
};
export default BookList;
