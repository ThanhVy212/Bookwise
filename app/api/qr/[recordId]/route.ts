import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { eq } from "drizzle-orm";
import { Ratelimit } from "@upstash/ratelimit";
import { db } from "@/database/drizzle";
import redis from "@/database/redis";
import { borrowRecords, users } from "@/database/schema";
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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ recordId: string }> },
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { success } = await ratelimit.limit(`user:${session.user.id}`);

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
      .select({ id: borrowRecords.id, userId: borrowRecords.userId })
      .from(borrowRecords)
      .where(eq(borrowRecords.id, recordId))
      .limit(1);

    if (!record) {
      return NextResponse.json({ error: "Receipt not found." }, { status: 404 });
    }

    if (record.userId !== session.user.id) {
      const [actingUser] = await db
        .select({ role: users.role })
        .from(users)
        .where(eq(users.id, session.user.id))
        .limit(1);

      if (actingUser?.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
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
        "cache-control": "private, max-age=86400",
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
