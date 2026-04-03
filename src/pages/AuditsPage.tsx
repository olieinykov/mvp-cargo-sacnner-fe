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
import { useAuthStore } from "../lib/utils/useAuthStore";

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

// ─── Page ──────────────────────────────────────────────────────────────────────

export const AuditsPage: React.FC = () => {
  const { user } = useAuthStore();
  const auditorId = user?.companyId ?? "";
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
  } = useAuditStore(auditorId);

  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [resultAudit, setResultAudit] = React.useState<StoredAudit | null>(
    null,
  );

  const handleAuditCreated = React.useCallback(
    (response: ServerAuditResponse) => {
      const stored = addAudit(response);
      setIsCreateOpen(false);
      setResultAudit(stored);
      const { audit: result } = response;
      if (result.is_passed) {
        toast.success('Audit passed', {
          description: `Score ${result.score}/100 — no critical or major issues found.`,
        });
      } else {
        toast.error('Audit failed', {
          description: `Score ${result.score}/100 — ${result.counts.critical} critical, ${result.counts.major} major issue${result.counts.major !== 1 ? 's' : ''}.`,
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
              <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-border bg-background">
                <div className="h-full max-h-full overflow-auto overscroll-contain">
                  <AuditsTable
                    audits={audits}
                    loading={loading}
                    onRowClick={(audit) => setResultAudit(audit)}
                    onCreateClick={() => setIsCreateOpen(true)}
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
