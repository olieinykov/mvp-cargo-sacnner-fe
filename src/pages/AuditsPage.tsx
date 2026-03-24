import React from 'react';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { AuditsTable } from '../components/audits/AuditsTable';
import { CreateAuditDialog } from '../forms/audits/CreateAuditDialog';
import { AuditResultDialog } from '../components/audits/AuditResultDialog';
import { useAuditStore } from '../lib/utils/useAuditStore';
import type { StoredAudit, ServerAuditResponse } from '../lib/utils/useAuditStore';

// ─── Rows-per-page custom input ────────────────────────────────────────────────

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
  const [inputVal, setInputVal] = React.useState(String(value));
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  // sync if external value changes
  React.useEffect(() => {
    setInputVal(String(value));
  }, [value]);

  // close dropdown on outside click
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const commit = (raw: string) => {
    const n = parseInt(raw, 10);
    if (!isNaN(n) && n > 0) {
      onChange(Math.min(n, 100));
      setInputVal(String(Math.min(n, 100)));
    } else {
      setInputVal(String(value));
    }
  };

  return (
    <div ref={ref} className="relative flex items-center gap-1.5">
  <span className="text-sm text-muted-foreground">Rows per page</span>

  <div className="flex items-center">
    {/* Input */}
    <input
      type="number"
      min={1}
      max={100}
      value={inputVal}
      disabled={disabled}
      onChange={(e) => setInputVal(e.target.value)}
      onBlur={(e) => commit(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit((e.target as HTMLInputElement).value);
      }}
      className="h-8 w-[60px] rounded-l-md border border-r-0 border-input bg-background px-2 text-center text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 z-10"
      aria-label="Rows per page"
    />

    {/* Chevron toggle */}
    <button
      type="button"
      disabled={disabled}
      onClick={() => setOpen((o) => !o)}
      className="flex h-8 items-center rounded-r-md border border-input bg-background px-1.5 text-muted-foreground transition-colors hover:bg-muted focus:outline-none disabled:opacity-50"
      aria-label="Open rows per page presets"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
      >
        <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  </div>

  {open && (
    <div className="absolute bottom-full right-0 z-50 mb-1.5 min-w-[80px] overflow-hidden rounded-lg border border-border bg-background shadow-lg">
      {LIMIT_PRESETS.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => {
            onChange(opt);
            setInputVal(String(opt));
            setOpen(false);
          }}
          className={`flex w-full items-center justify-between px-3 py-1.5 text-sm transition-colors hover:bg-muted ${
            opt === value ? 'font-semibold text-foreground' : 'text-muted-foreground'
          }`}
        >
          {opt}
          {opt === value && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      ))}
    </div>
  )}
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
  // Build visible page numbers with ellipsis
  const pages = React.useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const result: (number | '…')[] = [];
    const addRange = (from: number, to: number) => {
      for (let i = from; i <= to; i++) result.push(i);
    };
    result.push(1);
    if (page > 4) result.push('…');
    const start = Math.max(2, page - 2);
    const end   = Math.min(totalPages - 1, page + 2);
    addRange(start, end);
    if (page < totalPages - 3) result.push('…');
    result.push(totalPages);
    return result;
  }, [page, totalPages]);

  return (
    <div className="flex items-center gap-1">
      {/* Prev */}
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={!hasPrev || disabled}
        className="flex h-8 items-center gap-1 rounded-md border border-input bg-background px-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Previous
      </button>

      {/* Page numbers */}
      <div className="flex items-center gap-0.5">
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="flex h-8 w-8 items-center justify-center text-sm text-muted-foreground">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p as number)}
              disabled={disabled}
              className={`flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-40 ${
                p === page
                  ? 'bg-foreground text-background'
                  : 'border border-input bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {p}
            </button>
          ),
        )}
      </div>

      {/* Next */}
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNext || disabled}
        className="flex h-8 items-center gap-1 rounded-md border border-input bg-background px-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
      >
        Next
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export const AuditsPage: React.FC = () => {
  const {
    audits,
    loading,
    error,
    pagination,
    page,
    limit,
    setPage,
    changeLimit,
    addAudit,
  } = useAuditStore();

  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [resultAudit, setResultAudit]   = React.useState<StoredAudit | null>(null);

  const handleAuditCreated = React.useCallback(
    (response: ServerAuditResponse) => {
      const stored = addAudit(response);
      setIsCreateOpen(false);
      setResultAudit(stored);
    },
    [addAudit],
  );

  return (
    <section className="flex h-full flex-col gap-4 overflow-hidden">
      <Card className="flex min-h-0 flex-1 flex-col">
        <CardHeader className="flex shrink-0 items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Audits list</h2>
          <Button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            aria-label="Create audit"
          >
            Create audit
          </Button>
        </CardHeader>

        <CardContent className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Failed to load audits: {error}
            </div>
          ) : (
            <>
              {/* Scrollable table area */}
              <div className="min-h-0 flex-1 overflow-y-auto">
                <AuditsTable
                  audits={audits}
                  loading={loading}
                  onRowClick={(audit) => setResultAudit(audit)}
                />
              </div>

              {/* Pagination + limit bar */}
              {pagination && (
                <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t pt-3">
                  {/* Left: total info */}
                  <span className="text-sm text-muted-foreground">
                    {pagination.total} Audits
                  </span>

                  {/* Center: page numbers */}
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

                  {/* Right: rows per page */}
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