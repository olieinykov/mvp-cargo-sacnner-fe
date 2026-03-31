import { useMutation, useQuery } from "@tanstack/react-query";
import type { ServerAuditResponse, StoredAudit, AuditImage } from "../utils/useAuditStore";

const AUDIT_ENDPOINT        = 'http://localhost:3000/api/v1/audit';
const AUDIT_UPLOAD_ENDPOINT = `${AUDIT_ENDPOINT}/upload`;

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

export type Pagination = PaginatedResponse["pagination"];

const fetchAudits = async (
  page: number,
  limit: number,
): Promise<{ audits: StoredAudit[]; pagination: Pagination }> => {
  const url = new URL(AUDIT_ENDPOINT);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error("Failed to fetch audits");
  }

  const json = (await response.json()) as PaginatedResponse;

  return {
    audits: json.data.map((row) => ({
      id: row.id,
      createdAt: row.created_at,
      response: row.response,
      auditImages: row.auditImages as AuditImage[],
    })),
    pagination: json.pagination,
  };
};

export const useAuditsQuery = (page: number, limit: number) =>
  useQuery({
    queryKey: ["audits", page, limit],
    queryFn: () => fetchAudits(page, limit),
  });

// ─── POST /audit/upload ────────────────────────────────────────────────────────

export type UploadedImage = {
  /** Supabase storage key — pass back to POST /audit as imageIds[] */
  id: string;
  /** Public URL of the uploaded image */
  url: string;
};

const uploadImages = async (files: File[]): Promise<UploadedImage[]> => {
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));

  const response = await fetch(AUDIT_UPLOAD_ENDPOINT, {
    method: "POST",
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
  /** Storage IDs returned by POST /audit/upload */
  imageIds: string[];
};

const createAuditRequest = async (
  payload: AuditPayload,
): Promise<ServerAuditResponse> => {
  const response = await fetch(AUDIT_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to create audit");
  }

  return response.json() as Promise<ServerAuditResponse>;
};

export const useCreateAuditMutation = () =>
  useMutation({ mutationFn: createAuditRequest });