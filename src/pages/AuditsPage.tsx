import React from 'react';
import { Button } from '../components/ui/button';
import { AuditsTable } from '../components/audits/AuditsTable';
import { CreateAuditDialog } from '../forms/audits/CreateAuditDialog';
import { Card, CardContent, CardHeader } from '../components/ui/card';

export const AuditsPage: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <section className="space-y-4">
      <Card>
        <CardHeader className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Audits list</h2>
          <Button
            type="button"
            onClick={handleOpenDialog}
            aria-label="Create audit"
          >
            Create audit
          </Button>
        </CardHeader>

        <CardContent>
          <AuditsTable />
        </CardContent>
      </Card>

      <CreateAuditDialog open={isDialogOpen} handleClose={handleCloseDialog} />
    </section>
  );
};

