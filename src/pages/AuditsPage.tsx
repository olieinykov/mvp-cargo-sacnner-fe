import React from 'react';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { AuditsTable } from '../components/audits/AuditsTable';
import { CreateAuditDialog } from '../forms/audits/CreateAuditDialog';
import { AuditResultDialog } from '../components/audits/AuditResultDialog';
import { useAuditStore } from '../lib/utils/useAuditStore';
import type { StoredAudit, ServerAuditResponse } from '../lib/utils/useAuditStore';

export const AuditsPage: React.FC = () => {
  const { audits, addAudit } = useAuditStore();

  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [resultAudit, setResultAudit] = React.useState<StoredAudit | null>(null);

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
          <Button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            aria-label="Create audit"
          >
            Create audit
          </Button>
        </CardHeader>

        <CardContent>
          <AuditsTable
            audits={audits}
            onRowClick={(audit) => setResultAudit(audit)}
          />
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