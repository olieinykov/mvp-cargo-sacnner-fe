import React, { useContext } from 'react';
import { ThemeContext } from '../theme/ThemeProvider';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils/cn';

type SidebarProps = {
  className?: string;
};

const ThemeIcon: React.FC<{ theme: 'light' | 'dark' }> = ({ theme }) => {
  if (theme === 'light') {
    return (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M21 14.5C19.6 15.2 18 15.6 16.3 15.6C10.9 15.6 6.6 11.3 6.6 5.9C6.6 4.2 7 2.6 7.7 1.2C3.7 2.4 1 6.2 1 10.6C1 16 5.3 20.3 10.7 20.3C15.1 20.3 18.9 17.6 21 14.5Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const themeContext = useContext(ThemeContext);

  return (
    <aside
      className={cn(
        'flex h-full w-64 flex-col border-r border-border/50 bg-background px-4 py-6 shadow-sm',
        className,
      )}
    >
      <div className="mb-6 flex items-center gap-2">
        <svg
          className="text-primary"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M3 7.5C3 6.1 4.1 5 5.5 5H14.5C15.9 5 17 6.1 17 7.5V18H6.5C5.1 18 4 16.9 4 15.5V7.5H3Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M17 10H20.2C20.7 10 21.1 10.3 21.3 10.7L22 12.6V18H17V10Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M7.5 20.2C8.60457 20.2 9.5 19.3046 9.5 18.2C9.5 17.0954 8.60457 16.2 7.5 16.2C6.39543 16.2 5.5 17.0954 5.5 18.2C5.5 19.3046 6.39543 20.2 7.5 20.2Z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M18.5 20.2C19.6046 20.2 20.5 19.3046 20.5 18.2C20.5 17.0954 19.6046 16.2 18.5 16.2C17.3954 16.2 16.5 17.0954 16.5 18.2C16.5 19.3046 17.3954 20.2 18.5 20.2Z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
        </svg>
        <div className="text-lg font-semibold">Hazmat Audit</div>
      </div>

      <nav className="flex-1 space-y-2">
        <button
          type="button"
          className="w-full rounded-none bg-muted/60 px-3 py-2 text-left text-sm font-medium text-foreground"
          aria-label="Audits"
        >
          Audits
        </button>
      </nav>

      {themeContext ? (
        <div className="mt-auto border-t border-border/50 pt-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={themeContext.handleToggleTheme}
            aria-label="Toggle theme"
            className="h-9 w-full justify-start gap-2 rounded-md px-3 text-muted-foreground hover:text-foreground"
          >
            <span className="inline-flex shrink-0 items-center justify-center" aria-hidden="true">
              <ThemeIcon theme={themeContext.theme} />
            </span>
            <span className="text-sm font-normal">
              {themeContext.theme === 'light' ? 'Dark mode' : 'Light mode'}
            </span>
          </Button>
        </div>
      ) : null}
    </aside>
  );
};
