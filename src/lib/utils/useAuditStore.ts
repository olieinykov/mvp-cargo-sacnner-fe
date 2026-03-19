import { useState, useCallback } from 'react';

// ─── Server response types ─────────────────────────────────────────────────────

export type Severity = 'CRITICAL' | 'MAJOR' | 'MINOR' | 'WARNING';

export type AuditIssue = {
  source: 'BOL' | 'PLACARD' | 'CARGO' | 'CROSS';
  severity: Severity;
  cfr: string | null;
  check: string;
  message: string;
  fix: string | null;
};

export type AuditCounts = {
  critical: number;
  major: number;
  minor: number;
  warning: number;
};

export type AuditResult = {
  is_passed: boolean;
  score: number;
  issues: AuditIssue[];
  counts: AuditCounts;
  placardRecommendations: string[];
  summary: string;
};

export type ExtractedField = {
  mainValue: string | boolean | null;
  meaning: string;
};

export type OtherNote = {
  sign_name: string;
  meaning: string;
};

export type SlotExtracted = Record<string, ExtractedField | OtherNote[]>;

export type SlotResult = {
  slotName: string;
  extracted: SlotExtracted;
  confidence: { overall: number; fields: Record<string, number> };
  notes: string[];
};

export type ServerAuditResponse = {
  bol: SlotResult;
  marker: SlotResult;
  cargo: SlotResult;
  exterier: SlotResult;
  audit: AuditResult;
};

// ─── Stored record ─────────────────────────────────────────────────────────────

export type StoredAudit = {
  id: string;
  createdAt: string; // ISO string
  response: ServerAuditResponse;
};

// ─── localStorage ──────────────────────────────────────────────────────────────

const STORAGE_KEY = 'hazmat_audits';

function loadFromStorage(): StoredAudit[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown[]) : [];
    // Guard: drop any records that don't have the expected shape
    return parsed.filter(
      (item): item is StoredAudit =>
        typeof item === 'object' &&
        item !== null &&
        'response' in item &&
        typeof (item as StoredAudit).response === 'object' &&
        (item as StoredAudit).response !== null,
    );
  } catch {
    return [];
  }
}

function saveToStorage(audits: StoredAudit[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(audits));
  } catch {
    // quota exceeded — silently ignore
  }
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useAuditStore() {
  const [audits, setAudits] = useState<StoredAudit[]>(loadFromStorage);

  const addAudit = useCallback((response: ServerAuditResponse): StoredAudit => {
    const record: StoredAudit = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      response,
    };
    setAudits((prev) => {
      const next = [record, ...prev];
      saveToStorage(next);
      return next;
    });
    return record;
  }, []);

  const clearAudits = useCallback(() => {
    setAudits([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { audits, addAudit, clearAudits };
}