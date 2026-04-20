import { useQueryClient } from "@tanstack/react-query";
import { useUpdateUserRoleMutation, useUpdateUserStatusMutation } from "../../lib/api/auth";
import type { CompanyUser, UserRole } from "../../lib/api/auth";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { UserRoleSelect } from "./UsersControl";

type ChangeRoleDialogProps = {
  user: CompanyUser | null;
  currentUserId?: string;
  onClose: () => void;
}

export const ChangeRoleDialog: React.FC<ChangeRoleDialogProps> = ({
  user,
  currentUserId,
  onClose,
}) => {
  const roleMutation   = useUpdateUserRoleMutation();
  const statusMutation = useUpdateUserStatusMutation();
  const queryClient    = useQueryClient();

  const [role, setRole]       = useState<UserRole>(user?.role ?? 'user');
  const [isActive, setIsActive] = useState<boolean>(user?.isActive ?? false);

  useEffect(() => {
    if (user) {
      setRole(user.role);
      setIsActive(user.isActive);
    }
  }, [user]);

  if (!user) return null;

  const isSelf      = currentUserId === user.id;
  const roleChanged = role !== user.role;
  const statusChanged = isActive !== user.isActive;
  const hasChanges  = roleChanged || statusChanged;
  const isPending   = roleMutation.isPending || statusMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Run mutations sequentially only if each field actually changed
      if (roleChanged && !isSelf) {
        await roleMutation.mutateAsync({ userId: user.id, role });
      }
      if (statusChanged) {
        await statusMutation.mutateAsync({ userId: user.id, isActive });
      }
      toast.success(`${user.firstName}'s profile updated`);
      queryClient.invalidateQueries({ queryKey: ['companyUsers'] });
      onClose();
    } catch (err) {
      toast.error((err as Error).message ?? 'Failed to update user');
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="role-dialog-title"
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-background p-6 shadow-xl"
      >
        {/* Header */}
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="role-dialog-title" className="text-base font-semibold text-foreground">
              Edit member
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Role select */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="role-select" className="text-xs font-medium text-muted-foreground">
              Role
            </label>
            <UserRoleSelect
              value={role}
              onChange={setRole}
              disabled={isSelf}
            />
            {isSelf && (
              <p className="text-xs text-muted-foreground">You cannot change your own role.</p>
            )}
          </div>

          {/* Active / Inactive toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
            <div>
              <p className="text-sm font-medium text-foreground">Active</p>
              <p className="text-xs text-muted-foreground">
                {isActive ? 'User can access the platform' : 'User access is disabled'}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isActive}
              disabled={isSelf}
              onClick={() => setIsActive((v) => !v)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                isActive ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition-transform ${
                  isActive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Actions */}
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
              disabled={isPending || !hasChanges}
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-60"
            >
              {isPending ? (
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
};