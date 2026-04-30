import { useMutation, useQuery } from '@tanstack/react-query';
import { globalLogout } from '../utils/useAuthStore';

const BASE = `http://localhost:3000/api/v1/companies`;
//const BASE = `${BASE}/companies`;

// ─── Types ─────────────────────────────────────────────────────────────────────

export type CompanyData = {
  id: string;
  name: string;
  dotNumber: string;
  mcNumber: string | null;
  ownerId: string | null;
  isEmailConfirmed: boolean;
};

export type Inspection = {
  id: string;
  inspection_id: string;
  dot_number: string;
  insp_date: string;
  report_state: string;
  report_number: string | null;
  insp_level_id: number | null;
  insp_carrier_name: string | null;
  insp_carrier_city: string | null;
  insp_carrier_state: string | null;
  viol_total: number | null;
  oos_total: number | null;
  driver_viol_total: number | null;
  vehicle_viol_total: number | null;
  hazmat_viol_total: number | null;
  hazmat_placard_req: string | null;
  post_acc_ind: string | null;
  ci_status_code: string | null;
  location_desc: string | null;
  gross_comb_veh_wt: string | null;
  alcohol_control_sub: string | null;
  drug_intrdctn_search: string | null;
  insp_facility: string | null;
};

export type Violation = {
  id: string;
  insp_violation_id: string;
  inspection_id: string;
  seq_no: number | null;
  part_no: string | null;
  part_no_section: string | null;
  insp_viol_unit: string | null;
  out_of_service_indicator: string | null;
  citation_number: string | null;
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {

    if (res.status === 401) {
      globalLogout();
    }

    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ─── Auth calls ────────────────────────────────────────────────────────────────

export async function getCompany(companyId: string): Promise<CompanyData> {
  const res = await fetch(`${BASE}/${companyId}`, { headers: authHeaders() });
  return handleResponse<CompanyData>(res);
}

export async function updateCompany(companyId: string, data: Partial<CompanyData>): Promise<CompanyData> {
  const res = await fetch(`${BASE}/${companyId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<CompanyData>(res);
}

export async function getCompanyHazmat(dotNumber: string): Promise<{ hm_ind: 'Y' | 'N' | null }> {
  const res = await fetch(`${BASE}/${dotNumber}/fmcsa/hazmat`, { headers: authHeaders() });
  return handleResponse<{ hm_ind: 'Y' | 'N' | null }>(res);
}

export async function getCompanyInspections(dotNumber: string): Promise<{ data: Inspection[], pagination?: any } | { inspections: Inspection[] } | Inspection[]> {
  const res = await fetch(`${BASE}/${dotNumber}/fmcsa/inspections`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function getInspectionViolations(inspectionId: string): Promise<{ violations: Violation[] } | Violation[]> {
  const res = await fetch(`${BASE}/inspections/${inspectionId}/violations`, { headers: authHeaders() });
  return handleResponse(res);
}

// ─── React Query hooks ─────────────────────────────────────────────────────────

export const useCompanyQuery = (companyId?: string | null) =>
  useQuery({
    queryKey: ['company', companyId],
    queryFn: () => getCompany(companyId!),
    enabled: !!companyId,
  });

export const useUpdateCompanyMutation = () =>
  useMutation({
    mutationFn: ({ companyId, data }: { companyId: string; data: Partial<CompanyData> }) =>
      updateCompany(companyId, data),
  });

export const useCompanyHazmatQuery = (dotNumber?: string | null) =>
  useQuery({
    queryKey: ['hazmat', dotNumber],
    queryFn: () => getCompanyHazmat(dotNumber!),
    enabled: !!dotNumber,
    retry: false,
  });

export const useCompanyInspectionsQuery = (dotNumber?: string | null) =>
  useQuery({
    queryKey: ['inspections', dotNumber],
    queryFn: () => getCompanyInspections(dotNumber!),
    enabled: !!dotNumber,
  });

export const useInspectionViolationsQuery = (inspectionId?: string | null) =>
  useQuery({
    queryKey: ['violations', inspectionId],
    queryFn: () => getInspectionViolations(inspectionId!),
    enabled: !!inspectionId,
  });