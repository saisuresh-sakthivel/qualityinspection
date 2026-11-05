import type { DefectType } from "@/types/models";

/** Canonical ordered list of allowed defect labels. */
export const DEFECT_TYPES: readonly DefectType[] = [
  "Scratch",
  "Dent",
  "Paint Issue",
  "Missing Component",
  "No Defect",
] as const;

const DEFECT_ALIASES: Record<string, DefectType> = {
  scratch: "Scratch",
  dent: "Dent",
  "paint issue": "Paint Issue",
  paint: "Paint Issue",
  discoloration: "Paint Issue",
  "missing component": "Missing Component",
  missing: "Missing Component",
  "no defect": "No Defect",
  none: "No Defect",
  pass: "No Defect",
  passed: "No Defect",
};

/**
 * Returns true when the value is a member of the fixed defect taxonomy.
 */
export function isDefectType(value: string): value is DefectType {
  return (DEFECT_TYPES as readonly string[]).includes(value);
}

/**
 * Maps model free text onto the fixed taxonomy.
 * Unknown labels return null so the caller can retry or force a human pick.
 */
export function normalizeDefectLabel(raw: string): DefectType | null {
  const key = raw.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
  if (isDefectType(raw.trim())) {
    return raw.trim() as DefectType;
  }
  return DEFECT_ALIASES[key] ?? null;
}

/**
 * Derives whether the human final label differs from the AI prediction.
 * A null AI prediction always counts as overridden once a final value exists.
 */
export function wasOverridden(aiPredicted: DefectType | null, finalDefect: DefectType): boolean {
  if (aiPredicted === null) {
    return true;
  }
  return aiPredicted !== finalDefect;
}
