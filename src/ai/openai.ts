import { parseVisionPrediction } from "@/ai/parse";
import type { VisionPrediction } from "@/types/models";

const MODEL = "gpt-5.6-terra";
const ENDPOINT = "https://api.openai.com/v1/chat/completions";

const SYSTEM_PROMPT = `You classify photos of manufactured units for a quality inspection.
Return JSON only with this shape:
{"predicted_defect_type":"Scratch|Dent|Paint Issue|Missing Component|No Defect","confidence":0.0}
Use exactly one of those labels. confidence is a number from 0 to 1.
If the unit looks acceptable, use "No Defect".`;

interface OpenAIResponse {
  choices?: Array<{
    message?: { content?: string | null };
  }>;
}

/**
 * Calls OpenAI once with the unit photo and returns the raw text content.
 * A non-success status is logged before it becomes VISION_FAILED.
 */
async function requestClassification(
  imageBase64: string,
  mimeType: string,
  repairNote?: string,
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("MISSING_API_KEY");
  }

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    signal: AbortSignal.timeout(25_000),
    body: JSON.stringify({
      model: MODEL,
      reasoning_effort: "none",
      response_format: { type: "json_object" },
      messages: [
        { role: "developer", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: repairNote
                ? `${repairNote} Classify this unit photo.`
                : "Classify this unit photo.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("OpenAI classify failed", response.status, detail.slice(0, 500));
    throw new Error("VISION_FAILED");
  }

  const body = (await response.json()) as OpenAIResponse;
  const content = body.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("VISION_FAILED");
  }
  return content;
}

/**
 * Classifies an image into the defect taxonomy with OpenAI.
 * Same export as the Gemini classifier so the route can swap the import.
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
