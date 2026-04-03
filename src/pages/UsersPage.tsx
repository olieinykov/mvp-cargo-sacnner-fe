import React, { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Table, TableHead, TableRow, TableCell } from '../components/ui/table';
import { useCompanyUsersQuery, useSendInvitationMutation } from '../lib/api/auth';
import type { UserRole } from '../lib/api/auth';

// ─── Role badge ────────────────────────────────────────────────────────────────

const BADGE = 'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium leading-none ring-1 ring-inset';

function RoleBadge({ role }: { role: UserRole }) {
  return role === 'admin' ? (
    <span className={`${BADGE} bg-violet-50 text-violet-700 ring-violet-600/20`}>
      Admin
    </span>
  ) : (
    <span className={`${BADGE} bg-sky-50 text-sky-700 ring-sky-600/20`}>
      User
    </span>
  );
}

// ─── Invite dialog ─────────────────────────────────────────────────────────────

function InviteDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const mutation = useSendInvitationMutation();
  const [email, setEmail] = useState('');
  const [role,  setRole]  = useState<UserRole>('user');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await mutation.mutateAsync({ email, role });
      toast.success(`Invitation sent to ${email}`);
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
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Dialog */}
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

// ─── Page ──────────────────────────────────────────────────────────────────────

export const UsersPage: React.FC = () => {
  const { data: users = [], isLoading, error } = useCompanyUsersQuery();
  const [inviteOpen, setInviteOpen] = useState(false);
  
  return (
    <section className="flex h-full flex-col gap-4 overflow-hidden">
      <Card className="flex min-h-0 flex-1 flex-col">
        <CardHeader className="flex shrink-0 items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Team members</h2>
            {!isLoading && (
              <p className="text-sm text-muted-foreground">
                {users.length} member{users.length !== 1 ? 's' : ''} in your company
              </p>
            )}
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
                <p className="text-sm font-semibold text-red-800">Failed to load users</p>
                <p className="mt-0.5 text-xs text-red-700">{(error as Error).message}</p>
              </div>
            </div>
          ) : (
            <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-border bg-background">
              <div className="h-full max-h-full overflow-auto overscroll-contain">
                {isLoading ? (
                  <UsersTableSkeleton />
                ) : users.length === 0 ? (
                  <UsersEmptyState onInvite={() => setInviteOpen(true)} />
                ) : (
                  <Table>
                    <thead>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </thead>
                    <tbody>
                      {users.map((user, idx) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-mono text-xs text-muted-foreground/60">
                            {idx + 1}
                          </TableCell>
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
                          <TableCell className="text-sm text-muted-foreground">
                            {user.email}
                          </TableCell>
                          <TableCell>
                            <RoleBadge role={user.role} />
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(user.registrationData).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric',
                            })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </tbody>
                  </Table>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <InviteDialog open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </section>
  );
};

// ─── Sub-components ────────────────────────────────────────────────────────────

function UsersTableSkeleton() {
  return (
    <Table>
      <thead>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Joined</TableHead>
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
          </TableRow>
        ))}
      </tbody>
    </Table>
  );
}

function UsersEmptyState({ onInvite }: { onInvite: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-muted-foreground">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border/50 bg-muted/30">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="opacity-50" aria-hidden="true">
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
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
          <path d="M20 8v6M23 11h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        Invite first member
      </button>
    </div>
  );
}