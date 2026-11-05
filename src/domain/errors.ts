type ErrorMessageKey =
  | "unauthorized"
  | "forbidden"
  | "invalidInput"
  | "batchNotFound"
  | "batchExists"
  | "unsupportedImage"
  | "missingApiKey"
  | "visionFailed"
  | "predictionInvalid"
  | "generic";

/**
 * Maps API error codes to `Errors` keys in messages/en.json.
 */
export function errorTranslationKey(code: string): ErrorMessageKey {
  switch (code) {
    case "UNAUTHORIZED":
      return "unauthorized";
    case "FORBIDDEN":
      return "forbidden";
    case "INVALID_INPUT":
      return "invalidInput";
    case "BATCH_NOT_FOUND":
      return "batchNotFound";
    case "BATCH_EXISTS":
      return "batchExists";
    case "UNSUPPORTED_IMAGE":
      return "unsupportedImage";
    case "MISSING_API_KEY":
      return "missingApiKey";
    case "VISION_FAILED":
      return "visionFailed";
    case "PREDICTION_INVALID":
      return "predictionInvalid";
    default:
      return "generic";
  }
}
