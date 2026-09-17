import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import BookForm from "@/components/admin/forms/BookForm";
import { getBookById } from "@/lib/actions/book.actions";

const EditBookPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const result = await getBookById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const book = result.data;

  return (
    <>
      <Button className="back-btn admin-btn" asChild>
        <Link href={`/admin/books/${id}`}>Go back</Link>
      </Button>

      <section className="w-full max-w-2xl">
        <BookForm type="update" bookId={book.id} {...book} />
      </section>
    </>
  );
};

export default EditBookPage;
