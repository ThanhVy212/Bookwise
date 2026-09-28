import { NextRequest, NextResponse } from "next/server";
import { checkAndNotifyOverdueBorrows } from "@/lib/overdue";

export const dynamic = "force-dynamic";

/**
 * Endpoint for automated cron job execution (e.g. Upstash QStash, Vercel Cron, external cron).
 * Can also be triggered via POST.
 *
 * Headers supported for security:
 * - Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: NextRequest) {
  return handleOverdueCron(request);
}

export async function POST(request: NextRequest) {
  return handleOverdueCron(request);
}

async function handleOverdueCron(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // If CRON_SECRET is configured, enforce Bearer authorization
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const force = searchParams.get("force") === "true";

    const result = await checkAndNotifyOverdueBorrows({ force });

    return NextResponse.json(result, {
      status: result.success ? 200 : 500,
    });
  } catch (error: any) {
    console.error("Cron overdue check error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 },
    );
  }
}
