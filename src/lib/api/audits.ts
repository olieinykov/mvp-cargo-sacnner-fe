import { useMutation, useQuery } from '@tanstack/react-query';
import type { ServerAuditResponse, StoredAudit } from '../utils/useAuditStore';

const AUDIT_ENDPOINT = `${import.meta.env.VITE_API_URL}/audit`;

// ─── GET all audits ────────────────────────────────────────────────────────────

type PaginatedResponse = {
  data: {
    id: string;
    created_at: string;
    response: ServerAuditResponse;
  }[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};

export type Pagination = PaginatedResponse['pagination'];

const fetchAudits = async (page: number, limit: number): Promise<{ audits: StoredAudit[]; pagination: Pagination }> => {
  const url = new URL(AUDIT_ENDPOINT);
  url.searchParams.set('page',  String(page));
  url.searchParams.set('limit', String(limit));

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error('Failed to fetch audits');
  }

  const json = await response.json() as PaginatedResponse;

  return {
    audits: json.data.map((row) => ({
      id:        row.id,
      createdAt: row.created_at,
      response:  row.response,
    })),
    pagination: json.pagination,
  };
};

export const useAuditsQuery = (page: number, limit: number) =>
  useQuery({
    queryKey: ['audits', page, limit],
    queryFn:  () => fetchAudits(page, limit),
  });

// ─── POST create audit ─────────────────────────────────────────────────────────

export type AuditFilesPayload = {
  bolData: File[];
  placardData: File[];
  intrierData: File[];
  //exterierData: File[];
};

const appendFilesToFormData = (formData: FormData, key: string, files: File[]) => {
  files.forEach((file) => {
    formData.append(key, file);
  });
};

const createAuditRequest = async (payload: AuditFilesPayload): Promise<ServerAuditResponse> => {
  const formData = new FormData();

  appendFilesToFormData(formData, 'bol',      payload.bolData);
  appendFilesToFormData(formData, 'placard',  payload.placardData);
  appendFilesToFormData(formData, 'intrier',  payload.intrierData);
  //appendFilesToFormData(formData, 'exterier', payload.exterierData);

  const response = await fetch(AUDIT_ENDPOINT, {
    method: 'POST',
    body:   formData,
  });

  if (!response.ok) {
    throw new Error('Failed to create audit');
  }

  return response.json() as Promise<ServerAuditResponse>;
};

export const useCreateAuditMutation = () =>
  useMutation({
    mutationFn: createAuditRequest,
  });