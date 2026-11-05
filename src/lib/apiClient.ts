import type { Batch, VisionPrediction } from "@/types/models";

/**
 * Thrown when one of this app's route handlers returns an error status.
 * Callers map `code` to their own UI message.
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
  ) {
    super(code);
    this.name = "ApiError";
  }
}

interface ErrorBody {
  code?: string;
}

interface ClassifyResponse {
  imageId: string;
  prediction: VisionPrediction | null;
  code: string | null;
}

interface SaveInspectionResponse {
  id: string;
}

interface CreateBatchInput {
  id: string;
  productName: string;
  productionLine: string;
}

/**
 * Calls one of this app's route handlers. Non-2xx responses throw ApiError.
 */
async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, init);
  if (!response.ok) {
    let code = "GENERIC";
    try {
      const body = (await response.json()) as ErrorBody;
      if (body.code) {
        code = body.code;
      }
    } catch {
      // A non-JSON body still becomes an ApiError for the caller.
    }
    throw new ApiError(response.status, code);
  }

  return (await response.json()) as T;
}

/**
 * Creates a batch. Quality Engineer only; a supervisor receives 403.
 */
export function createBatch(input: CreateBatchInput): Promise<Batch> {
  return apiFetch<Batch>("/api/batches", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

/**
 * Uploads a unit photo and returns the constrained vision prediction.
 */
export function classifyInspection(formData: FormData): Promise<ClassifyResponse> {
  return apiFetch<ClassifyResponse>("/api/inspections/classify", {
    method: "POST",
    body: formData,
  });
}

/**
 * Saves the human-confirmed inspection for a classified upload.
 */
export function saveInspection(input: {
  imageId: string;
  finalDefectType: string;
  comments: string;
}): Promise<SaveInspectionResponse> {
  return apiFetch<SaveInspectionResponse>("/api/inspections", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}
