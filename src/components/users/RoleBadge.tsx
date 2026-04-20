import type { UserRole } from "../../lib/api/auth";

type RoleBadgeProps = { role: UserRole }

const BADGE = 'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium leading-none ring-1 ring-inset';

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  return role === 'admin' ? (
    <span className={`${BADGE} bg-violet-50 text-violet-700 ring-violet-600/20`}>Admin</span>
  ) : (
    <span className={`${BADGE} bg-sky-50 text-sky-700 ring-sky-600/20`}>User</span>
  );
}
