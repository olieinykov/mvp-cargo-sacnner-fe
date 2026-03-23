import React from 'react';
import { Dialog, DialogHeader } from '../ui/dialog';
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

function SlotPanel({ slot }: { slot: SlotResult }) {
  const entries = Object.entries(slot.extracted as SlotExtracted);

  return (
    <div className="space-y-2">
      {/* Confidence */}
      <div className="mb-3 flex items-center gap-2 rounded-md bg-muted/40 px-3 py-2">
        <span className="text-xs text-muted-foreground">Confidence:</span>
        <span className="text-xs font-semibold text-foreground">
          {Math.round(slot.confidence.overall * 100)}%
        </span>
      </div>

      {entries.map(([key, val]) => {
        if (key === 'otherNotes') {
          const raw   = isOtherNotes(val) ? val : [];
          // Claude sometimes returns plain strings instead of { sign_name, meaning } objects
          const notes = raw.filter((n) =>
            typeof n === 'object' && n !== null && n.sign_name?.trim() && n.meaning?.trim()
          );
          if (!notes.length) return null;
          return (
            <div key={key} className="rounded-md border border-border/40 bg-muted/30 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Other Notes
              </p>
              <div className="space-y-1">
                {notes.map((n, i) => (
                  <p key={i} className="text-xs text-foreground">
                    <span className="font-medium uppercase">{n.sign_name}:</span> {n.meaning}
                  </p>
                ))}
              </div>
            </div>
          );
        }

        if (!isExtractedField(val)) return null;

        const displayValue =
          val.mainValue === null
            ? '—'
            : typeof val.mainValue === 'boolean'
            ? val.mainValue
              ? 'Yes'
              : 'No'
            : String(val.mainValue);

        const valueColor =
          typeof val.mainValue === 'boolean'
            ? val.mainValue
              ? 'text-green-600'
              : 'text-red-500'
            : val.mainValue === null
            ? 'text-muted-foreground'
            : 'text-foreground';

        return (
          <div
            key={key}
            className="flex items-start justify-between gap-3 border-b border-border/30 pb-2 last:border-0"
          >
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground uppercase">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </p>
              {val.meaning && (
                <p className="text-xs text-muted-foreground">{val.meaning}</p>
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

  const slotData: Record<SlotKey, SlotResult> = {
    bol:      response.bol,
    marker:   response.marker,
    cargo:    response.cargo,
    // exterier: response.exterier, // TODO: exterior disabled
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogHeader
        title="Audit Result"
        description={`Created ${new Date(audit.createdAt).toLocaleString()}`}
      />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">

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
            {SLOT_TABS.map(({ key, label }) => (
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
                {label}
              </button>
            ))}
          </div>

          <div className="rounded-lg border border-border/50 bg-background p-4">
            <SlotPanel slot={slotData[activeSlot]} />
          </div>
        </div>
      )}

      </div> {/* end scrollable */}

      {/* Close button */}
      <div className="mt-4 flex justify-end">
        <Button variant="outline" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
    </Dialog>
  );
};