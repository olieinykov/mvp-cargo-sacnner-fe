import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuditsQuery } from '../api/audits';
import type { AuditFilters, Pagination } from '../api/audits';

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
  id?: string;
  bol: SlotResult;
  marker: SlotResult;
  cargo: SlotResult;
  audit: AuditResult;
  /** Populated by POST /audit — images with their detected slot type */
  auditImages?: AuditImage[];
};

// ─── Audit image ───────────────────────────────────────────────────────────────

/** Slot types that an image can belong to */
export type AuditImageType = 'bol' | 'placard' | 'cargo';

export type AuditImage = {
  url: string;
  /** Which section this image was classified into by Claude */
  type: AuditImageType;
};

// ─── Stored record ─────────────────────────────────────────────────────────────

export type StoredAudit = {
  id: string;
  createdAt: string;
  response: ServerAuditResponse;
  /** Images uploaded for this audit, tagged by their detected slot type */
  auditImages: AuditImage[];
};

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useAuditStore(auditorId: string) {
  const queryClient = useQueryClient();

  const [page,    setPage]    = useState(1);
  const [limit,   setLimit]   = useState(20);
  const [filters, setFilters] = useState<AuditFilters>({
    sortBy:    'date',
    sortOrder: 'desc',
  });

  const { data, isLoading: loading, error } =
    useAuditsQuery(page, limit, auditorId, filters);

  const updateFilters = useCallback((next: Partial<AuditFilters>) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, ...next }));
  }, []);

  const changeLimit = useCallback((newLimit: number) => {
    setPage(1);
    setLimit(newLimit);
  }, []);

  const audits: StoredAudit[]            = data?.audits     ?? [];
  const pagination: Pagination | undefined = data?.pagination;

  const addAudit = useCallback((response: ServerAuditResponse): StoredAudit => {
    const record: StoredAudit = {
      id:          response.id ?? crypto.randomUUID(),
      createdAt:   new Date().toISOString(),
      response,
      auditImages: response.auditImages ?? [],
    };
    queryClient.invalidateQueries({ queryKey: ['audits'] });
    return record;
  }, [queryClient]);

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['audits'] });
  }, [queryClient]);

  return {
    audits,
    loading,
    error:      error ? (error as Error).message : null,
    pagination,
    page,
    limit,
    filters,
    setPage,
    changeLimit,
    updateFilters,
    addAudit,
    refetch,
  };
}