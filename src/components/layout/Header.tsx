import React, { useContext } from 'react';
import { ThemeContext } from '../theme/ThemeProvider';
import { Button } from '../ui/button';

export const Header: React.FC = () => {
  const themeContext = useContext(ThemeContext);

  if (!themeContext) {
    return null;
  }

  const { theme, handleToggleTheme } = themeContext;

  const Icon = () => {
    if (theme === 'light') {
      // Moon icon
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

    // Sun icon
    return (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  };

  return (
    <header className="flex items-center justify-between border-b-[1px] border-border bg-background/60 px-6 py-4">
      <h1 className="text-xl font-semibold">Audits</h1>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleToggleTheme}
        aria-label="Toggle theme"
        className="rounded-full p-0 w-8 h-8"
      >
        <span className="inline-flex items-center justify-center" aria-hidden="true">
          <Icon />
        </span>
      </Button>
    </header>
  );
};
