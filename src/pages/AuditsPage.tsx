import React from "react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardContent } from "../components/ui/card";
import { AuditsTable } from "../components/audits/AuditsTable";
import { CreateAuditDialog } from "../forms/audits/CreateAuditDialog";
import { AuditResultDialog } from "../components/audits/AuditResultDialog";
import { useAuditStore } from "../lib/utils/useAuditStore";
import type {
  StoredAudit,
  ServerAuditResponse,
} from "../lib/utils/useAuditStore";
import type { AuditFilters, AuditStatus } from "../lib/api/audits";
import { useMeQuery } from "../lib/api/auth";

// ─── Rows-per-page custom select ───────────────────────────────────────────────

const LIMIT_PRESETS = [10, 20, 50, 100];

function LimitControl({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (n: number) => void;
  disabled: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const handleSelect = (opt: number) => {
    onChange(opt);
    setOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">Rows per page</span>

      <div ref={ref} className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label="Rows per page"
          className="flex h-8 min-w-[64px] items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40"
        >
          <span>{value}</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
            className={`shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          >
            <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {open && (
          <div
            role="listbox"
            aria-label="Rows per page options"
            className="absolute bottom-full right-0 z-50 mb-2 overflow-hidden rounded-xl border border-border bg-background shadow-lg ring-1 ring-black/5"
          >
            <div className="p-1">
              {LIMIT_PRESETS.map((opt) => {
                const isSelected = opt === value;
                return (
                  <button
                    key={opt}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt)}
                    className={`flex w-full items-center justify-between gap-4 rounded-lg px-3 py-2 text-sm transition-colors ${
                      isSelected
                        ? "bg-primary/10 font-semibold text-primary"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <span>{opt}</span>
                    {isSelected && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <path d="M2 6.5l3 3 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Pagination ────────────────────────────────────────────────────────────────

function Pagination({
  page,
  totalPages,
  hasPrev,
  hasNext,
  disabled,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
  disabled: boolean;
  onPageChange: (p: number) => void;
}) {
  const pages = React.useMemo(() => {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const result: (number | "…")[] = [];
    const addRange = (from: number, to: number) => {
      for (let i = from; i <= to; i++) result.push(i);
    };
    result.push(1);
    if (page > 4) result.push("…");
    addRange(Math.max(2, page - 2), Math.min(totalPages - 1, page + 2));
    if (page < totalPages - 3) result.push("…");
    result.push(totalPages);
    return result;
  }, [page, totalPages]);

  return (
    <nav className="flex items-center gap-1" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={!hasPrev || disabled}
        aria-label="Previous page"
        className="flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Prev
      </button>

      <div className="flex items-center gap-0.5">
        {pages.map((p, i) =>
          p === "…" ? (
            <span
              key={`ellipsis-${i}`}
              className="flex h-9 w-9 items-center justify-center text-sm text-muted-foreground/50"
            >
              ···
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p as number)}
              disabled={disabled}
              aria-label={`Page ${p}`}
              aria-current={p === page ? "page" : undefined}
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-40 ${
                p === page
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {p}
            </button>
          ),
        )}
      </div>

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNext || disabled}
        aria-label="Next page"
        className="flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
      >
        Next
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </nav>
  );
}

// ─── Reusable dropdown select ──────────────────────────────────────────────────

function SelectControl<T extends string>({
  value,
  options,
  onChange,
  disabled,
  label,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  disabled: boolean;
  label: string;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const selected = options.find((o) => o.value === value) ?? options[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        className="flex h-8 min-w-[120px] items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40"
      >
        <span>{selected.label}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
          className={`shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={label}
          className="w-[calc(100%+18px)] absolute left-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-border bg-background shadow-lg ring-1 ring-black/5"
        >
          <div className="p-1">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={`flex w-full items-center justify-between gap-4 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isSelected
                      ? "bg-primary/10 font-semibold text-primary"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M2 6.5l3 3 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── DateRangePicker ───────────────────────────────────────────────────────────

type DateRange = { from: string | undefined; to: string | undefined };

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DOW = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatLabel(from: string | undefined, to: string | undefined): string {
  if (!from && !to) return "All dates";
  const fmt = (s: string) =>
    new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  if (from && to) return `${fmt(from)} – ${fmt(to)}`;
  if (from) return `From ${fmt(from)}`;
  return `To ${fmt(to!)}`;
}

function CalendarMonth({
  year,
  month,
  from,
  to,
  hovered,
  onDayClick,
  onDayHover,
}: {
  year: number;
  month: number;
  from: string | undefined;
  to: string | undefined;
  hovered: string | undefined;
  onDayClick: (iso: string) => void;
  onDayHover: (iso: string | undefined) => void;
}) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const rangeEnd = to ?? hovered;

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const today = isoDate(new Date());

  return (
    <div className="min-w-[224px]">
      <p className="mb-2 text-center text-xs font-medium text-foreground">
        {MONTHS[month]} {year}
      </p>
      <div className="grid grid-cols-7 gap-y-0.5">
        {DOW.map((d) => (
          <span key={d} className="flex h-7 items-center justify-center text-[11px] text-muted-foreground/60">
            {d}
          </span>
        ))}
        {cells.map((day, i) => {
          if (!day) return <span key={`empty-${i}`} />;
          const iso = isoDate(new Date(year, month, day));

          const isFrom = iso === from;
          const isTo = iso === to;

          const lo = from && rangeEnd && from <= rangeEnd ? from : rangeEnd;
          const hi = from && rangeEnd && from <= rangeEnd ? rangeEnd : from;
          const inRange = !!(lo && hi && iso > lo && iso < hi);
          const isToday = iso === today;

          return (
            <button
              key={iso}
              type="button"
              onClick={() => onDayClick(iso)}
              onMouseEnter={() => onDayHover(iso)}
              onMouseLeave={() => onDayHover(undefined)}
              aria-label={iso}
              aria-pressed={isFrom || isTo}
              className={[
                "flex h-7 w-full items-center justify-center rounded-md text-xs transition-colors",
                isFrom || isTo
                  ? "bg-primary text-primary-foreground font-semibold"
                  : inRange
                  ? "bg-primary/10 text-foreground"
                  : isToday
                  ? "ring-1 ring-inset ring-primary/40 text-primary font-medium hover:bg-muted"
                  : "text-foreground hover:bg-muted",
              ].join(" ")}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DateRangePicker({
  from,
  to,
  disabled,
  onChange,
}: {
  from: string | undefined;
  to: string | undefined;
  disabled: boolean;
  onChange: (range: DateRange) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [selecting, setSelecting] = React.useState<"from" | "to">("from");
  const [hovered, setHovered] = React.useState<string | undefined>();
  const ref = React.useRef<HTMLDivElement>(null);

  const today = new Date();
  const [viewYear, setViewYear] = React.useState(today.getFullYear());
  const [viewMonth, setViewMonth] = React.useState(today.getMonth());

  React.useEffect(() => {
    if (!open) return;
    const onOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  };

  const secondMonth = viewMonth === 11 ? 0 : viewMonth + 1;
  const secondYear = viewMonth === 11 ? viewYear + 1 : viewYear;

  const handleDayClick = (iso: string) => {
    if (selecting === "from") {
      onChange({ from: iso, to: undefined });
      setSelecting("to");
    } else {
      if (from && iso < from) {
        onChange({ from: iso, to: from });
      } else {
        onChange({ from, to: iso });
      }
      setSelecting("from");
      setOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({ from: undefined, to: undefined });
    setSelecting("from");
  };

  const hasValue = !!(from || to);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => { setOpen((o) => !o); setSelecting("from"); }}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Date range"
        className={[
          "flex h-8 items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm font-medium shadow-sm transition-all hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40",
          hasValue ? "text-foreground" : "text-muted-foreground",
        ].join(" ")}
      >
        {/* calendar icon */}
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="shrink-0 text-muted-foreground">
          <rect x="1" y="2.5" width="12" height="10.5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
          <path d="M1 5.5h12" stroke="currentColor" strokeWidth="1.4" />
          <path d="M4.5 1v3M9.5 1v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <span>{formatLabel(from, to)}</span>
        {hasValue && (
          <span
            role="button"
            aria-label="Clear date range"
            onClick={handleClear}
            className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground hover:bg-muted-foreground/20 hover:text-foreground"
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
              <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </span>
        )}
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
          className={`shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Date range picker"
          className="absolute left-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-border bg-background p-3 shadow-lg ring-1 ring-black/5"
        >
          {/* header nav */}
          <div className="mb-2 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={prevMonth}
              aria-label="Previous month"
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="flex gap-8">
              <CalendarMonth
                year={viewYear}
                month={viewMonth}
                from={from}
                to={to}
                hovered={hovered}
                onDayClick={handleDayClick}
                onDayHover={setHovered}
              />
              <CalendarMonth
                year={secondYear}
                month={secondMonth}
                from={from}
                to={to}
                hovered={hovered}
                onDayClick={handleDayClick}
                onDayHover={setHovered}
              />
            </div>
            <button
              type="button"
              onClick={nextMonth}
              aria-label="Next month"
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* hint */}
          <p className="mt-1 text-center text-[11px] text-muted-foreground/60">
            {selecting === "from" ? "Select start date" : "Select end date"}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Filters bar ───────────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: AuditStatus | ""; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "passed", label: "Passed" },
  { value: "failed", label: "Failed" },
];

function FiltersBar({
  filters,
  disabled,
  onChange,
}: {
  filters: AuditFilters;
  disabled: boolean;
  onChange: (next: Partial<AuditFilters>) => void;
}) {
  const hasActiveFilters = !!(filters.status || filters.dateFrom || filters.dateTo);

  return (
    <div className="flex flex-wrap items-center gap-2 pt-[3px]">
      {/* Status */}
      <SelectControl
        value={filters.status ?? ""}
        options={STATUS_OPTIONS}
        onChange={(v) => onChange({ status: v as AuditStatus | "" })}
        disabled={disabled}
        label="Filter by status"
      />

      {/* Date range */}
      <DateRangePicker
        from={filters.dateFrom ? filters.dateFrom.slice(0, 10) : undefined}
        to={filters.dateTo ? filters.dateTo.slice(0, 10) : undefined}
        disabled={disabled}
        onChange={({ from, to }) =>
          onChange({
            dateFrom: from ? `${from}T00:00:00Z` : undefined,
            dateTo: to ? `${to}T23:59:59Z` : undefined,
          })
        }
      />

      {/* Reset */}
      {hasActiveFilters && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange({ status: "", dateFrom: undefined, dateTo: undefined })}
          className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Reset filters
        </button>
      )}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export const AuditsPage: React.FC = () => {
  const { data: user } = useMeQuery();
  const auditorId = user?.companyId ?? "";
  const {
    audits, loading, error, pagination,
    page, limit, filters,
    setPage, changeLimit,
    updateFilters,
    addAudit,
  } = useAuditStore(auditorId);

  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [resultAudit, setResultAudit] = React.useState<StoredAudit | null>(null);

  const handleAuditCreated = React.useCallback(
    (response: ServerAuditResponse) => {
      const stored = addAudit(response);
      setIsCreateOpen(false);
      setResultAudit(stored);
      const { audit: result } = response;
      if (result.is_passed) {
        toast.success("Audit passed", {
          description: `Score ${result.score}/100 — no critical or major issues found.`,
        });
      } else {
        toast.error("Audit failed", {
          description: `Score ${result.score}/100 — ${result.counts.critical} critical, ${result.counts.major} major issue${result.counts.major !== 1 ? "s" : ""}.`,
        });
      }
    },
    [addAudit],
  );

  return (
    <section className="flex h-full flex-col gap-4 overflow-hidden">
      <Card className="flex min-h-0 flex-1 flex-col">
        <CardHeader className="flex shrink-0 items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Audits List</h2>
          <Button
            type="button"
            size="sm"
            className="gap-1.5"
            onClick={() => setIsCreateOpen(true)}
            aria-label="Create Audit"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5 shrink-0"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Create Audit
          </Button>
        </CardHeader>

        <CardContent className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
          {error ? (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 ring-1 ring-inset ring-red-600/10">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0 text-red-500" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
                <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-red-800">Failed to load audits</p>
                <p className="mt-0.5 text-xs text-red-700">{error}</p>
              </div>
            </div>
          ) : (
            <>
              <FiltersBar filters={filters} disabled={loading} onChange={updateFilters} />
              <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-border bg-background">
                <div className="h-full max-h-full overflow-auto overscroll-contain">
                  <AuditsTable
                    audits={audits}
                    loading={loading}
                    onRowClick={(audit) => setResultAudit(audit)}
                    onCreateClick={() => setIsCreateOpen(true)}
                    sortBy={filters.sortBy ?? "date"}
                    sortOrder={filters.sortOrder ?? "desc"}
                    onSortChange={(sortBy, sortOrder) => updateFilters({ sortBy, sortOrder })}
                  />
                </div>
              </div>

              {pagination && (
                <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-3 min-w-0">
                  <span className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{pagination.total}</span> audits total
                  </span>

                  {pagination.totalPages > 1 && (
                    <Pagination
                      page={page}
                      totalPages={pagination.totalPages}
                      hasPrev={pagination.hasPrevPage}
                      hasNext={pagination.hasNextPage}
                      disabled={loading}
                      onPageChange={setPage}
                    />
                  )}

                  <LimitControl
                    value={limit}
                    onChange={changeLimit}
                    disabled={loading}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <CreateAuditDialog
        open={isCreateOpen}
        handleClose={() => setIsCreateOpen(false)}
        onAuditCreated={handleAuditCreated}
      />

      <AuditResultDialog
        audit={resultAudit}
        open={resultAudit !== null}
        onClose={() => setResultAudit(null)}
      />
    </section>
  );
};