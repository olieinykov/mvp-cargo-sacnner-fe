import React, { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Table, TableHead, TableRow, TableCell } from '../components/ui/table';
import {
  useCompanyUsersQuery,
  usePendingInvitationsQuery,
  useSendInvitationMutation,
  useCancelInvitationMutation,
  useResendInvitationMutation,
  useUpdateUserRoleMutation,
} from '../lib/api/auth';
import type { UserRole, CompanyUser, PendingInvitation } from '../lib/api/auth';
import { useQueryClient } from '@tanstack/react-query';

// ─── Role badge ────────────────────────────────────────────────────────────────

const BADGE = 'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium leading-none ring-1 ring-inset';

function RoleBadge({ role }: { role: UserRole }) {
  return role === 'admin' ? (
    <span className={`${BADGE} bg-violet-50 text-violet-700 ring-violet-600/20`}>Admin</span>
  ) : (
    <span className={`${BADGE} bg-sky-50 text-sky-700 ring-sky-600/20`}>User</span>
  );
}

// ─── Invite dialog ─────────────────────────────────────────────────────────────

function InviteDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const mutation = useSendInvitationMutation();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [role,  setRole]  = useState<UserRole>('user');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await mutation.mutateAsync({ email, role });
      toast.success(`Invitation sent to ${email}`);
      queryClient.invalidateQueries({ queryKey: ['pendingInvitations'] });
      setEmail('');
      setRole('user');
      onClose();
    } catch (err) {
      toast.error((err as Error).message ?? 'Failed to send invitation');
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" aria-hidden="true" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-dialog-title"
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-background p-6 shadow-xl"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="invite-dialog-title" className="text-base font-semibold text-foreground">
              Invite team member
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              They'll receive an email with a registration link.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="mt-0.5 rounded-md p-1 text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="invite-email" className="text-sm font-medium text-foreground">Email</label>
            <input
              id="invite-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none ring-offset-background transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="invite-role" className="text-sm font-medium text-foreground">Role</label>
            <div className="flex gap-2">
              {(['user', 'admin'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex h-9 flex-1 items-center justify-center rounded-lg border text-sm font-medium capitalize transition-all ${
                    role === r
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-1 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 flex-1 items-center justify-center rounded-lg border border-border text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending || !email}
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-60"
            >
              {mutation.isPending ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                  </svg>
                  Sending…
                </>
              ) : 'Send invitation'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

// ─── Change Role Dialog ────────────────────────────────────────────────────────

function ChangeRoleDialog({
  user,
  onClose,
}: {
  user: CompanyUser | null;
  onClose: () => void;
}) {
  const mutation = useUpdateUserRoleMutation();
  const queryClient = useQueryClient();
  const [role, setRole] = useState<UserRole>(user?.role ?? 'user');

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await mutation.mutateAsync({ userId: user.id, role });
      toast.success(`${user.firstName}'s role updated to ${role}`);
      queryClient.invalidateQueries({ queryKey: ['companyUsers'] });
      onClose();
    } catch (err) {
      toast.error((err as Error).message ?? 'Failed to update role');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" aria-hidden="true" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="role-dialog-title"
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-background p-6 shadow-xl"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="role-dialog-title" className="text-base font-semibold text-foreground">
              Change role
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {user.firstName} {user.lastName} · {user.email}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="mt-0.5 rounded-md p-1 text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex gap-2">
            {(['user', 'admin'] as UserRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex h-9 flex-1 items-center justify-center rounded-lg border text-sm font-medium capitalize transition-all ${
                  role === r
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 flex-1 items-center justify-center rounded-lg border border-border text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending || role === user.role}
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-60"
            >
              {mutation.isPending ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                  </svg>
                  Saving…
                </>
              ) : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

// ─── Members Table ─────────────────────────────────────────────────────────────

function MembersTable({
  users,
  onChangeRole,
}: {
  users: CompanyUser[];
  onChangeRole: (user: CompanyUser) => void;
}) {
  return (
    <Table>
      <thead>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead className="w-16" />
        </TableRow>
      </thead>
      <tbody>
        {users.map((user, idx) => (
          <TableRow key={user.id}>
            <TableCell className="font-mono text-xs text-muted-foreground/60">{idx + 1}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {user.firstName[0]}{user.lastName[0]}
                </div>
                <span className="text-sm font-medium text-foreground">
                  {user.firstName} {user.lastName}
                </span>
              </div>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
            <TableCell><RoleBadge role={user.role} /></TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {new Date(user.registrationData).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
              })}
            </TableCell>
            <TableCell>
              <button
                type="button"
                onClick={() => onChangeRole(user)}
                className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title="Change role"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Role
              </button>
            </TableCell>
          </TableRow>
        ))}
      </tbody>
    </Table>
  );
}

// ─── Invitations Table ─────────────────────────────────────────────────────────

function InvitationsTable({ invitations }: { invitations: PendingInvitation[] }) {
  const cancelMutation  = useCancelInvitationMutation();
  const resendMutation  = useResendInvitationMutation();
  const queryClient     = useQueryClient();

  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleCancel = async (id: string, email: string) => {
    setLoadingId(id + '-cancel');
    try {
      await cancelMutation.mutateAsync(id);
      toast.success(`Invitation to ${email} cancelled`);
      queryClient.invalidateQueries({ queryKey: ['pendingInvitations'] });
    } catch (err) {
      toast.error((err as Error).message ?? 'Failed to cancel invitation');
    } finally {
      setLoadingId(null);
    }
  };

  const handleResend = async (id: string, email: string) => {
    setLoadingId(id + '-resend');
    try {
      await resendMutation.mutateAsync(id);
      toast.success(`Invitation resent to ${email}`);
      queryClient.invalidateQueries({ queryKey: ['pendingInvitations'] });
    } catch (err) {
      toast.error((err as Error).message ?? 'Failed to resend invitation');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Table>
      <thead>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Expires</TableHead>
          <TableHead className="w-40" />
        </TableRow>
      </thead>
      <tbody>
        {invitations.map((inv, idx) => {
          const isExpired = new Date(inv.expiresAt) < new Date();
          const isCancelling = loadingId === inv.id + '-cancel';
          const isResending  = loadingId === inv.id + '-resend';

          return (
            <TableRow key={inv.id}>
              <TableCell className="font-mono text-xs text-muted-foreground/60">{idx + 1}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-50 text-xs font-semibold text-amber-600 ring-1 ring-amber-200">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-foreground">{inv.email}</span>
                </div>
              </TableCell>
              <TableCell><RoleBadge role={inv.role} /></TableCell>
              <TableCell>
                <span className={`text-sm ${isExpired ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                  {isExpired ? 'Expired · ' : ''}
                  {new Date(inv.expiresAt).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  {/* Resend */}
                  <button
                    type="button"
                    disabled={isResending || isCancelling}
                    onClick={() => handleResend(inv.id, inv.email)}
                    className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                    title="Resend invitation"
                  >
                    {isResending ? (
                      <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                      </svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 2L11 13" />
                        <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                      </svg>
                    )}
                    Resend
                  </button>

                  {/* Cancel */}
                  <button
                    type="button"
                    disabled={isCancelling || isResending}
                    onClick={() => handleCancel(inv.id, inv.email)}
                    className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:pointer-events-none disabled:opacity-50"
                    title="Cancel invitation"
                  >
                    {isCancelling ? (
                      <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                      </svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    )}
                    Cancel
                  </button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </tbody>
    </Table>
  );
}

// ─── Tab Button ────────────────────────────────────────────────────────────────

function TabButton({
  active,
  onClick,
  children,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
        active
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
    >
      {children}
      {count !== undefined && (
        <span className={`rounded-full px-1.5 py-0.5 text-xs font-semibold leading-none ${
          active ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

// ─── Skeletons ─────────────────────────────────────────────────────────────────

function MembersTableSkeleton() {
  return (
    <Table>
      <thead>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead className="w-16" />
        </TableRow>
      </thead>
      <tbody>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell><Skeleton className="h-4 w-6" /></TableCell>
            <TableCell>
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            </TableCell>
            <TableCell><Skeleton className="h-4 w-40" /></TableCell>
            <TableCell><Skeleton className="h-6 w-16 rounded-md" /></TableCell>
            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
            <TableCell><Skeleton className="h-6 w-14 rounded-md" /></TableCell>
          </TableRow>
        ))}
      </tbody>
    </Table>
  );
}

function InvitationsTableSkeleton() {
  return (
    <Table>
      <thead>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Expires</TableHead>
          <TableHead className="w-40" />
        </TableRow>
      </thead>
      <tbody>
        {Array.from({ length: 3 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell><Skeleton className="h-4 w-6" /></TableCell>
            <TableCell>
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-40" />
              </div>
            </TableCell>
            <TableCell><Skeleton className="h-6 w-16 rounded-md" /></TableCell>
            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
            <TableCell><Skeleton className="h-6 w-32 rounded-md" /></TableCell>
          </TableRow>
        ))}
      </tbody>
    </Table>
  );
}

// ─── Empty states ──────────────────────────────────────────────────────────────

function MembersEmptyState({ onInvite }: { onInvite: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-muted-foreground">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border/50 bg-muted/30">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="opacity-50">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
      <div className="space-y-1 text-center">
        <p className="text-sm font-medium text-foreground">No team members yet</p>
        <p className="text-xs text-muted-foreground">Invite your colleagues to get started.</p>
      </div>
      <button
        type="button"
        onClick={onInvite}
        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
          <path d="M20 8v6M23 11h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        Invite first member
      </button>
    </div>
  );
}

function InvitationsEmptyState({ onInvite }: { onInvite: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-20">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border/50 bg-muted/30">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="opacity-50">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
      <div className="space-y-1 text-center">
        <p className="text-sm font-medium text-foreground">No pending invitations</p>
        <p className="text-xs text-muted-foreground">All invitations have been accepted or cancelled.</p>
      </div>
      <button
        type="button"
        onClick={onInvite}
        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
          <path d="M20 8v6M23 11h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        Send invitation
      </button>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

type Tab = 'members' | 'invitations';

export const UsersPage: React.FC = () => {
  const [tab, setTab] = useState<Tab>('members');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [roleUser, setRoleUser] = useState<CompanyUser | null>(null);

  const { data: users = [], isLoading: usersLoading, error: usersError } = useCompanyUsersQuery();
  const { data: invitations = [], isLoading: invLoading, error: invError } = usePendingInvitationsQuery();

  const isLoading = tab === 'members' ? usersLoading : invLoading;
  const error     = tab === 'members' ? usersError   : invError;

  return (
    <section className="flex h-full flex-col gap-4 overflow-hidden">
      <Card className="flex min-h-0 flex-1 flex-col">
        <CardHeader className="flex shrink-0 items-center justify-between gap-4">
          <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/30 p-1">
            <TabButton
              active={tab === 'members'}
              onClick={() => setTab('members')}
              count={usersLoading ? undefined : users.length}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              Members
            </TabButton>
            <TabButton
              active={tab === 'invitations'}
              onClick={() => setTab('invitations')}
              count={invLoading ? undefined : invitations.length}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              Invitations
            </TabButton>
          </div>

          <Button
            type="button"
            size="sm"
            className="gap-1.5"
            onClick={() => setInviteOpen(true)}
            aria-label="Invite member"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
              <path d="M20 8v6M23 11h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Invite member
          </Button>
        </CardHeader>

        <CardContent className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
          {error ? (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 ring-1 ring-inset ring-red-600/10">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0 text-red-500">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              <div>
                <p className="text-sm font-semibold text-red-800">Failed to load</p>
                <p className="mt-0.5 text-xs text-red-700">{(error as Error).message}</p>
              </div>
            </div>
          ) : (
            <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-border bg-background">
              <div className="h-full max-h-full overflow-auto overscroll-contain">
                {tab === 'members' ? (
                  isLoading ? (
                    <MembersTableSkeleton />
                  ) : users.length === 0 ? (
                    <MembersEmptyState onInvite={() => setInviteOpen(true)} />
                  ) : (
                    <MembersTable users={users} onChangeRole={setRoleUser} />
                  )
                ) : (
                  isLoading ? (
                    <InvitationsTableSkeleton />
                  ) : invitations.length === 0 ? (
                    <InvitationsEmptyState onInvite={() => setInviteOpen(true)} />
                  ) : (
                    <InvitationsTable invitations={invitations} />
                  )
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <InviteDialog open={inviteOpen} onClose={() => setInviteOpen(false)} />
      <ChangeRoleDialog user={roleUser} onClose={() => setRoleUser(null)} />
    </section>
  );
};