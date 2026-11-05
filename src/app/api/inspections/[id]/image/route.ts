import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { getPrisma } from "@/lib/db";
import { readStoredImage } from "@/lib/uploads";

interface ImageRouteProps {
  params: Promise<{ id: string }>;
}

/**
 * Serves an inspection photo to a signed-in user. The file never leaves uploads/.
 */
export async function GET(_request: Request, { params }: ImageRouteProps): Promise<NextResponse> {
  const user = await getCurrentUser();
  if (!user) {
    return errorResponse(401, "UNAUTHORIZED");
  }

  const { id } = await params;
  const inspection = await getPrisma().inspection.findUnique({
    where: { id },
    select: { imagePath: true },
  });
  if (!inspection) {
    return errorResponse(404, "NOT_FOUND");
  }

  const file = await readStoredImage(inspection.imagePath);
  if (!file) {
    return errorResponse(404, "NOT_FOUND");
  }

  return new NextResponse(new Uint8Array(file.bytes), {
    headers: {
      "Content-Type": file.mimeType,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
