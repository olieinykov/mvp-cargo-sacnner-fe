import React from 'react';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { AuditsTable } from '../components/audits/AuditsTable';
import { CreateAuditDialog } from '../forms/audits/CreateAuditDialog';
import { AuditResultDialog } from '../components/audits/AuditResultDialog';
import { useAuditStore } from '../lib/utils/useAuditStore';
import type { StoredAudit, ServerAuditResponse } from '../lib/utils/useAuditStore';

const LIMIT_OPTIONS = [10, 20, 50, 100];

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
          <div className="flex items-center gap-2">
            {/* Limit selector */}
            <select
              value={limit}
              onChange={(e) => changeLimit(Number(e.target.value))}
              disabled={loading}
              className="rounded-md border border-input bg-background px-2 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Rows per page"
            >
              {LIMIT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} per page
                </option>
              ))}
            </select>

            <Button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              aria-label="Create audit"
            >
              Create audit
            </Button>
          </div>
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

              {/* Pagination controls */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex shrink-0 items-center justify-between border-t pt-3 text-sm text-muted-foreground">
                  <span>
                    {pagination.total} Total · Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={!pagination.hasPrevPage || loading}
                    >
                      ← Prev
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={!pagination.hasNextPage || loading}
                    >
                      Next →
                    </Button>
                  </div>
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