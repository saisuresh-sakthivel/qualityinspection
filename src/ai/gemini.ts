import { parseVisionPrediction } from "@/ai/parse";
import { VisionProviderError } from "@/domain/errors";
import type { VisionPrediction } from "@/types/models";

const MODEL = "gemini-flash-latest";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const SYSTEM_PROMPT = `You classify photos of manufactured units for a quality inspection.
Return JSON only with this shape:
{"predicted_defect_type":"Scratch|Dent|Paint Issue|Missing Component|No Defect","confidence":0.0}
Use exactly one of those labels. confidence is a number from 0 to 1.
If the unit looks acceptable, use "No Defect".`;

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
}

/**
 * Calls Gemini once with the unit photo and returns the raw text content.
 * A non-success status is logged, then rethrown with Google's JSON body.
 */
async function requestClassification(
  imageBase64: string,
  mimeType: string,
  repairNote?: string,
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("MISSING_API_KEY");
  }

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": apiKey,
    },
    signal: AbortSignal.timeout(28_000),
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: SYSTEM_PROMPT }],
      },
      contents: [
        {
          parts: [
            {
              text: repairNote
                ? `${repairNote} Classify this unit photo.`
                : "Classify this unit photo.",
            },
            {
              inlineData: {
                mimeType,
                data: imageBase64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("Gemini classify failed", response.status, detail.slice(0, 500));
    throw new VisionProviderError(response.status, geminiErrorBody(detail, response.status));
  }

  const body = (await response.json()) as GeminiResponse;
  const content = body.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();
  if (!content) {
    throw new Error("VISION_FAILED");
  }
  return content;
}

/**
 * Keeps Google's error object when the body is JSON.
 * A non-JSON failure still uses the same `{ error: { code, message, status } }` shape.
 */
function geminiErrorBody(detail: string, status: number): unknown {
  try {
    return JSON.parse(detail) as unknown;
  } catch {
    return {
      error: {
        code: status,
        message: detail.slice(0, 500),
        status: "UNKNOWN",
      },
    };
  }
}

/**
 * Classifies an image into the defect taxonomy with Gemini.
 * Retries once when the first reply is not valid JSON in the taxonomy.
 */
export async function classifyUnitImage(
  bytes: Buffer,
  mimeType: string,
): Promise<VisionPrediction | null> {
  const imageBase64 = bytes.toString("base64");
  const first = await requestClassification(imageBase64, mimeType);
  const parsed = parseVisionPrediction(first);
  if (parsed) {
    return parsed;
  }

  const second = await requestClassification(
    imageBase64,
    mimeType,
    "Your previous reply was invalid. Return only the JSON object with an exact defect label.",
  );
  return parseVisionPrediction(second);
}
