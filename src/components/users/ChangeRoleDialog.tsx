import { useQueryClient } from "@tanstack/react-query";
import { useUpdateUserRoleMutation } from "../../lib/api/auth";
import type { CompanyUser, UserRole } from "../../lib/api/auth";
import { useState } from "react";
import { toast } from "sonner";

export const ChangeRoleDialog = ({
  user,
  onClose,
}: {
  user: CompanyUser | null;
  onClose: () => void;
}) => {
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