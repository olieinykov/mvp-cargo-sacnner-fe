import { useQueryClient } from "@tanstack/react-query";
import { useCancelInvitationMutation, useResendInvitationMutation } from "../../lib/api/auth";
import type { PendingInvitation } from "../../lib/api/auth";
import { useState } from "react";
import { toast } from "sonner";
import { Table, TableCell, TableHead, TableRow } from "../ui/table";
import { RoleBadge } from "./RoleBadge";
import { Skeleton } from "../ui/skeleton";

type InvitationsTableProps = { invitations: PendingInvitation[] }

export const InvitationsTable: React.FC<InvitationsTableProps> = ({ invitations }) => {
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
                  {new Date(inv.expiresAt).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
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

export const InvitationsTableSkeleton = () => {
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