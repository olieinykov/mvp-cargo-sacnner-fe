import { useMutation, useQuery } from '@tanstack/react-query';
import { globalLogout, useAuthStore } from '../utils/useAuthStore';

//const BASE = `http://localhost:3000/api/v1/auth`;
const BASE = `${import.meta.env.VITE_API_URL}/auth`;

// ─── Types ─────────────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'user';

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  companyId: string | null;
  companyName: string;
  isActive: boolean;
};

export type AuthCompany = {
  id: string;
  name: string;
  dotNumber: string;
  mcNumber: string | null;
  ownerId: string;
  status: string;
};

export type SignInPayload = {
  email: string;
  password: string;
};

export type SignUpAdminPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  company: {
    name: string;
    dotNumber: string;
    mcNumber?: string;
  };
};

export type SignUpInvitedPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  inviteToken: string;
};

export type SignInResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
};

export type SignUpResponse = {
  user: AuthUser;
  company?: AuthCompany;
};

export type InviteInfo = {
  email: string;
  role: UserRole;
  expiresAt: string;
  company: {
    id: string;
    name: string;
  };
};

export type CompanyUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  companyId: string;
  registrationData: string;
  isActive: boolean;
};

export type PendingInvitation = {
  id: string;
  email: string;
  role: UserRole;
  expiresAt: string;
  token: string;
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

export async function signIn(payload: SignInPayload): Promise<SignInResponse> {
  const res = await fetch(`${BASE}/sign-in`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<SignInResponse>(res);
}

export async function signUpAdmin(payload: SignUpAdminPayload): Promise<SignUpResponse> {
  const res = await fetch(`${BASE}/sign-up-company`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<SignUpResponse>(res);
}

export async function signUpInvited(payload: SignUpInvitedPayload): Promise<SignUpResponse> {
  const res = await fetch(`${BASE}/sign-up-invite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<SignUpResponse>(res);
}

// GET /auth/invite/:token — resolve invite info (company name, email, role)
export async function getInviteInfo(token: string): Promise<InviteInfo> {
  const res = await fetch(`${BASE}/invite/${token}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return handleResponse<InviteInfo>(res);
}

// GET /auth/users — admin-only: list company members
export async function getCompanyUsers(): Promise<CompanyUser[]> {
  const res = await fetch(`${BASE}/users`, { headers: authHeaders() });
  const data = await handleResponse<{ users: CompanyUser[] }>(res);
  return data.users;
}

export async function sendInvitation(email: string, role: UserRole): Promise<void> {
  const res = await fetch(`${BASE}/invitation`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ email, role }),
  });
  await handleResponse(res);
}

export async function getMe(): Promise<AuthUser> {
  const res = await fetch(`${BASE}/me`, { headers: authHeaders() });
  return handleResponse<AuthUser>(res);
}

// POST /auth/request-password-reset
export async function requestPasswordReset(email: string): Promise<void> {
  const res = await fetch(`${BASE}/request-password-reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  await handleResponse(res);
}

// POST /auth/update-password
export async function updatePassword(password: string, accessToken: string): Promise<void> {
  const res = await fetch(`${BASE}/update-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ password }),
  });
  await handleResponse(res);
}

// GET /auth/invitations
export async function getPendingInvitations(): Promise<PendingInvitation[]> {
  const res = await fetch(`${BASE}/invitations`, { headers: authHeaders() });
  const data = await handleResponse<{ invitations: PendingInvitation[] }>(res);
  return data.invitations;
}

// POST /auth/invitation/:id/cancel
export async function cancelInvitation(id: string): Promise<void> {
  const res = await fetch(`${BASE}/invitation/${id}/cancel`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({}),
  });
  await handleResponse(res);
}

// POST /auth/invitation/:id/resend
export async function resendInvitation(id: string): Promise<{ expiresAt: string }> {
  const res = await fetch(`${BASE}/invitation/${id}/resend`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({}),
  });
  return handleResponse<{ expiresAt: string }>(res);
}

// PATCH /auth/users/:userId/role
export async function updateUserRole(userId: string, role: UserRole): Promise<void> {
  const res = await fetch(`${BASE}/users/${userId}/role`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ role }),
  });
  await handleResponse(res);
}

// PATCH /auth/users/:userId/status
export async function updateUserStatus(userId: string, isActive: boolean): Promise<void> {
  const res = await fetch(`${BASE}/users/${userId}/status`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ isActive }),
  });
  await handleResponse(res);
}

// ─── React Query hooks ─────────────────────────────────────────────────────────

export const useSignInMutation = () =>
  useMutation({ mutationFn: signIn });

export const useSignUpAdminMutation = () =>
  useMutation({ mutationFn: signUpAdmin });

export const useSignUpInvitedMutation = () =>
  useMutation({ mutationFn: signUpInvited });

export const useInviteInfoQuery = (token: string | null) =>
  useQuery({
    queryKey: ['invite', token],
    queryFn: () => getInviteInfo(token!),
    enabled: !!token,
    retry: false,
  });

export const useCompanyUsersQuery = () =>
  useQuery({
    queryKey: ['companyUsers'],
    queryFn: getCompanyUsers,
});

export const usePendingInvitationsQuery = () =>
  useQuery({
    queryKey: ['pendingInvitations'],
    queryFn: getPendingInvitations,
  });

export const useSendInvitationMutation = () =>
  useMutation({ mutationFn: ({ email, role }: { email: string; role: UserRole }) =>
    sendInvitation(email, role),
  });

export const useCancelInvitationMutation = () =>
  useMutation({ mutationFn: (id: string) => cancelInvitation(id) });

export const useResendInvitationMutation = () =>
  useMutation({ mutationFn: (id: string) => resendInvitation(id) });

export const useUpdateUserRoleMutation = () =>
  useMutation({ mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
    updateUserRole(userId, role),
  });

export const useRequestPasswordResetMutation = () =>
  useMutation({ mutationFn: (email: string) => requestPasswordReset(email) });

export const useUpdatePasswordMutation = () =>
  useMutation({ mutationFn: ({ password, accessToken }: { password: string; accessToken: string }) =>
    updatePassword(password, accessToken),
  });

export const useUpdateUserStatusMutation = () =>
  useMutation({ mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
    updateUserStatus(userId, isActive),
  });

export const useMeQuery = () => {
  const { accessToken } = useAuthStore();
  
  return useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    enabled: !!accessToken, 
    retry: false,
  });
};