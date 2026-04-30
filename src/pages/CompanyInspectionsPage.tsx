import React from 'react';
import ReactDOM from 'react-dom';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Table, TableHead, TableRow, TableCell } from '../components/ui/table';
import { Skeleton } from '../components/ui/skeleton';
import { Modal } from '../components/ui/dialog';
import type { Inspection } from '../lib/api/company';
import { useCompanyInspectionsQuery, useCompanyQuery, useInspectionViolationsQuery } from '../lib/api/company';
import { useMeQuery } from '../lib/api/auth';

// ─── Constants ─────────────────────────────────────────────────────────────────

const INSP_LEVEL_LABELS: Record<number, string> = {
  1: 'Full',
  2: 'Walk-Around',
  3: 'Driver-Only',
  4: 'Special Study',
  5: 'Terminal',
  99: 'Invalid',
};

const CI_STATUS_LABELS: Record<string, string> = {
  U: 'Unprocessed',
  T: 'To Census Search',
  C: 'Complete',
  D: 'Duplicate',
  N: 'Non-match',
  H: 'FMCSA Hold',
  I: 'Intrastate',
  P: 'Potential Resolution',
  X: 'Non-motor carrier',
};

const BADGE = 'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium leading-none ring-1 ring-inset';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(v: string | null): string {
  if (!v) return '—';
  const d = new Date(v);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function yesNo(v: string | null) {
  if (v === 'Y') return <span className={`${BADGE} bg-emerald-50 text-emerald-700 ring-emerald-600/20`}>Yes</span>;
  if (v === 'N') return <span className={`${BADGE} bg-red-50 text-red-700 ring-red-600/20`}>No</span>;
  return <span className="text-xs text-muted-foreground/50">—</span>;
}

function violCount(n: number | null) {
  if (n == null) return <span className="text-muted-foreground/50">—</span>;
  if (n === 0) return <span className="text-muted-foreground/50">0</span>;
  return <span className="font-mono text-sm font-semibold text-amber-600">{n}</span>;
}

// ─── Violations table inside modal ────────────────────────────────────────────

function ViolationsSection({ inspectionId }: { inspectionId: string }) {
  const { data, isLoading, error } = useInspectionViolationsQuery(inspectionId);
  const violations = Array.isArray(data) ? data : data?.violations ?? [];

  if (isLoading) {
    return (
      <div className="space-y-2 pt-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-800">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0 text-red-500" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        Failed to load violations: {error.message}
      </div>
    );
  }

  if (!violations.length) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-emerald-400" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="text-sm">No violations recorded.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="px-3 py-2.5 text-left font-semibold uppercase tracking-wider text-muted-foreground">#</th>
            <th className="px-3 py-2.5 text-left font-semibold uppercase tracking-wider text-muted-foreground">CFR Part</th>
            <th className="px-3 py-2.5 text-left font-semibold uppercase tracking-wider text-muted-foreground">Section</th>
            <th className="px-3 py-2.5 text-left font-semibold uppercase tracking-wider text-muted-foreground">Unit</th>
            <th className="px-3 py-2.5 text-left font-semibold uppercase tracking-wider text-muted-foreground">OOS</th>
            <th className="px-3 py-2.5 text-left font-semibold uppercase tracking-wider text-muted-foreground">Citation #</th>
          </tr>
        </thead>
        <tbody>
          {violations.map((v, i) => (
            <tr key={v.id ?? i} className="border-b border-border/40 hover:bg-muted/20">
              <td className="px-3 py-2.5 font-mono text-muted-foreground/60">{v.seq_no ?? i + 1}</td>
              <td className="px-3 py-2.5 font-mono font-medium">{v.part_no ?? '—'}</td>
              <td className="px-3 py-2.5 text-muted-foreground">{v.part_no_section ?? '—'}</td>
              <td className="px-3 py-2.5 capitalize text-muted-foreground">{v.insp_viol_unit ?? '—'}</td>
              <td className="px-3 py-2.5">{yesNo(v.out_of_service_indicator)}</td>
              <td className="px-3 py-2.5 font-mono text-muted-foreground">{v.citation_number ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Detail modal ──────────────────────────────────────────────────────────────

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border border-border/30 bg-muted/10 px-3 py-2.5">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="text-sm text-foreground/90">{children}</div>
    </div>
  );
}

function InspectionDetailModal({
  inspection,
  open,
  onClose,
}: {
  inspection: Inspection | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!open || !inspection) return null;

  const level = inspection.insp_level_id != null ? INSP_LEVEL_LABELS[inspection.insp_level_id] ?? `Level ${inspection.insp_level_id}` : '—';
  const status = inspection.ci_status_code ? (CI_STATUS_LABELS[inspection.ci_status_code] ?? inspection.ci_status_code) : '—';

  return (
    <Modal
      open={open}
      onOpenChange={(v) => { if (!v) onClose(); }}
      title={`Inspection ${inspection.inspection_id}`}
      description={`Reported in ${inspection.report_state} · ${fmtDate(inspection.insp_date)}`}
    >
      {/* ── Overview ── */}
      <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <DetailRow label="Date">{fmtDate(inspection.insp_date)}</DetailRow>
        <DetailRow label="State">{inspection.report_state}</DetailRow>
        <DetailRow label="Level">{level}</DetailRow>
        <DetailRow label="Status">{status}</DetailRow>
        <DetailRow label="Report #">{inspection.report_number ?? '—'}</DetailRow>
        <DetailRow label="Facility">{inspection.insp_facility ?? '—'}</DetailRow>
        <DetailRow label="Post Accident">{yesNo(inspection.post_acc_ind)}</DetailRow>
        <DetailRow label="Hazmat Placards Req.">{yesNo(inspection.hazmat_placard_req)}</DetailRow>
        <DetailRow label="Location">{inspection.location_desc ?? '—'}</DetailRow>
      </div>

      {/* ── Carrier at time ── */}
      {(inspection.insp_carrier_name || inspection.insp_carrier_city) && (
        <div className="mb-5">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Carrier at Time of Inspection
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <DetailRow label="Name">{inspection.insp_carrier_name ?? '—'}</DetailRow>
            <DetailRow label="City">{inspection.insp_carrier_city ?? '—'}</DetailRow>
            <DetailRow label="State">{inspection.insp_carrier_state ?? '—'}</DetailRow>
          </div>
        </div>
      )}

      {/* ── Violations summary ── */}
      <div className="mb-5">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Violation Totals
        </p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Total Violations', val: inspection.viol_total },
            { label: 'Total OOS', val: inspection.oos_total },
            { label: 'Driver Violations', val: inspection.driver_viol_total },
            { label: 'Vehicle Violations', val: inspection.vehicle_viol_total },
            { label: 'Hazmat Violations', val: inspection.hazmat_viol_total },
          ].map(({ label, val }) => (
            <DetailRow key={label} label={label}>
              {val != null ? (
                <span className={`font-mono text-base font-bold ${val > 0 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                  {val}
                </span>
              ) : '—'}
            </DetailRow>
          ))}
        </div>
      </div>

      {/* ── Enforcement checks ── */}
      <div className="mb-5">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Enforcement Checks
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <DetailRow label="Alcohol / Controlled Sub.">{yesNo(inspection.alcohol_control_sub)}</DetailRow>
          <DetailRow label="Drug Interdiction">{yesNo(inspection.drug_intrdctn_search)}</DetailRow>
        </div>
      </div>

      {/* ── Violations list ── */}
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Violations
        </p>
        <ViolationsSection inspectionId={inspection.id} />
      </div>
    </Modal>
  );
}

// ─── Skeleton rows ─────────────────────────────────────────────────────────────

const SKELETON_ROWS = 6;

// ─── Main page ─────────────────────────────────────────────────────────────────

export const CompanyInspectionsPage: React.FC = () => {
  const { data: user, isLoading: userLoading } = useMeQuery();
  const { data: company } = useCompanyQuery(user?.companyId);
  
  const dotNumber = company?.dotNumber;
  const { data: inspectionsData, isLoading: inspectionsLoading, error } = useCompanyInspectionsQuery(dotNumber);
  
  const rawData = inspectionsData as 
    | Inspection[] 
    | { data?: Inspection[]; inspections?: Inspection[] } 
    | undefined;

  const inspections: Inspection[] = Array.isArray(rawData)
    ? rawData
    : rawData?.data ?? rawData?.inspections ?? [];
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0 text-red-500" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
                <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
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
                            <TableCell><Skeleton className="h-4 w-5" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-20 rounded-md" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-12 rounded-md" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-14 rounded-lg" /></TableCell>
                          </TableRow>
                        ))}
                      </tbody>
                    </Table>
                    <span className="sr-only">Loading inspections…</span>
                  </div>
                ) : !inspections.length ? (
                  <div className="flex flex-col items-center gap-4 py-20 text-muted-foreground">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border/50 bg-muted/30">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="opacity-50" aria-hidden="true">
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </div>
                    <div className="space-y-1 text-center">
                      <p className="text-sm font-medium text-foreground">No inspections found</p>
                      <p className="text-xs text-muted-foreground">No FMCSA inspection records for DOT #{dotNumber}.</p>
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
                        const level = insp.insp_level_id != null
                          ? INSP_LEVEL_LABELS[insp.insp_level_id] ?? `Level ${insp.insp_level_id}`
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
                              ) : <span className="text-xs text-muted-foreground/50">—</span>}
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
                            <TableCell>{violCount(insp.viol_total)}</TableCell>
                            <TableCell>
                              {insp.oos_total != null && insp.oos_total > 0 ? (
                                <span className={`${BADGE} bg-red-50 text-red-700 ring-red-600/20`}>
                                  {insp.oos_total} OOS
                                </span>
                              ) : violCount(insp.oos_total)}
                            </TableCell>
                            <TableCell>
                              {insp.hazmat_viol_total != null && insp.hazmat_viol_total > 0 ? (
                                <span className={`${BADGE} bg-orange-50 text-orange-700 ring-orange-600/20`}>
                                  {insp.hazmat_viol_total} HM
                                </span>
                              ) : (
                                insp.hazmat_placard_req === 'Y' ? (
                                  <span className={`${BADGE} bg-yellow-50 text-yellow-700 ring-yellow-600/20`}>
                                    Placarded
                                  </span>
                                ) : <span className="text-xs text-muted-foreground/50">—</span>
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
                <span className="font-semibold text-foreground">{inspections.length}</span> inspection{inspections.length !== 1 ? 's' : ''} total
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {ReactDOM.createPortal(
        <InspectionDetailModal
          inspection={selected}
          open={modalOpen}
          onClose={() => { setModalOpen(false); setSelected(null); }}
        />,
        document.body,
      )}
    </section>
  );
};