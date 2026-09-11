import React from "react";
import BookList from "@/components/BookList";
import { sampleBooks } from "@/constants";
import LogoutButton from "@/components/LogoutButton";

const Page = () => {
  return (
    <>
      <LogoutButton />

      <BookList title="Borrowed Books" books={sampleBooks} />
    </>
  );
};
export default Page;
