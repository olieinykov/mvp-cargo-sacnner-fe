import { useState, useRef, useEffect } from "react";
import type { UserRole } from "../../lib/api/auth";

type UserRoleSelect = {
  value: UserRole;
  onChange: (v: UserRole) => void;
  disabled?: boolean;
}

interface Option {
  value: UserRole;
  label: string;
}

const OPTIONS: Option[] = [
  { value: 'user', label: 'User' },
  { value: 'admin', label: 'Admin' }
];

export const UserRoleSelect: React.FC<UserRoleSelect> = ({
  value,
  onChange,
  disabled
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selected = OPTIONS.find(o => o.value === value) ?? OPTIONS[0];

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className="flex h-10 w-full items-center justify-between rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
      >
        <span>{selected.label}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          className={`text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-border bg-background shadow-lg">
          <div className="p-1">
            {OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                  opt.value === value ? "bg-primary/10 font-semibold text-primary" : "hover:bg-muted"
                }`}
              >
                {opt.label}
                {opt.value === value && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};