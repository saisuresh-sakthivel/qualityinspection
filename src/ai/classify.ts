import { parseVisionPrediction } from "@/ai/parse";
import type { VisionPrediction } from "@/types/models";

const MODEL = "gpt-4o-mini";

const SYSTEM_PROMPT = `You classify photos of manufactured units for a quality inspection.
Return JSON only with this shape:
{"predicted_defect_type":"Scratch|Dent|Paint Issue|Missing Component|No Defect","confidence":0.0}
Use exactly one of those labels. confidence is a number from 0 to 1.
If the unit looks acceptable, use "No Defect".`;

interface ChatResponse {
  choices?: Array<{ message?: { content?: string | null } }>;
}

/**
 * Calls the vision model once and returns the raw text content.
 */
async function requestClassification(
  imageDataUrl: string,
  repairNote?: string,
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("MISSING_API_KEY");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(25_000),
    body: JSON.stringify({
      model: MODEL,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: repairNote
                ? `${repairNote} Classify this unit photo.`
                : "Classify this unit photo.",
            },
            { type: "image_url", image_url: { url: imageDataUrl } },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error("VISION_FAILED");
  }

  const body = (await response.json()) as ChatResponse;
  const content = body.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("VISION_FAILED");
  }
  return content;
}

/**
 * Classifies an image into the defect taxonomy.
 * Retries once when the first reply is not valid JSON in the taxonomy.
 */
export async function classifyUnitImage(
  bytes: Buffer,
  mimeType: string,
): Promise<VisionPrediction | null> {
  const dataUrl = `data:${mimeType};base64,${bytes.toString("base64")}`;
  const first = await requestClassification(dataUrl);
  const parsed = parseVisionPrediction(first);
  if (parsed) {
    return parsed;
  }

  const second = await requestClassification(
    dataUrl,
    "Your previous reply was invalid. Return only the JSON object with an exact defect label.",
  );
  return parseVisionPrediction(second);
}
