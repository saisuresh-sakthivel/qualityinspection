import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { DefectType } from "@/types/models";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

export interface PendingClassification {
  imageId: string;
  imagePath: string;
  batchId: string;
  inspectorId: string;
  aiPredictedDefectType: DefectType | null;
  aiConfidence: number | null;
}

const MIME_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

/**
 * Returns a safe extension for accepted image types.
 */
export function extensionForMime(mimeType: string): string | null {
  return MIME_EXT[mimeType] ?? null;
}

/**
 * Writes the uploaded image and the AI result beside it.
 * The JSON file is the source of truth at save time so the client cannot rewrite the prediction.
 */
export async function storePendingClassification(
  bytes: Buffer,
  mimeType: string,
  pending: Omit<PendingClassification, "imageId" | "imagePath">,
): Promise<PendingClassification> {
  const extension = extensionForMime(mimeType);
  if (!extension) {
    throw new Error("UNSUPPORTED_IMAGE");
  }

  const imageId = randomUUID();
  const filename = `${imageId}${extension}`;
  const imagePath = path.posix.join("uploads", filename);
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, filename), bytes);
  const record: PendingClassification = { ...pending, imageId, imagePath };
  await writeFile(
    path.join(UPLOAD_DIR, `${imageId}.json`),
    JSON.stringify(record),
  );
  return record;
}

/**
 * Loads the classification captured at upload time. Rejects path tricks.
 */
export async function readPendingClassification(
  imageId: string,
): Promise<PendingClassification | null> {
  if (!/^[0-9a-f-]{36}$/i.test(imageId)) {
    return null;
  }

  try {
    const raw = await readFile(
      path.join(UPLOAD_DIR, `${imageId}.json`),
      "utf8",
    );
    return JSON.parse(raw) as PendingClassification;
  } catch {
    return null;
  }
}
