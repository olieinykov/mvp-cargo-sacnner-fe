import React from 'react';
import { cn } from '../../lib/utils/cn';

type SidebarProps = {
  className?: string;
};

export const Sidebar: React.FC<SidebarProps> = ({ className }) => (
  <aside
    className={cn(
      'flex h-full w-64 flex-col border-r border-border/50 bg-background shadow-sm px-4 py-6',
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
    <nav className="space-y-2">
      <button
        type="button"
        className="w-full rounded-none px-3 py-2 text-left text-sm font-medium text-foreground bg-muted/60"
        aria-label="Audits"
      >
        Audits
      </button>
    </nav>
  </aside>
);

