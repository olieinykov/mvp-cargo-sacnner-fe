import React from 'react';
import { Modal } from '../ui/dialog';
import type {
  StoredAudit,
  AuditIssue,
  Severity,
  SlotResult,
  SlotExtracted,
  ExtractedField,
  OtherNote,
} from '../../lib/utils/useAuditStore';

// ─── Helpers ───────────────────────────────────────────────────────────────────

const BADGE = 'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium leading-none ring-1 ring-inset';

const SEVERITY_CONFIG: Record<
  Severity,
  { color: string; bg: string; border: string; dot: string; bar: string; badgeRing: string }
> = {
  CRITICAL: {
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    dot: 'bg-red-500',
    bar: 'bg-red-500',
    badgeRing: 'ring-red-600/20',
  },
  MAJOR: {
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    dot: 'bg-orange-500',
    bar: 'bg-orange-500',
    badgeRing: 'ring-orange-600/20',
  },
  MINOR: {
    color: 'text-yellow-700',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    dot: 'bg-yellow-400',
    bar: 'bg-yellow-400',
    badgeRing: 'ring-yellow-600/20',
  },
  WARNING: {
    color: 'text-sky-700',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    dot: 'bg-sky-400',
    bar: 'bg-sky-400',
    badgeRing: 'ring-sky-600/20',
  },
};

function isExtractedField(v: unknown): v is ExtractedField {
  return (
    typeof v === 'object' &&
    v !== null &&
    !Array.isArray(v) &&
    'mainValue' in v &&
    'meaning' in v
  );
}

function isOtherNotes(v: unknown): v is OtherNote[] {
  return Array.isArray(v);
}

// ─── Score ring ────────────────────────────────────────────────────────────────

function ScoreRing({ score, passed }: { score: number; passed: boolean }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
  const trackColor = score >= 80 ? '#d1fae5' : score >= 50 ? '#fef3c7' : '#fee2e2';

  return (
    <div className="flex flex-col items-center gap-2.5">
      <svg width="96" height="96" viewBox="0 0 96 96" aria-hidden="true">
        <circle cx="48" cy="48" r={radius} fill="none" stroke={trackColor} strokeWidth="7" />
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 48 48)"
        />
        <text x="48" y="44" textAnchor="middle" dominantBaseline="middle" fontSize="20" fontWeight="700" fill={color}>
          {score}
        </text>
        <text x="48" y="61" textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="#9ca3af">
          / 100
        </text>
      </svg>
      <span className={`${BADGE} ${passed ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 'bg-red-50 text-red-700 ring-red-600/20'}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${passed ? 'bg-emerald-500' : 'bg-red-500'}`} />
        {passed ? 'Passed' : 'Failed'}
      </span>
    </div>
  );
}

// ─── Issue card ────────────────────────────────────────────────────────────────

function IssueCard({ issue }: { issue: AuditIssue }) {
  const cfg = SEVERITY_CONFIG[issue.severity];
  return (
    <div className="flex overflow-hidden rounded-lg border border-border/50 bg-background shadow-sm">
      <div className={`w-1 shrink-0 ${cfg.bar}`} aria-hidden="true" />
      <div className="flex-1 px-4 py-3">
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          <span className={`${BADGE} ${cfg.bg} ${cfg.color} ${cfg.badgeRing}`}>
            {issue.severity}
          </span>
          <span className="text-sm font-semibold text-foreground">{issue.check}</span>
          {issue.cfr && (
            <span className="font-mono text-xs text-muted-foreground">{issue.cfr}</span>
          )}
        </div>
        <p className="text-sm leading-relaxed text-foreground/80">{issue.message}</p>
        {issue.fix && (
          <div className="mt-2 flex gap-1.5 rounded-md bg-muted/40 px-2.5 py-1.5 text-xs">
            <span className="shrink-0 font-semibold text-foreground">Fix:</span>
            <span className="text-muted-foreground">{issue.fix}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Slot detail panel ─────────────────────────────────────────────────────────

/**
 * Merges an array of SlotResult into a unified view:
 * - For each field key, collect all mainValues and meanings across results
 * - mainValues are joined with " ; "
 * - meanings are rendered one per line
 */
function SlotPanel({ slots }: { slots: SlotResult[] }) {
  if (!slots.length) return null;

  // Collect all field keys in order (from first slot)
  const allKeys = Object.keys(slots[0].extracted as SlotExtracted);

  // Average confidence across all slots
  const avgConfidence = Math.round(
    (slots.reduce((sum, s) => sum + s.confidence.overall, 0) / slots.length) * 100,
  );

  return (
    <div className="space-y-1">
      {/* Confidence bar */}
      <div className="mb-4 flex items-center gap-3 rounded-lg bg-muted/30 px-3 py-2.5">
        <span className="text-xs text-muted-foreground shrink-0">Confidence</span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${avgConfidence}%` }}
          />
        </div>
        <span className="shrink-0 tabular-nums text-xs font-semibold text-foreground">{avgConfidence}%</span>
        {slots.length > 1 && (
          <span className="shrink-0 text-xs text-muted-foreground">avg · {slots.length} images</span>
        )}
      </div>

      {allKeys.map((key) => {
        if (key === 'otherNotes') {
          const allNotes = slots.flatMap((s) => {
            const raw = (s.extracted as SlotExtracted).otherNotes;
            if (!isOtherNotes(raw)) return [];
            return raw.filter(
              (n) => typeof n === 'object' && n !== null && n.sign_name?.trim() && n.meaning?.trim(),
            );
          });
          if (!allNotes.length) return null;
          return (
            <div key={key} className="rounded-lg border border-border/40 bg-muted/20 p-3.5">
              <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Other Notes
              </p>
              <div className="space-y-1.5">
                {allNotes.map((n, i) => (
                  <p key={i} className="text-xs text-foreground">
                    <span className="font-semibold uppercase">{n.sign_name}:</span>{' '}
                    <span className="text-muted-foreground">{n.meaning}</span>
                  </p>
                ))}
              </div>
            </div>
          );
        }

        const fields = slots
          .map((s) => (s.extracted as SlotExtracted)[key])
          .filter(isExtractedField);

        if (!fields.length) return null;

        const rawValues = fields.map((f) => f.mainValue);

        // Merge strategy across multiple objects (pages / entries of the same document):
        //   booleans → true wins (confirmed on any entry = confirmed overall)
        //   everything else → all unique non-null values joined with ', '
        //   all-null → null
        const bestValue = (() => {
          const nonNull = rawValues.filter((v) => v !== null);
          if (nonNull.length === 0) return null;
          const bools = nonNull.filter((v) => typeof v === 'boolean') as boolean[];
          if (bools.length === nonNull.length) return bools.some(Boolean);
          const unique = [...new Set(nonNull.map((v) => String(v).trim()))];
          return unique.join(', ');
        })();
        const displayValue =
          bestValue === null ? '—'
          : typeof bestValue === 'boolean' ? (bestValue ? 'Yes' : 'No')
          : String(bestValue);

        const valueColor =
          bestValue === null
            ? 'text-muted-foreground/50'
            : typeof bestValue === 'boolean'
            ? bestValue ? 'text-emerald-600' : 'text-red-500'
            : 'text-foreground';

        const meanings = fields
          .map((f) => f.meaning)
          .filter((m): m is string => !!m && m.trim().length > 0);
        const uniqueMeanings = [...new Set(meanings)];

        const formattedKey = key.replace(/([A-Z])/g, ' $1').trim();

        return (
          <div
            key={key}
            className="flex items-start justify-between gap-4 border-b border-border/30 py-2.5 last:border-0"
          >
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground capitalize">{formattedKey}</p>
              {uniqueMeanings.length > 0 && (
                <div className="mt-0.5 space-y-0.5">
                  {uniqueMeanings.map((m, i) => (
                    <p key={i} className="text-xs text-muted-foreground">{m}</p>
                  ))}
                </div>
              )}
            </div>
            <span className={`shrink-0 text-xs font-semibold tabular-nums ${valueColor}`}>
              {displayValue}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main dialog ───────────────────────────────────────────────────────────────

const SLOT_TABS = [
  { key: 'bol',      label: 'BOL' },
  { key: 'marker',   label: 'Placard' },
  { key: 'cargo',    label: 'Interior' },
  // { key: 'exterier', label: 'Exterior' }, // TODO: exterior disabled
] as const;

type SlotKey = typeof SLOT_TABS[number]['key'];

type Props = {
  audit: StoredAudit | null;
  open: boolean;
  onClose: () => void;
};

export const AuditResultDialog: React.FC<Props> = ({ audit, open, onClose }) => {
  const [activeTab, setActiveTab] = React.useState<'issues' | 'details'>('issues');
  const [activeSlot, setActiveSlot] = React.useState<SlotKey>('bol');

  if (!open || !audit) return null;

  const { response } = audit;
  const { audit: result } = response;

  const issuesBySource = result.issues
    .filter((issue) => issue.check && issue.message)
    .reduce<Record<string, AuditIssue[]>>(
    (acc, issue) => {
      (acc[issue.source] ??= []).push(issue);
      return acc;
    },
    {},
  );

  const slotData: Record<SlotKey, SlotResult[]> = {
    bol:      Array.isArray(response.bol)    ? response.bol    : [response.bol],
    marker:   Array.isArray(response.marker) ? response.marker : [response.marker],
    cargo:    Array.isArray(response.cargo)  ? response.cargo  : [response.cargo],
    // exterier: response.exterier, // TODO: exterior disabled
  };

  const validIssueCount = result.issues.filter((i) => i.check && i.message).length;

  return (
    <Modal
      open={open}
      onOpenChange={onClose}
      title="Audit Result"
      description={new Date(audit.createdAt).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit',
      })}
    >
      {/* ── Hero: score + summary ── */}
      <div className="mb-5 flex flex-wrap items-start gap-5 rounded-xl border border-border/40 bg-muted/20 p-5">
        <ScoreRing score={result.score} passed={result.is_passed} />

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <p className="text-sm leading-relaxed text-foreground/80">{result.summary}</p>

          <div className="flex flex-wrap gap-1.5">
            {(
              [
                { key: 'critical', label: 'Critical', styles: 'bg-red-50 text-red-700 ring-red-600/20' },
                { key: 'major',    label: 'Major',    styles: 'bg-orange-50 text-orange-700 ring-orange-600/20' },
                { key: 'minor',    label: 'Minor',    styles: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20' },
                { key: 'warning',  label: 'Warning',  styles: 'bg-sky-50 text-sky-700 ring-sky-600/20' },
              ] as const
            ).map(({ key, label, styles }) => (
              <span key={key} className={`${BADGE} ${styles}`}>
                {result.counts[key]} {label}
              </span>
            ))}
          </div>

          {result.placardRecommendations.length > 0 && (
            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Recommended Placards
              </p>
              <div className="flex flex-wrap gap-1.5">
                {result.placardRecommendations.map((rec, i) => (
                  <span
                    key={i}
                    className="rounded-md border border-border/50 bg-background px-2.5 py-1 text-xs font-medium text-foreground"
                  >
                    {rec}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Tab switcher ── */}
      <div className="mb-4 flex gap-1 rounded-xl border border-border/40 bg-muted/30 p-1">
        {(
          [
            { key: 'issues',  label: 'Issues', count: validIssueCount },
            { key: 'details', label: 'Slot Details', count: null },
          ] as const
        ).map(({ key, label, count }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              activeTab === key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
            {count !== null && (
              <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${
                activeTab === key ? 'bg-muted text-foreground' : 'text-muted-foreground'
              }`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Issues tab ── */}
      {activeTab === 'issues' && (
        <div className="space-y-6">
          {Object.keys(issuesBySource).length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="text-emerald-500" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-sm">No issues — load is fully compliant.</p>
            </div>
          ) : (
            Object.entries(issuesBySource).map(([source, issues]) => (
              <div key={source}>
                <div className="mb-3 flex items-center gap-3">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {source}
                  </span>
                  <div className="h-px flex-1 bg-border/40" />
                  <span className="text-[11px] text-muted-foreground">
                    {issues.length} issue{issues.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="space-y-2">
                  {issues.map((issue, i) => (
                    <IssueCard key={i} issue={issue} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Details tab ── */}
      {activeTab === 'details' && (
        <div className="space-y-3">
          <div className="flex gap-1 rounded-xl border border-border/40 bg-muted/30 p-1">
            {SLOT_TABS.map(({ key, label }) => {
              const count = slotData[key].length;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveSlot(key)}
                  className={`flex-1 rounded-lg px-2 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    activeSlot === key
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {label}{count > 1 ? ` · ${count}` : ''}
                </button>
              );
            })}
          </div>

          <div className="rounded-xl border border-border/40 bg-background p-4">
            <SlotPanel slots={slotData[activeSlot]} />
          </div>
        </div>
      )}
    </Modal>
  );
};