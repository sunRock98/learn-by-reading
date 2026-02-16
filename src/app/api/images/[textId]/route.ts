import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

/**
 * Serves stored images from the database.
 * Images are stored as binary data (Bytes) to avoid OpenAI's temporary URL expiration.
 * Includes aggressive caching headers since generated images never change.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ textId: string }> }
) {
  const { textId } = await params;
  const id = parseInt(textId, 10);

  if (isNaN(id)) {
    return new NextResponse("Invalid text ID", { status: 400 });
  }

  const text = await db.text.findUnique({
    where: { id },
    select: { picture_data: true },
  });

  if (!text?.picture_data) {
    return new NextResponse("Image not found", { status: 404 });
  }

  return new NextResponse(text.picture_data, {
    headers: {
      "Content-Type": "image/png",
      // Cache for 1 year -- generated images never change
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
