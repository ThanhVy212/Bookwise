import type { Metadata } from "next";
import { IBM_Plex_Serif, Mona_Sans } from "next/font/google";

import Providers from "@/components/Providers";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";

const ibmPlexSerif = IBM_Plex_Serif({
  variable: "--font-ibm-plex-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BookWise",
  description:
    "BookWise is a book borrowing university library management solution.",
};
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html
      lang="en"
      className={`${ibmPlexSerif.variable} ${monaSans.variable} relative font-sans h-full antialiased`}
    >
      <SessionProvider session={session}>
        <body className="min-h-full flex flex-col">
          <Providers>
            {children}
          </Providers>
        </body>
      </SessionProvider>
    </html>
  );
}
