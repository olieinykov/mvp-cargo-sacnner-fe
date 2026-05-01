import type { ExtractedField, OtherNote } from './useAuditStore';

export function isExtractedField(v: unknown): v is ExtractedField {
  return (
    typeof v === 'object' && v !== null && !Array.isArray(v) && 'mainValue' in v && 'meaning' in v
  );
}

export function isOtherNotes(v: unknown): v is OtherNote[] {
  return Array.isArray(v);
}

export function validateCompanyForm(values: { name: string; dotNumber: string; mcNumber: string }) {
  const errors: Partial<typeof values> = {};
  if (!values.name.trim()) errors.name = 'Company name is required.';
  if (!values.dotNumber.trim()) errors.dotNumber = 'DOT number is required.';
  else if (!/^[0-9]+$/.test(values.dotNumber.trim()))
    errors.dotNumber = 'DOT number must contain only digits.';
  if (values.mcNumber.trim() && !/^[0-9]+$/.test(values.mcNumber.trim()))
    errors.mcNumber = 'MC number must contain only digits.';
  return errors;
}
