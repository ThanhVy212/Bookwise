"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import FileUpload from "@/components/FileUpload";
import ColorPicker from "@/components/admin/ColorPicker";
import { BookFormValues, bookSchema } from "@/lib/validations";
import { createBook } from "@/lib/actions/book.actions";
import { toast } from "@/components/ui/toast";

interface Props extends Partial<BookFormValues> {
  type?: "create" | "update";
}

const BookForm = ({ type = "create", ...book }: Props) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: book.title ?? "",
      description: book.description ?? "",
      author: book.author ?? "",
      genre: book.genre ?? "",
      rating: book.rating ?? 4,
      totalCopies: book.totalCopies ?? 1,
      coverUrl: book.coverUrl ?? "",
      coverColor: book.coverColor ?? "#000000",
      videoUrl: book.videoUrl ?? "",
      summary: book.summary ?? "",
    },
  });

  const onSubmit = async (values: BookFormValues) => {
    if (loading) return;
    setLoading(true);

    const loadingToast = toast.add({
      type: "loading",
      title: type === "create" ? "Creating Book..." : "Updating Book...",
      description: "Please wait while we save your book details.",
    });

    try {
      const result = await createBook(values);

      if (result.success) {
        toast.update(loadingToast, {
          type: "success",
          title: "Success",
          description:
            type === "create"
              ? "Book created successfully."
              : "Book updated successfully.",
        });

        if (type === "create" && result.data?.id) {
          router.push(`/admin/books/${result.data.id}`);
        } else {
          router.push("/admin/books");
        }
      } else {
        toast.update(loadingToast, {
          type: "error",
          title: "Error",
          description: result.message || "Something went wrong.",
        });
      }
    } catch (error) {
      console.error("Book form submission error:", error);
      toast.update(loadingToast, {
        type: "error",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1">
              <FormLabel className="text-base font-semibold text-dark-400">
                Book Title
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter the book title"
                  {...field}
                  className="book-form_input"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="author"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1">
              <FormLabel className="text-base font-semibold text-dark-400">
                Author
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter the author name"
                  {...field}
                  className="book-form_input"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="genre"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1">
              <FormLabel className="text-base font-semibold text-dark-400">
                Genre
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter the genre of the book"
                  {...field}
                  className="book-form_input"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="totalCopies"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1">
              <FormLabel className="text-base font-semibold text-dark-400">
                Total number of books
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={10000}
                  placeholder="Enter the total number of books"
                  className="book-form_input"
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    field.onChange(val === "" ? undefined : Number(val));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="coverUrl"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1">
              <FormLabel className="text-base font-semibold text-dark-400">
                Book Image
              </FormLabel>
              <FormControl>
                <FileUpload
                  type="image"
                  accept="image/*"
                  placeholder="Upload an image"
                  folder="books/covers"
                  variant="light"
                  onFileChange={field.onChange}
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="coverColor"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1">
              <FormLabel className="text-base font-semibold text-dark-400">
                Book Primary Color
              </FormLabel>
              <FormControl>
                <ColorPicker
                  onPickerChange={field.onChange}
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="videoUrl"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1">
              <FormLabel className="text-base font-semibold text-dark-400">
                Book Video
              </FormLabel>
              <FormControl>
                <FileUpload
                  type="video"
                  accept="video/*"
                  placeholder="Upload a video"
                  folder="books/videos"
                  variant="light"
                  onFileChange={field.onChange}
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1">
              <FormLabel className="text-base font-semibold text-dark-400">
                Book Description
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Write a detailed description of the book"
                  rows={5}
                  {...field}
                  className="book-form_input"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="summary"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1">
              <FormLabel className="text-base font-semibold text-dark-400">
                Book Summary
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Write a brief summary of the book"
                  rows={5}
                  {...field}
                  className="book-form_input"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="book-form_btn admin-btn text-white"
          disabled={loading}
        >
          {loading
            ? "Processing..."
            : type === "create"
              ? "Create Book"
              : "Update Book"}
        </Button>
      </form>
    </Form>
  );
};

export default BookForm;
