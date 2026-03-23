import React from 'react';
import { Table, TableHead, TableRow, TableCell } from '../ui/table';
import type { StoredAudit } from '../../lib/utils/useAuditStore';

type Props = {
  audits: StoredAudit[];
  loading: boolean;
  onRowClick: (audit: StoredAudit) => void;
};

function scoreBg(score: number): string {
  if (score < 50) return 'bg-red-100 text-red-700';
  if (score < 80) return 'bg-orange-100 text-orange-700';
  return 'bg-green-100 text-green-700';
}

function StatusBadge({ passed }: { passed: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
        passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          passed ? 'bg-green-500' : 'bg-red-500'
        }`}
      />
      {passed ? 'PASSED' : 'FAILED'}
    </span>
  );
}

function SeverityPills({
  counts,
}: {
  counts: StoredAudit['response']['audit']['counts'];
}) {
  const hasAny =
    counts.critical > 0 ||
    counts.major > 0 ||
    counts.minor > 0 ||
    counts.warning > 0;

  if (!hasAny) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {counts.critical > 0 && (
        <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-semibold text-red-700">
          {counts.critical}C
        </span>
      )}
      {counts.major > 0 && (
        <span className="rounded-full bg-orange-100 px-1.5 py-0.5 text-xs font-semibold text-orange-700">
          {counts.major}M
        </span>
      )}
      {counts.minor > 0 && (
        <span className="rounded-full bg-yellow-100 px-1.5 py-0.5 text-xs font-semibold text-yellow-700">
          {counts.minor}m
        </span>
      )}
      {counts.warning > 0 && (
        <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-xs font-semibold text-blue-700">
          {counts.warning}W
        </span>
      )}
    </div>
  );
}

export const AuditsTable: React.FC<Props> = ({ audits, loading, onRowClick }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!audits.length) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
        <span className="text-4xl">📋</span>
        <p className="text-sm">No audits yet. Create your first one.</p>
      </div>
    );
  }

  return (
    <Table>
      <thead>
        <TableRow>
          <TableHead>#</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Score</TableHead>
          <TableHead>Issues</TableHead>
          <TableHead>Summary</TableHead>
        </TableRow>
      </thead>
      <tbody>
        {audits.map((audit, idx) => {
          const { audit: result } = audit.response;
          return (
            <TableRow
              key={audit.id}
              className="cursor-pointer transition-colors hover:bg-muted/50"
              onClick={() => onRowClick(audit)}
            >
              <TableCell className="font-mono text-xs text-muted-foreground">
                {idx + 1}
              </TableCell>
              <TableCell className="whitespace-nowrap text-xs">
                {new Date(audit.createdAt).toLocaleString()}
              </TableCell>
              <TableCell>
                <StatusBadge passed={result.is_passed} />
              </TableCell>
              <TableCell>
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-bold ${scoreBg(result.score)}`}
                >
                  {result.score}/100
                </span>
              </TableCell>
              <TableCell>
                <SeverityPills counts={result.counts} />
              </TableCell>
              <TableCell className="max-w-xs">
                <p className="truncate text-xs text-muted-foreground">
                  {result.summary}
                </p>
              </TableCell>
            </TableRow>
          );
        })}
      </tbody>
    </Table>
  );
};