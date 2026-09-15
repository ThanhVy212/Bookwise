import { redirect } from "next/navigation";

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LibraryPage({ searchParams }: Props) {
  const params = await searchParams;
  const queryString = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") {
      queryString.set(key, value);
    }
  }

  const query = queryString.toString();
  redirect(query ? `/search?${query}` : "/search");
}
