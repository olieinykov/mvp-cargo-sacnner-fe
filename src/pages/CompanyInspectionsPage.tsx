import React from 'react';
import ReactDOM from 'react-dom';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Table, TableHead, TableRow, TableCell } from '../components/ui/table';
import { Skeleton } from '../components/ui/skeleton';
import type { Inspection } from '../lib/api/company';
import { useCompanyInspectionsQuery, useCompanyQuery } from '../lib/api/company';
import { useMeQuery } from '../lib/api/auth';
import { InspectionDetailModal } from '../components/company/InspectionDetailModal';
import { INSP_LEVEL_LABELS } from '../lib/utils/constants';
import { fmtDate } from '../lib/utils/date';
import { ViolationCount } from '../components/ui/ViolationCount';

const BADGE =
  'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium leading-none ring-1 ring-inset';

// ─── Skeleton rows ─────────────────────────────────────────────────────────────

const SKELETON_ROWS = 6;

// ─── Main page ─────────────────────────────────────────────────────────────────

export const CompanyInspectionsPage: React.FC = () => {
  const { data: user, isLoading: userLoading } = useMeQuery();
  const { data: company } = useCompanyQuery(user?.companyId);

  const dotNumber = company?.dotNumber;
  const {
    data: inspectionsData,
    isLoading: inspectionsLoading,
    error,
  } = useCompanyInspectionsQuery(dotNumber);

  const rawData = inspectionsData as
    | Inspection[]
    | { data?: Inspection[]; inspections?: Inspection[] }
    | undefined;

  const inspections: Inspection[] = Array.isArray(rawData)
    ? rawData
    : (rawData?.data ?? rawData?.inspections ?? []);
  const isLoading = userLoading || inspectionsLoading;

  const [selected, setSelected] = React.useState<Inspection | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  const openDetail = (insp: Inspection) => {
    setSelected(insp);
    setModalOpen(true);
  };

  return (
    <section className="flex h-full flex-col gap-4 overflow-hidden">
      <Card className="flex min-h-0 flex-1 flex-col">
        <CardHeader className="flex shrink-0 items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Company Inspections</h2>
          {dotNumber && (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-border/50 bg-muted/30 px-2.5 py-1 font-mono text-xs text-muted-foreground">
              DOT #{dotNumber}
            </span>
          )}
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
                <p className="text-sm font-semibold text-red-800">Failed to load inspections</p>
                <p className="mt-0.5 text-xs text-red-700">{error.message}</p>
              </div>
            </div>
          ) : (
            <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-border bg-background">
              <div className="h-full max-h-full overflow-auto overscroll-contain">
                {isLoading ? (
                  <div role="status" aria-busy="true" aria-label="Loading inspections">
                    <Table>
                      <thead>
                        <TableRow>
                          <TableHead className="w-10">#</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>State</TableHead>
                          <TableHead>Level</TableHead>
                          <TableHead>Carrier</TableHead>
                          <TableHead>Violations</TableHead>
                          <TableHead>OOS</TableHead>
                          <TableHead>Hazmat</TableHead>
                          <TableHead />
                        </TableRow>
                      </thead>
                      <tbody>
                        {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell>
                              <Skeleton className="h-4 w-5" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-24" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-8" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-5 w-20 rounded-md" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-32" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-8" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-8" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-5 w-12 rounded-md" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-6 w-14 rounded-lg" />
                            </TableCell>
                          </TableRow>
                        ))}
                      </tbody>
                    </Table>
                    <span className="sr-only">Loading inspections…</span>
                  </div>
                ) : !inspections.length ? (
                  <div className="flex flex-col items-center gap-4 py-20 text-muted-foreground">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border/50 bg-muted/30">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="opacity-50"
                        aria-hidden="true"
                      >
                        <path
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <rect
                          x="9"
                          y="3"
                          width="6"
                          height="4"
                          rx="1"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                      </svg>
                    </div>
                    <div className="space-y-1 text-center">
                      <p className="text-sm font-medium text-foreground">No inspections found</p>
                      <p className="text-xs text-muted-foreground">
                        No FMCSA inspection records for DOT #{dotNumber}.
                      </p>
                    </div>
                  </div>
                ) : (
                  <Table>
                    <thead>
                      <TableRow>
                        <TableHead className="w-10">#</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>State</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Carrier</TableHead>
                        <TableHead>Violations</TableHead>
                        <TableHead>OOS</TableHead>
                        <TableHead>Hazmat</TableHead>
                        <TableHead />
                      </TableRow>
                    </thead>
                    <tbody>
                      {inspections.map((insp, idx) => {
                        const level =
                          insp.insp_level_id != null
                            ? (INSP_LEVEL_LABELS[insp.insp_level_id] ??
                              `Level ${insp.insp_level_id}`)
                            : null;

                        return (
                          <TableRow key={insp.id ?? idx} className="group">
                            <TableCell className="font-mono text-xs text-muted-foreground/60">
                              {idx + 1}
                            </TableCell>
                            <TableCell>
                              <span className="text-sm font-medium text-foreground/90">
                                {fmtDate(insp.insp_date)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="font-mono text-sm font-semibold text-foreground/80">
                                {insp.report_state}
                              </span>
                            </TableCell>
                            <TableCell>
                              {level ? (
                                <span className={`${BADGE} bg-sky-50 text-sky-700 ring-sky-600/20`}>
                                  {level}
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground/50">—</span>
                              )}
                            </TableCell>
                            <TableCell className="max-w-[180px]">
                              <p className="truncate text-xs text-muted-foreground">
                                {insp.insp_carrier_name ?? '—'}
                                {insp.insp_carrier_city && (
                                  <span className="ml-1 text-muted-foreground/50">
                                    · {insp.insp_carrier_city}
                                    {insp.insp_carrier_state ? `, ${insp.insp_carrier_state}` : ''}
                                  </span>
                                )}
                              </p>
                            </TableCell>
                            <TableCell>
                              <ViolationCount count={insp.viol_total} />
                            </TableCell>
                            <TableCell>
                              {insp.oos_total != null && insp.oos_total > 0 ? (
                                <span className={`${BADGE} bg-red-50 text-red-700 ring-red-600/20`}>
                                  {insp.oos_total} OOS
                                </span>
                              ) : (
                                <ViolationCount count={insp.oos_total} />
                              )}
                            </TableCell>
                            <TableCell>
                              {insp.hazmat_viol_total != null && insp.hazmat_viol_total > 0 ? (
                                <span
                                  className={`${BADGE} bg-orange-50 text-orange-700 ring-orange-600/20`}
                                >
                                  {insp.hazmat_viol_total} HM
                                </span>
                              ) : insp.hazmat_placard_req === 'Y' ? (
                                <span
                                  className={`${BADGE} bg-yellow-50 text-yellow-700 ring-yellow-600/20`}
                                >
                                  Placarded
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground/50">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <button
                                type="button"
                                onClick={() => openDetail(insp)}
                                className="rounded-lg border border-border/60 bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:border-border hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              >
                                More
                              </button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </tbody>
                  </Table>
                )}
              </div>
            </div>
          )}

          {!isLoading && !error && inspections.length > 0 && (
            <div className="shrink-0 border-t border-border/40 pt-2">
              <span className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{inspections.length}</span>{' '}
                inspection{inspections.length !== 1 ? 's' : ''} total
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {ReactDOM.createPortal(
        <InspectionDetailModal
          inspection={selected}
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelected(null);
          }}
        />,
        document.body,
      )}
    </section>
  );
};
