import React, { useContext } from 'react';
import { ThemeContext } from '../theme/ThemeProvider';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils/cn';
import { useAuthStore } from '../../lib/utils/useAuthStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMeQuery } from '../../lib/api/auth';
import { Skeleton } from '../ui/skeleton';
import { NavItem } from '../ui/NavItem';

type SidebarProps = {
  className?: string;
};

// ─── Icons ─────────────────────────────────────────────────────────────────────

const ThemeIcon: React.FC<{ theme: 'light' | 'dark' }> = ({ theme }) =>
  theme === 'light' ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M21 14.5C19.6 15.2 18 15.6 16.3 15.6C10.9 15.6 6.6 11.3 6.6 5.9C6.6 4.2 7 2.6 7.7 1.2C3.7 2.4 1 6.2 1 10.6C1 16 5.3 20.3 10.7 20.3C15.1 20.3 18.9 17.6 21 14.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );

const AuditsIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.8" />
    <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const UsersIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8" />
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const LogoutIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── Sidebar ───────────────────────────────────────────────────────────────────

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const themeContext = useContext(ThemeContext);
  const { data: user, isLoading: userLoading } = useMeQuery();
  const { logout } = useAuthStore();

  const companyName = user?.companyName;
  const isAdmin = user?.role === 'admin';
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/sign-in', { replace: true });
  };

  return (
    <aside
      className={cn(
        'hidden md:flex h-full w-60 flex-col border-r border-border/50 bg-background px-3 py-5',
        className,
      )}
    >
      {/* Logo */}
      <div className="mb-6 flex items-center gap-2.5 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <svg className="text-primary" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M3 7.5C3 6.1 4.1 5 5.5 5H14.5C15.9 5 17 6.1 17 7.5V18H6.5C5.1 18 4 16.9 4 15.5V7.5H3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M17 10H20.2C20.7 10 21.1 10.3 21.3 10.7L22 12.6V18H17V10Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M7.5 20.2C8.60457 20.2 9.5 19.3046 9.5 18.2C9.5 17.0954 8.60457 16.2 7.5 16.2C6.39543 16.2 5.5 17.0954 5.5 18.2C5.5 19.3046 6.39543 20.2 7.5 20.2Z" stroke="currentColor" strokeWidth="1.8" />
            <path d="M18.5 20.2C19.6046 20.2 20.5 19.3046 20.5 18.2C20.5 17.0954 19.6046 16.2 18.5 16.2C17.3954 16.2 16.5 17.0954 16.5 18.2C16.5 19.3046 17.3954 20.2 18.5 20.2Z" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </div>
        <span className="text-sm font-semibold tracking-tight">{userLoading ? <Skeleton className="h-4 w-24" /> : companyName}</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5" aria-label="Main navigation">
        <NavItem
          icon={<AuditsIcon />}
          label="Audits"
          active={pathname === '/audits'}
          onClick={() => navigate('/audits')}
        />
        {isAdmin && (
          <NavItem
            icon={<UsersIcon />}
            label="Team"
            active={pathname === '/users'}
            onClick={() => navigate('/users')}
          />
        )}
      </nav>

      {/* Footer */}
      <div className="mt-auto space-y-0.5 border-t border-border/40 pt-3">
        {/* User info chip */}
        {userLoading ? (
          <div className="flex items-center gap-2.5 rounded-lg px-3 py-2">
            <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
            <div className="flex flex-col gap-1.5 min-w-0 flex-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-2.5 w-12" />
            </div>
          </div>
        ) : user && (
          <div className="flex items-center gap-2.5 rounded-lg px-3 py-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-foreground">
                {user.firstName} {user.lastName}
              </p>
              <p className="truncate text-[11px] capitalize text-muted-foreground">{user.role}</p>
            </div>
          </div>
        )}

        {themeContext && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={themeContext.handleToggleTheme}
            aria-label="Toggle theme"
            className="h-9 w-full justify-start gap-2.5 rounded-lg px-3 text-muted-foreground hover:text-foreground"
          >
            <ThemeIcon theme={themeContext.theme} />
            <span className="text-sm font-normal">
              {themeContext.theme === 'light' ? 'Dark mode' : 'Light mode'}
            </span>
          </Button>
        )}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          aria-label="Log out"
          className="h-9 w-full justify-start gap-2.5 rounded-lg px-3 text-muted-foreground hover:text-foreground"
        >
          <LogoutIcon />
          <span className="text-sm font-normal">Log out</span>
        </Button>
      </div>
    </aside>
  );
};