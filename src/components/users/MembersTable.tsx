import type { CompanyUser } from "../../lib/api/auth";
import { Skeleton } from "../ui/skeleton";
import { Table, TableCell, TableHead, TableRow } from "../ui/table";
import { RoleBadge } from "./RoleBadge";

export const MembersTable = ({
  users,
  onChangeRole,
}: {
  users: CompanyUser[];
  onChangeRole: (user: CompanyUser) => void;
}) => {
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

export const MembersTableSkeleton = () => {
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

export const MembersEmptyState = ({ onInvite }: { onInvite: () => void }) => {
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