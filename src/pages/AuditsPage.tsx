import React from 'react';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { AuditsTable } from '../components/audits/AuditsTable';
import { CreateAuditDialog } from '../forms/audits/CreateAuditDialog';
import { AuditResultDialog } from '../components/audits/AuditResultDialog';
import { useAuditStore } from '../lib/utils/useAuditStore';
import type { StoredAudit, ServerAuditResponse } from '../lib/utils/useAuditStore';

export const AuditsPage: React.FC = () => {
  const { audits, loading, error, addAudit, refetch } = useAuditStore();

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
    <section className="space-y-4">
      <Card>
        <CardHeader className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Audits list</h2>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={refetch}
              disabled={loading}
              aria-label="Refresh audits"
            >
              {loading ? 'Loading…' : 'Refresh'}
            </Button>
            <Button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              aria-label="Create audit"
            >
              Create audit
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Failed to load audits: {error}
              <button
                type="button"
                onClick={refetch}
                className="ml-3 font-medium underline hover:no-underline"
              >
                Try again
              </button>
            </div>
          ) : (
            <AuditsTable
              audits={audits}
              loading={loading}
              onRowClick={(audit) => setResultAudit(audit)}
            />
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