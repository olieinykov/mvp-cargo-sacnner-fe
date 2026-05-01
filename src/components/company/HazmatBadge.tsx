type HazmatBadgeProps = { status: 'Y' | 'N' | null | 'loading' | 'error' };

export const HazmatBadge: React.FC<HazmatBadgeProps> = ({ status }) => {
  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
          <path
            d="M12 2a10 10 0 0 1 10 10"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
        Checking FMCSA…
      </div>
    );
  }

  if (status === 'error') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-500 ring-1 ring-inset ring-zinc-200">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="M12 8v4M12 16h.01"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
        Not found in FMCSA
      </span>
    );
  }

  if (status === 'Y') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden="true" />
        Authorized for Hazmat
      </span>
    );
  }

  if (status === 'N') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" aria-hidden="true" />
        Not Authorized for Hazmat
      </span>
    );
  }

  return <span className="text-xs text-muted-foreground/50 italic">Unknown</span>;
};
