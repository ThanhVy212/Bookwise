import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { eq } from "drizzle-orm";
import { Ratelimit } from "@upstash/ratelimit";
import { db } from "@/database/drizzle";
import redis from "@/database/redis";
import { borrowRecords } from "@/database/schema";
import { auth } from "@/auth";
import config from "@/lib/config";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const RATE_LIMIT_MAX = 30;

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(RATE_LIMIT_MAX, "1m"),
  analytics: true,
  prefix: "@upstash/ratelimit:qr",
});

async function getRateLimitKey(): Promise<string> {
  const session = await auth();
  if (session?.user?.id) return `user:${session.user.id}`;

  // x-forwarded-for is client-controlled unless a trusted proxy sets it, and
  // no trusted proxy is configured here, so anonymous requests share a bucket.
  return "anonymous";
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ recordId: string }> },
) {
  const { success } = await ratelimit.limit(await getRateLimitKey());

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  const { recordId } = await params;

  if (!UUID_PATTERN.test(recordId)) {
    return NextResponse.json({ error: "Invalid receipt id." }, { status: 400 });
  }

  try {
    const [record] = await db
      .select({ id: borrowRecords.id })
      .from(borrowRecords)
      .where(eq(borrowRecords.id, recordId))
      .limit(1);

    if (!record) {
      return NextResponse.json({ error: "Receipt not found." }, { status: 404 });
    }

    const scanUrl = `${config.env.baseUrl}/scan/${record.id}`;
    const dataUrl = await QRCode.toDataURL(scanUrl, {
      margin: 1,
      width: 320,
      errorCorrectionLevel: "M",
      color: { dark: "#16191E", light: "#FFFFFF" },
    });

    const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);

    return new NextResponse(Buffer.from(base64, "base64"), {
      headers: {
        "content-type": "image/png",
        "cache-control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("QR generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate QR code." },
      { status: 500 },
    );
  }
}
