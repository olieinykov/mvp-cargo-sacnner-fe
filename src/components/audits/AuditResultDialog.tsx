import React from 'react';
import { Modal } from '../ui/dialog';
import { Button } from '../ui/button';
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

const SEVERITY_CONFIG: Record<
  Severity,
  { color: string; bg: string; border: string; dot: string }
> = {
  CRITICAL: {
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    dot: 'bg-red-500',
  },
  MAJOR: {
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    dot: 'bg-orange-500',
  },
  MINOR: {
    color: 'text-yellow-700',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    dot: 'bg-yellow-400',
  },
  WARNING: {
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    dot: 'bg-blue-400',
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
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#16a34a' : score >= 50 ? '#ea580c' : '#dc2626';

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="7" />
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 44 44)"
        />
        <text
          x="44"
          y="40"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="16"
          fontWeight="700"
          fill={color}
        >
          {score}
        </text>
        <text
          x="44"
          y="55"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="8"
          fill="#9ca3af"
        >
          / 100
        </text>
      </svg>
      <span
        className={`text-xs font-bold tracking-widest ${
          passed ? 'text-green-600' : 'text-red-600'
        }`}
      >
        {passed ? '✓ PASSED' : '✗ FAILED'}
      </span>
    </div>
  );
}

// ─── Issue card ────────────────────────────────────────────────────────────────

function IssueCard({ issue }: { issue: AuditIssue }) {
  const cfg = SEVERITY_CONFIG[issue.severity];
  return (
    <div className={`rounded-lg border p-3 ${cfg.bg} ${cfg.border}`}>
      <div className="flex items-start gap-2.5">
        <span className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${cfg.dot}`} />
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-xs font-bold ${cfg.color}`}>{issue.severity}</span>
            <span className="text-xs font-semibold text-foreground">{issue.check}</span>
            {issue.cfr && (
              <span className="text-xs text-muted-foreground">{issue.cfr}</span>
            )}
          </div>
          <p className="text-sm text-foreground">{issue.message}</p>
          {issue.fix && (
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Fix: </span>
              {issue.fix}
            </p>
          )}
        </div>
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
    <div className="space-y-2">
      {/* Confidence */}
      <div className="mb-3 flex items-center gap-2 rounded-md bg-muted/40 px-3 py-2">
        <span className="text-xs text-muted-foreground">Confidence:</span>
        <span className="text-xs font-semibold text-foreground">{avgConfidence}%</span>
        {slots.length > 1 && (
          <span className="text-xs text-muted-foreground">(avg across {slots.length} images)</span>
        )}
      </div>

      {allKeys.map((key) => {
        if (key === 'otherNotes') {
          // Collect all valid notes from all slots
          const allNotes = slots.flatMap((s) => {
            const raw = (s.extracted as SlotExtracted).otherNotes;
            if (!isOtherNotes(raw)) return [];
            return raw.filter(
              (n) => typeof n === 'object' && n !== null && n.sign_name?.trim() && n.meaning?.trim(),
            );
          });
          if (!allNotes.length) return null;
          return (
            <div key={key} className="rounded-md border border-border/40 bg-muted/30 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Other Notes
              </p>
              <div className="space-y-1">
                {allNotes.map((n, i) => (
                  <p key={i} className="text-xs text-foreground">
                    <span className="font-medium uppercase">{n.sign_name}:</span> {n.meaning}
                  </p>
                ))}
              </div>
            </div>
          );
        }

        // Gather fields for this key across all slots
        const fields = slots
          .map((s) => (s.extracted as SlotExtracted)[key])
          .filter(isExtractedField);

        if (!fields.length) return null;

        // Build joined display value: unique non-null values separated by " ; "
        const rawValues = fields.map((f) => f.mainValue);
        const displayParts = rawValues.map((mv) =>
          mv === null
            ? '—'
            : typeof mv === 'boolean'
            ? mv ? 'Yes' : 'No'
            : String(mv),
        );
        // Deduplicate if all identical, otherwise show all
        const uniqueParts = [...new Set(displayParts)];
        const displayValue = uniqueParts.join(' ; ');

        // Color logic: if any is false → red, if all true → green, else neutral
        const boolValues = rawValues.filter((v) => typeof v === 'boolean') as boolean[];
        const valueColor =
          boolValues.length > 0
            ? boolValues.every(Boolean)
              ? 'text-green-600'
              : boolValues.some(Boolean)
              ? 'text-yellow-600'
              : 'text-red-500'
            : rawValues.every((v) => v === null)
            ? 'text-muted-foreground'
            : 'text-foreground';

        // Unique meanings (skip empty)
        const meanings = fields
          .map((f) => f.meaning)
          .filter((m): m is string => !!m && m.trim().length > 0);
        const uniqueMeanings = [...new Set(meanings)];

        return (
          <div
            key={key}
            className="flex items-start justify-between gap-3 border-b border-border/30 pb-2 last:border-0"
          >
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase text-foreground">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </p>
              {uniqueMeanings.length > 0 && (
                <div className="mt-0.5 space-y-0.5">
                  {uniqueMeanings.map((m, i) => (
                    <p key={i} className="text-xs text-muted-foreground">{m}</p>
                  ))}
                </div>
              )}
            </div>
            <span className={`flex-shrink-0 text-xs font-semibold ${valueColor}`}>
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

  return (
    <Modal
      open={open}
      onOpenChange={onClose}
      title="Audit Result"
      description={`Created ${new Date(audit.createdAt).toLocaleString()}`}
      footer={
        <Button variant="outline" size="sm" onClick={onClose}>
          Close
        </Button>
      }
    >
      {/* Score + summary row */}
      <div className="mb-4 flex flex-wrap items-start gap-4 rounded-xl border border-border/50 bg-muted/20 p-4">
        <ScoreRing score={result.score} passed={result.is_passed} />

        <div className="flex-1 space-y-3">
          <p className="text-sm text-muted-foreground">{result.summary}</p>

          {/* Severity count pills */}
          <div className="flex flex-wrap gap-2">
            {(
              [
                { key: 'critical', label: 'Critical', bg: 'bg-red-100',    text: 'text-red-700' },
                { key: 'major',    label: 'Major',    bg: 'bg-orange-100', text: 'text-orange-700' },
                { key: 'minor',    label: 'Minor',    bg: 'bg-yellow-100', text: 'text-yellow-700' },
                { key: 'warning',  label: 'Warning',  bg: 'bg-blue-100',   text: 'text-blue-700' },
              ] as const
            ).map(({ key, label, bg, text }) => (
              <span
                key={key}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${bg} ${text}`}
              >
                {result.counts[key]} {label}
              </span>
            ))}
          </div>

          {/* Placard recommendations */}
          {result.placardRecommendations.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Recommended Placards
              </p>
              <div className="flex flex-wrap gap-1.5">
                {result.placardRecommendations.map((rec, i) => (
                  <span
                    key={i}
                    className="rounded-full border border-border bg-background px-2.5 py-0.5 text-xs font-medium text-foreground"
                  >
                    {rec}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tab switcher */}
      <div className="mb-3 flex gap-1 rounded-lg border border-border/50 bg-muted/30 p-1">
        {(
          [
            { key: 'issues',  label: `Issues (${result.issues.length})` },
            { key: 'details', label: 'Slot Details' },
          ] as const
        ).map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              activeTab === key
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Issues tab */}
      {activeTab === 'issues' && (
        <div className="space-y-5">
          {Object.keys(issuesBySource).length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
              <span className="text-3xl">✓</span>
              <p className="text-sm">No issues found — load is fully compliant.</p>
            </div>
          ) : (
            Object.entries(issuesBySource).map(([source, issues]) => (
              <div key={source}>
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {source}
                </p>
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

      {/* Details tab */}
      {activeTab === 'details' && (
        <div className="space-y-3">
          {/* Slot selector */}
          <div className="flex gap-1 rounded-lg border border-border/50 bg-muted/30 p-1">
            {SLOT_TABS.map(({ key, label }) => {
              const count = slotData[key].length;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveSlot(key)}
                  className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    activeSlot === key
                      ? 'bg-background shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {label}{count > 1 ? ` (${count})` : ''}
                </button>
              );
            })}
          </div>

          <div className="rounded-lg border border-border/50 bg-background p-4">
            <SlotPanel slots={slotData[activeSlot]} />
          </div>
        </div>
      )}
    </Modal>
  );
};