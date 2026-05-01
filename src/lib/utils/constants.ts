import type { AuditImageType, Severity } from "./useAuditStore";

export const BADGE = 'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium leading-none ring-1 ring-inset';

export const SEVERITY_CONFIG: Record<
  Severity,
  { color: string; bg: string; border: string; dot: string; bar: string; badgeRing: string }
> = {
  CRITICAL: {
    color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200',
    dot: 'bg-red-500', bar: 'bg-red-500', badgeRing: 'ring-red-600/20',
  },
  MAJOR: {
    color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200',
    dot: 'bg-orange-500', bar: 'bg-orange-500', badgeRing: 'ring-orange-600/20',
  },
  MINOR: {
    color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200',
    dot: 'bg-yellow-400', bar: 'bg-yellow-400', badgeRing: 'ring-yellow-600/20',
  },
  WARNING: {
    color: 'text-sky-700', bg: 'bg-sky-50', border: 'border-sky-200',
    dot: 'bg-sky-400', bar: 'bg-sky-400', badgeRing: 'ring-sky-600/20',
  },
};

export const SLOT_TO_IMAGE_TYPE: Record<string, AuditImageType> = {
  bol:    'bol',
  marker: 'placard',
  cargo:  'cargo',
  seal:   'seal',
};

export const IMAGE_TYPE_LABEL: Record<AuditImageType, string> = {
  bol:     'BOL',
  placard: 'Placard',
  cargo:   'Cargo',
  seal:    'Seal',
};

export const INSP_LEVEL_LABELS: Record<number, string> = {
  1: 'Full',
  2: 'Walk-Around',
  3: 'Driver-Only',
  4: 'Special Study',
  5: 'Terminal',
  99: 'Invalid',
};

export const CI_STATUS_LABELS: Record<string, string> = {
  U: 'Unprocessed',
  T: 'To Census Search',
  C: 'Complete',
  D: 'Duplicate',
  N: 'Non-match',
  H: 'FMCSA Hold',
  I: 'Intrastate',
  P: 'Potential Resolution',
  X: 'Non-motor carrier',
};