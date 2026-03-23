import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuditsQuery } from '../api/audits';
import type { Pagination } from '../api/audits';

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
  exterier: SlotResult;
  audit: AuditResult;
};

// ─── Stored record ─────────────────────────────────────────────────────────────

export type StoredAudit = {
  id: string;
  createdAt: string;
  response: ServerAuditResponse;
};

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useAuditStore() {
  const queryClient = useQueryClient();

  const [page,  setPage]  = useState(1);
  const [limit, setLimit] = useState(20);

  const { data, isLoading: loading, error } = useAuditsQuery(page, limit);

  const audits: StoredAudit[]   = data?.audits     ?? [];
  const pagination: Pagination | undefined = data?.pagination;

  // После POST — инвалидируем кеш чтобы подтянуть актуальные данные
  const addAudit = useCallback((response: ServerAuditResponse): StoredAudit => {
    const record: StoredAudit = {
      id:        response.id ?? crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      response,
    };
    queryClient.invalidateQueries({ queryKey: ['audits'] });
    return record;
  }, [queryClient]);

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['audits'] });
  }, [queryClient]);

  const changeLimit = useCallback((newLimit: number) => {
    setPage(1);
    setLimit(newLimit);
  }, []);

  return {
    audits,
    loading,
    error:      error ? (error as Error).message : null,
    pagination,
    page,
    limit,
    setPage,
    changeLimit,
    addAudit,
    refetch,
  };
}