import React from 'react';
import { Table, TableHead, TableRow, TableCell } from '../ui/table';
import { Skeleton } from '../ui/skeleton';
import type { StoredAudit } from '../../lib/utils/useAuditStore';

const SKELETON_ROW_COUNT = 8;

/** Shared compact tag styles: small type, light padding, normal weight */
const TAG =
  'inline-flex items-center rounded-full px-1.5 py-0.5 text-[11px] font-normal leading-tight';

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
      className={`${TAG} gap-1.5 ${
        passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
          passed ? 'bg-green-500' : 'bg-red-500'
        }`}
        aria-hidden="true"
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
    <div className="flex flex-wrap gap-1.5">
      {counts.critical > 0 && (
        <span className={`${TAG} bg-red-100 text-red-700`}>
          {counts.critical} Critical
        </span>
      )}
      {counts.major > 0 && (
        <span className={`${TAG} bg-orange-100 text-orange-700`}>
          {counts.major} Major
        </span>
      )}
      {counts.minor > 0 && (
        <span className={`${TAG} bg-yellow-100 text-yellow-700`}>
          {counts.minor} Minor
        </span>
      )}
      {counts.warning > 0 && (
        <span className={`${TAG} bg-blue-100 text-blue-700`}>
          {counts.warning} Warning
        </span>
      )}
    </div>
  );
}

export const AuditsTable: React.FC<Props> = ({ audits, loading, onRowClick }) => {
  if (loading) {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label="Loading audits"
        className="w-full"
      >
        <Table className="[&_thead_tr]:border-b-0">
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
            {Array.from({ length: SKELETON_ROW_COUNT }).map((_, rowIndex) => (
              <TableRow key={`audit-skeleton-${rowIndex}`}>
                <TableCell>
                  <Skeleton className="h-4 w-6" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-[4.5rem] rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-12 rounded-full" />
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1.5">
                    <Skeleton className="h-5 w-[3.25rem] rounded-full" />
                    <Skeleton className="h-5 w-11 rounded-full" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-full max-w-xs" />
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
        <span className="sr-only">Loading audits…</span>
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
    <Table className="[&_thead_tr]:border-b-0">
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
                <span className={`${TAG} ${scoreBg(result.score)}`}>
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