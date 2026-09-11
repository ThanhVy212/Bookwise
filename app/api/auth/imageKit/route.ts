import ImageKit from "@imagekit/nodejs";
import config from "@/lib/config";
import { NextResponse } from "next/server";

const imageKit = new ImageKit({
  privateKey: config.env.imagekit.privateKey,
});

export async function GET() {
  try {
    const authenticationParameters =
      imageKit.helper.getAuthenticationParameters();

    return NextResponse.json(authenticationParameters);
  } catch (error) {
    console.error("ImageKit authentication error:", error);

    return NextResponse.json(
      { error: "Failed to authenticate with ImageKit" },
      { status: 500 },
    );
  }
}
