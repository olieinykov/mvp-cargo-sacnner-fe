import React from 'react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { AuditsTable } from '../components/audits/AuditsTable';
import { CreateAuditDialog } from '../forms/audits/CreateAuditDialog';
import { AuditResultDialog } from '../components/audits/AuditResultDialog';
import { useAuditStore } from '../lib/utils/useAuditStore';
import type { StoredAudit, ServerAuditResponse } from '../lib/utils/useAuditStore';
import { useMeQuery } from '../lib/api/auth';
import { Pagination } from '../components/ui/Pagination';
import { FiltersBar } from '../components/audits/AuditsFiltersBar';
import { LimitControl } from '../components/ui/SelectControl';

// ─── Page ──────────────────────────────────────────────────────────────────────

export const AuditsPage: React.FC = () => {
  const { data: user, isLoading: userLoading } = useMeQuery();
  const auditorId = user?.companyId ?? '';
  const {
    audits,
    loading,
    error,
    pagination,
    page,
    limit,
    filters,
    setPage,
    changeLimit,
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
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className="mt-0.5 shrink-0 text-red-500"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
                <path
                  d="M12 8v4M12 16h.01"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
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
                    userLoading={userLoading}
                    onRowClick={(audit) => setResultAudit(audit)}
                    onCreateClick={() => setIsCreateOpen(true)}
                    sortBy={filters.sortBy ?? 'date'}
                    sortOrder={filters.sortOrder ?? 'desc'}
                    onSortChange={(sortBy, sortOrder) => updateFilters({ sortBy, sortOrder })}
                  />
                </div>
              </div>

              {pagination && (
                <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-3 min-w-0">
                  <span className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{pagination.total}</span> audits
                    total
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

                  <LimitControl value={limit} onChange={changeLimit} disabled={loading} />
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
