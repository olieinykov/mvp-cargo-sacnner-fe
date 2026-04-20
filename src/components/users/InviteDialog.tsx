import { useQueryClient } from "@tanstack/react-query";
import { useSendInvitationMutation } from "../../lib/api/auth";
import type { UserRole } from "../../lib/api/auth";
import { useState } from "react";
import { toast } from "sonner";
import { UserRoleSelect } from "./UsersControl";

type InviteDialogProps = { open: boolean; onClose: () => void }
type InvitationsEmptyStateProps = { onInvite: () => void }

export const InviteDialog: React.FC<InviteDialogProps> =({ open, onClose }) => {
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
        className="fixed pb-8 left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-background p-6 shadow-xl"
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
             <UserRoleSelect 
                value={role} 
                onChange={setRole} 
                disabled={mutation.isPending} 
              />
            </div>
          </div>

          <div className="mt-2 flex gap-2">
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

export const InvitationsEmptyState: React.FC<InvitationsEmptyStateProps> = ({ onInvite }) => {
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