import type { ExtractedField, OtherNote } from "./useAuditStore";

export function isExtractedField(v: unknown): v is ExtractedField {
  return (
    typeof v === 'object' && v !== null && !Array.isArray(v) &&
    'mainValue' in v && 'meaning' in v
  );
}

export function isOtherNotes(v: unknown): v is OtherNote[] {
  return Array.isArray(v);
}