import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useCompanyUsersQuery, useMeQuery, usePendingInvitationsQuery } from '../lib/api/auth';
import type { CompanyUser } from '../lib/api/auth';
import { TabButton } from '../components/ui/TabButton';
import {
  MembersEmptyState,
  MembersTable,
  MembersTableSkeleton,
} from '../components/users/MembersTable';
import { InvitationsEmptyState, InviteDialog } from '../components/users/InviteDialog';
import { InvitationsTable, InvitationsTableSkeleton } from '../components/users/InvitationsTable';
import { ChangeRoleDialog } from '../components/users/ChangeRoleDialog';

// ─── Page ──────────────────────────────────────────────────────────────────────

type Tab = 'members' | 'invitations';

export const UsersPage: React.FC = () => {
  const [tab, setTab] = useState<Tab>('members');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [roleUser, setRoleUser] = useState<CompanyUser | null>(null);

  const { data: users = [], isLoading: usersLoading, error: usersError } = useCompanyUsersQuery();
  const {
    data: invitations = [],
    isLoading: invLoading,
    error: invError,
  } = usePendingInvitationsQuery();
  const { data: currentUser } = useMeQuery();

  const isLoading = tab === 'members' ? usersLoading : invLoading;
  const error = tab === 'members' ? usersError : invError;

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
                <path
                  d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8" />
                <path
                  d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
              Members
            </TabButton>
            <TabButton
              active={tab === 'invitations'}
              onClick={() => setTab('invitations')}
              count={invLoading ? undefined : invitations.length}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M22 6l-10 7L2 6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
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
              <path
                d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
              <path
                d="M20 8v6M23 11h-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Invite member
          </Button>
        </CardHeader>

        <CardContent className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
          {error ? (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 ring-1 ring-inset ring-red-600/10">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className="mt-0.5 shrink-0 text-red-500"
              >
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
                <path
                  d="M12 8v4M12 16h.01"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
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
                    <MembersTable
                      users={users}
                      currentUserId={currentUser?.id}
                      onChangeRole={setRoleUser}
                    />
                  )
                ) : isLoading ? (
                  <InvitationsTableSkeleton />
                ) : invitations.length === 0 ? (
                  <InvitationsEmptyState onInvite={() => setInviteOpen(true)} />
                ) : (
                  <InvitationsTable invitations={invitations} />
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
