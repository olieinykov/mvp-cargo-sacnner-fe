import { useInspectionViolationsQuery } from '../../lib/api/company';
import { Skeleton } from '../ui/skeleton';
import { YesNoBadge } from '../ui/YesNo';

type ViolationsSectionProps = { inspectionId: string };

export const ViolationsSection: React.FC<ViolationsSectionProps> = ({ inspectionId }) => {
  const { data, isLoading, error } = useInspectionViolationsQuery(inspectionId);
  const violations = Array.isArray(data) ? data : (data?.violations ?? []);

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
        <svg
          width="15"
          height="15"
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
        Failed to load violations: {error.message}
      </div>
    );
  }

  if (!violations.length) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          className="text-emerald-400"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M8 12l3 3 5-5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
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
            <th className="px-3 py-2.5 text-left font-semibold uppercase tracking-wider text-muted-foreground">
              #
            </th>
            <th className="px-3 py-2.5 text-left font-semibold uppercase tracking-wider text-muted-foreground">
              CFR Part
            </th>
            <th className="px-3 py-2.5 text-left font-semibold uppercase tracking-wider text-muted-foreground">
              Section
            </th>
            <th className="px-3 py-2.5 text-left font-semibold uppercase tracking-wider text-muted-foreground">
              Unit
            </th>
            <th className="px-3 py-2.5 text-left font-semibold uppercase tracking-wider text-muted-foreground">
              OOS
            </th>
            <th className="px-3 py-2.5 text-left font-semibold uppercase tracking-wider text-muted-foreground">
              Citation #
            </th>
          </tr>
        </thead>
        <tbody>
          {violations.map((v, i) => (
            <tr key={v.id ?? i} className="border-b border-border/40 hover:bg-muted/20">
              <td className="px-3 py-2.5 font-mono text-muted-foreground/60">
                {v.seq_no ?? i + 1}
              </td>
              <td className="px-3 py-2.5 font-mono font-medium">{v.part_no ?? '—'}</td>
              <td className="px-3 py-2.5 text-muted-foreground">{v.part_no_section ?? '—'}</td>
              <td className="px-3 py-2.5 capitalize text-muted-foreground">
                {v.insp_viol_unit ?? '—'}
              </td>
              <td className="px-3 py-2.5">
                <YesNoBadge value={v.out_of_service_indicator} />
              </td>
              <td className="px-3 py-2.5 font-mono text-muted-foreground">
                {v.citation_number ?? '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
