import React from 'react';
import { Table, TableHead, TableRow, TableCell } from '../ui/table';
import { Skeleton } from '../ui/skeleton';
import type { StoredAudit } from '../../lib/utils/useAuditStore';

const SKELETON_ROW_COUNT = 8;

type Props = {
  audits: StoredAudit[];
  loading: boolean;
  onRowClick: (audit: StoredAudit) => void;
  onCreateClick?: () => void;
};

const scoreColor = (score: number): string => {
  if (score < 50) return 'text-red-500';
  if (score < 80) return 'text-amber-500';
  return 'text-emerald-500';
};

const BADGE = 'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium leading-none ring-1 ring-inset';

function StatusBadge({ passed }: { passed: boolean }) {
  return passed ? (
    <span className={`${BADGE} bg-emerald-50 text-emerald-700 ring-emerald-600/20`}>
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden="true" />
      Passed
    </span>
  ) : (
    <span className={`${BADGE} bg-red-50 text-red-700 ring-red-600/20`}>
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" aria-hidden="true" />
      Failed
    </span>
  );
}

function SeverityPills({
  counts,
}: {
  counts: StoredAudit['response']['audit']['counts'];
}) {
  const hasAny =
    counts.critical > 0 || counts.major > 0 || counts.minor > 0 || counts.warning > 0;

  if (!hasAny) {
    return <span className="text-xs text-muted-foreground/50">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {counts.critical > 0 && (
        <span className={`${BADGE} bg-red-50 text-red-700 ring-red-600/20`}>
          {counts.critical} Critical
        </span>
      )}
      {counts.major > 0 && (
        <span className={`${BADGE} bg-orange-50 text-orange-700 ring-orange-600/20`}>
          {counts.major} Major
        </span>
      )}
      {counts.minor > 0 && (
        <span className={`${BADGE} bg-yellow-50 text-yellow-700 ring-yellow-600/20`}>
          {counts.minor} Minor
        </span>
      )}
      {counts.warning > 0 && (
        <span className={`${BADGE} bg-sky-50 text-sky-700 ring-sky-600/20`}>
          {counts.warning} Warning
        </span>
      )}
    </div>
  );
}

function DateCell({ dateStr }: { dateStr: string }) {
  const d = new Date(dateStr);
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-sm font-medium text-foreground/90">{date}</span>
      <span className="text-xs text-muted-foreground">{time}</span>
    </div>
  );
}

const TableHeader: React.FC = () => (
  <thead>
    <TableRow>
      <TableHead className="w-12">#</TableHead>
      <TableHead>Date</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Score</TableHead>
      <TableHead>Issues</TableHead>
      <TableHead>Summary</TableHead>
    </TableRow>
  </thead>
);

export const AuditsTable: React.FC<Props> = ({ audits, loading, onRowClick, onCreateClick }) => {
  if (loading) {
    return (
      <div role="status" aria-busy="true" aria-label="Loading audits" className="w-full">
        <Table>
          <TableHeader />
          <tbody>
            {Array.from({ length: SKELETON_ROW_COUNT }).map((_, rowIndex) => (
              <TableRow key={`audit-skeleton-${rowIndex}`}>
                <TableCell><Skeleton className="h-4 w-6" /></TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-6 w-20 rounded-md" /></TableCell>
                <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Skeleton className="h-5 w-16 rounded-md" />
                    <Skeleton className="h-5 w-14 rounded-md" />
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-4 w-full max-w-xs" /></TableCell>
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
      <div className="flex flex-col items-center gap-4 py-20 text-muted-foreground">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border/50 bg-muted/30">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="opacity-50" aria-hidden="true">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <div className="space-y-1 text-center">
          <p className="text-sm font-medium text-foreground">No audits yet</p>
          <p className="text-xs text-muted-foreground">Upload files to run your first hazmat compliance check.</p>
        </div>
        {onCreateClick && (
          <button
            type="button"
            onClick={onCreateClick}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Create your first audit
          </button>
        )}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader />
      <tbody>
        {audits.map((audit, idx) => {
          const { audit: result } = audit.response;
          return (
            <TableRow
              key={audit.id}
              className="cursor-pointer hover:bg-muted/40"
              onClick={() => onRowClick(audit)}
              tabIndex={0}
              aria-label={`Audit ${idx + 1}, ${result.is_passed ? 'passed' : 'failed'}, score ${result.score}`}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onRowClick(audit); }}
            >
              <TableCell className="font-mono text-xs text-muted-foreground/60">
                {idx + 1}
              </TableCell>
              <TableCell>
                <DateCell dateStr={audit.createdAt} />
              </TableCell>
              <TableCell>
                <StatusBadge passed={result.is_passed} />
              </TableCell>
              <TableCell>
                <span className={`font-mono text-sm font-semibold ${scoreColor(result.score)}`}>
                  {result.score}
                  <span className="text-[11px] font-normal text-muted-foreground/60">/100</span>
                </span>
              </TableCell>
              <TableCell>
                <SeverityPills counts={result.counts} />
              </TableCell>
              <TableCell className="max-w-sm">
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