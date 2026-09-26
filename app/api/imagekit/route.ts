import ImageKit from "@imagekit/nodejs";
import config from "@/lib/config";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";

const imageKit = new ImageKit({
  privateKey: config.env.imagekit.privateKey,
});

const ALLOWED_FOLDERS = [
  "university-cards",
  "books/covers",
  "books/videos",
  "books",
  "avatars",
];
const ADMIN_ONLY_FOLDERS = ["books/covers", "books/videos", "books"];
// Sign-up runs before a session exists, so this folder stays public
// (still covered by the IP rate limit below).
const PUBLIC_FOLDERS = ["university-cards"];
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;
const ALLOWED_MIME_PREFIXES = ["image/", "video/"];
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;

const rateLimitStore = new Map<string, { count: number; windowStart: number }>();

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now - record.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(ip, { count: 1, windowStart: now });
    return false;
  }

  record.count++;

  if (record.count > RATE_LIMIT_MAX) {
    return true;
  }

  return false;
}

export async function GET(request: Request) {
  const session = await auth();
  const ip = getClientIp(request);

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  const { searchParams } = new URL(request.url);
  const folder = searchParams.get("folder");

  if (!folder || !ALLOWED_FOLDERS.includes(folder)) {
    return NextResponse.json(
      { error: "Invalid or missing folder parameter." },
      { status: 400 },
    );
  }

  if (!session?.user?.id && !PUBLIC_FOLDERS.includes(folder)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session?.user?.id && ADMIN_ONLY_FOLDERS.includes(folder)) {
    const [actingUser] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (actingUser?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  try {
    const authenticationParameters =
      imageKit.helper.getAuthenticationParameters();

    return NextResponse.json({
      ...authenticationParameters,
      folder,
      maxSize: MAX_FILE_SIZE_BYTES,
      acceptedTypes: ALLOWED_MIME_PREFIXES,
    });
  } catch (error) {
    console.error("ImageKit authentication error:", error);

    return NextResponse.json(
      { error: "Failed to authenticate with ImageKit" },
      { status: 500 },
    );
  }
}
