import { useMutation, useQuery } from "@tanstack/react-query";
import type { ServerAuditResponse, StoredAudit, AuditImage } from "../utils/useAuditStore";

const AUDIT_ENDPOINT = `http://localhost:3000/api/v1/audit`;
//const AUDIT_ENDPOINT = `${import.meta.env.VITE_API_URL}/audit`;
const AUDIT_UPLOAD_ENDPOINT = `${AUDIT_ENDPOINT}/upload`;

// ─── Helpers ───────────────────────────────────────────────────────────────────

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('accessToken');
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ─── GET all audits ────────────────────────────────────────────────────────────

type PaginatedResponse = {
  data: {
    id: string;
    created_at: string;
    response: ServerAuditResponse;
    auditImages: AuditImage[];
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

export type SortBy = 'date' | 'score';
export type SortOrder = 'asc' | 'desc';
export type AuditStatus = 'passed' | 'failed';

export type AuditFilters = {
  sortBy?: SortBy;
  sortOrder?: SortOrder;
  status?: AuditStatus | '';
  dateFrom?: string;
  dateTo?: string;
};

export type Pagination = PaginatedResponse["pagination"];

const fetchAudits = async (
  page: number,
  limit: number,
  auditorId: string,
  filters: AuditFilters = {},
): Promise<{ audits: StoredAudit[]; pagination: Pagination }> => {
  const url = new URL(AUDIT_ENDPOINT);
  url.searchParams.set('page', String(page));
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('auditorId', auditorId);

  if (filters.sortBy)    url.searchParams.set('sortBy',    filters.sortBy);
  if (filters.sortOrder) url.searchParams.set('sortOrder', filters.sortOrder);
  if (filters.status)    url.searchParams.set('status',    filters.status);
  if (filters.dateFrom)  url.searchParams.set('dateFrom',  filters.dateFrom);
  if (filters.dateTo)    url.searchParams.set('dateTo',    filters.dateTo);

  const response = await fetch(url.toString(), { headers: authHeaders() });
  if (!response.ok) throw new Error('Failed to fetch audits');

  const json = (await response.json()) as PaginatedResponse;
  return {
    audits: json.data.map((row) => ({
      id:          row.id,
      createdAt:   row.created_at,
      response:    row.response,
      auditImages: row.auditImages as AuditImage[],
    })),
    pagination: json.pagination,
  };
};

export const useAuditsQuery = (page: number, limit: number, auditorId: string, filters: AuditFilters = {},) =>
  useQuery({
    queryKey: ["audits", page, limit, filters],
    queryFn: () => fetchAudits(page, limit, auditorId, filters),
    enabled: !!auditorId
  });

// ─── POST /audit/upload ────────────────────────────────────────────────────────

export type UploadedImage = {
  id: string;
  url: string;
};

const uploadImages = async (files: File[]): Promise<UploadedImage[]> => {
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));

  const response = await fetch(AUDIT_UPLOAD_ENDPOINT, {
    method: "POST",
    headers: authHeaders(),   // no Content-Type — browser sets multipart boundary
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload images");
  }

  const json = (await response.json()) as { images: UploadedImage[] };
  return json.images;
};

export const useUploadImagesMutation = () =>
  useMutation({ mutationFn: uploadImages });

// ─── POST /audit ───────────────────────────────────────────────────────────────

export type AuditPayload = {
  imageIds: string[];
  auditorId: string;
};

const createAuditRequest = async (
  payload: AuditPayload,
): Promise<ServerAuditResponse> => {
  const response = await fetch(AUDIT_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to create audit");
  }

  return response.json() as Promise<ServerAuditResponse>;
};

export const useCreateAuditMutation = () =>
  useMutation({ mutationFn: createAuditRequest });