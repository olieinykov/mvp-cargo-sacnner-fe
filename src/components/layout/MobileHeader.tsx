import React, { useContext, useState } from 'react';
import { ThemeContext } from '../theme/ThemeProvider';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils/cn';
import { useAuthStore } from '../../lib/utils/useAuthStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMeQuery } from '../../lib/api/auth';

// ─── Icons ─────────────────────────────────────────────────────────────────────

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

// ─── MobileHeader ──────────────────────────────────────────────────────────────

export const MobileHeader: React.FC = () => {
  const themeContext = useContext(ThemeContext);
  const { logout } = useAuthStore();
  const { data: user } = useMeQuery();
  const isAdmin = user?.role === 'admin';
  const companyName = user?.companyName;
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/sign-in', { replace: true });
    setMenuOpen(false);
  };

  const navTo = (path: string) => {
    navigate(path);
    setMenuOpen(false);
  };

  return (
    <>
      <header className="flex shrink-0 items-center justify-between border-b border-border/50 bg-background px-4 py-3 md:hidden">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
            <svg className="text-primary" width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 7.5C3 6.1 4.1 5 5.5 5H14.5C15.9 5 17 6.1 17 7.5V18H6.5C5.1 18 4 16.9 4 15.5V7.5H3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M17 10H20.2C20.7 10 21.1 10.3 21.3 10.7L22 12.6V18H17V10Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M7.5 20.2C8.60457 20.2 9.5 19.3046 9.5 18.2C9.5 17.0954 8.60457 16.2 7.5 16.2C6.39543 16.2 5.5 17.0954 5.5 18.2C5.5 19.3046 6.39543 20.2 7.5 20.2Z" stroke="currentColor" strokeWidth="1.8" />
              <path d="M18.5 20.2C19.6046 20.2 20.5 19.3046 20.5 18.2C20.5 17.0954 19.6046 16.2 18.5 16.2C17.3954 16.2 16.5 17.0954 16.5 18.2C16.5 19.3046 17.3954 20.2 18.5 20.2Z" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </div>
          <span className="text-sm font-semibold">{companyName}</span>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1">
          {/* Theme toggle */}
          {themeContext && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={themeContext.handleToggleTheme}
              aria-label="Toggle theme"
              className="h-8 w-8 rounded-lg p-0 text-muted-foreground hover:text-foreground"
            >
              {themeContext.theme === 'light' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M21 14.5C19.6 15.2 18 15.6 16.3 15.6C10.9 15.6 6.6 11.3 6.6 5.9C6.6 4.2 7 2.6 7.7 1.2C3.7 2.4 1 6.2 1 10.6C1 16 5.3 20.3 10.7 20.3C15.1 20.3 18.9 17.6 21 14.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              )}
            </Button>
          )}

          {/* Hamburger / close */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="h-8 w-8 rounded-lg p-0 text-muted-foreground hover:text-foreground"
          >
            {menuOpen ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            )}
          </Button>
        </div>
      </header>

      {/* Dropdown menu */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-30 md:hidden"
            aria-hidden="true"
            onClick={() => setMenuOpen(false)}
          />

          {/* Panel */}
          <div className="absolute left-0 right-0 top-[53px] z-40 border-b border-border/50 bg-background px-3 pb-3 pt-2 shadow-md md:hidden">
            {/* User info */}
            {user && (
              <div className="mb-2 flex items-center gap-2.5 rounded-lg px-3 py-2">
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

            <div className="h-px bg-border/50 mb-2" />

            {/* Nav links */}
            <nav className="space-y-0.5" aria-label="Mobile navigation">
              <MobileNavItem
                icon={<AuditsIcon />}
                label="Audits"
                active={pathname === '/audits'}
                onClick={() => navTo('/audits')}
              />
              {isAdmin && (
                <MobileNavItem
                  icon={<UsersIcon />}
                  label="Team"
                  active={pathname === '/users'}
                  onClick={() => navTo('/users')}
                />
              )}
            </nav>

            <div className="h-px bg-border/50 my-2" />

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogoutIcon />
              Log out
            </button>
          </div>
        </>
      )}
    </>
  );
};

// ─── Mobile nav item ───────────────────────────────────────────────────────────

function MobileNavItem({
  icon, label, active, onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        active
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      {icon}
      {label}
    </button>
  );
}