import { NextResponse } from "next/server";
import { errorResponse, makeAppApiCall } from "@/lib/api";
import { getPrisma } from "@/lib/db";
import { readStoredImage } from "@/lib/uploads";

interface ImageRouteProps {
  params: Promise<{ id: string }>;
}

/**
 * Serves an inspection photo to a signed-in user. The file never leaves uploads/.
 * Both roles may read it. The wrapper still requires a session.
 */
export const GET = makeAppApiCall<ImageRouteProps>("read", async (_user, _request, context) => {
  const { id } = await context.params;
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
});
