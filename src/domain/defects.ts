import type { DefectType } from "@/types/models";

/** Canonical ordered list of allowed defect labels. */
export const DEFECT_TYPES: readonly DefectType[] = [
  "Scratch",
  "Dent",
  "Paint Issue",
  "Missing Component",
  "No Defect",
] as const;

/**
 * Returns true when the value is a member of the fixed defect taxonomy.
 */
export function isDefectType(value: string): value is DefectType {
  return (DEFECT_TYPES as readonly string[]).includes(value);
}

/**
 * Derives whether the human final label differs from the AI prediction.
 * A null AI prediction always counts as overridden once a final value exists.
 */
export function wasOverridden(
  aiPredicted: DefectType | null,
  finalDefect: DefectType,
): boolean {
  if (aiPredicted === null) {
    return true;
  }
  return aiPredicted !== finalDefect;
}
