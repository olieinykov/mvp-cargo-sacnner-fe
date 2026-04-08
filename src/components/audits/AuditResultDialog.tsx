import React from 'react';
import ReactDOM from 'react-dom';
import { Modal } from '../ui/dialog';
import type {
  StoredAudit,
  AuditIssue,
  AuditImage,
  AuditImageType,
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
    color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200',
    dot: 'bg-red-500', bar: 'bg-red-500', badgeRing: 'ring-red-600/20',
  },
  MAJOR: {
    color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200',
    dot: 'bg-orange-500', bar: 'bg-orange-500', badgeRing: 'ring-orange-600/20',
  },
  MINOR: {
    color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200',
    dot: 'bg-yellow-400', bar: 'bg-yellow-400', badgeRing: 'ring-yellow-600/20',
  },
  WARNING: {
    color: 'text-sky-700', bg: 'bg-sky-50', border: 'border-sky-200',
    dot: 'bg-sky-400', bar: 'bg-sky-400', badgeRing: 'ring-sky-600/20',
  },
};

const SLOT_TO_IMAGE_TYPE: Record<string, AuditImageType> = {
  bol:    'bol',
  marker: 'placard',
  cargo:  'cargo',
};

const IMAGE_TYPE_LABEL: Record<AuditImageType, string> = {
  bol:     'BOL',
  placard: 'Placard',
  cargo:   'Cargo',
};

function isExtractedField(v: unknown): v is ExtractedField {
  return (
    typeof v === 'object' && v !== null && !Array.isArray(v) &&
    'mainValue' in v && 'meaning' in v
  );
}

function isOtherNotes(v: unknown): v is OtherNote[] {
  return Array.isArray(v);
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────

type LightboxProps = {
  images: AuditImage[];
  initialIndex: number;
  onClose: () => void;
};

function Lightbox({ images, initialIndex, onClose }: LightboxProps) {
  const [index, setIndex] = React.useState(initialIndex);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation(); // prevent Modal (Radix) from also catching Escape
        onClose();
      }
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % images.length);
      if (e.key === 'ArrowLeft')  setIndex((i) => (i - 1 + images.length) % images.length);
    };
    // capture phase so we intercept before Radix does
    window.addEventListener('keydown', handler, { capture: true });
    return () => window.removeEventListener('keydown', handler, { capture: true });
  }, [images.length, onClose]);

  const current = images[index];
  const hasPrev = images.length > 1;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-sm pointer-events-auto"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-label="Image lightbox"
    >
      {/* Main image */}
      <div
        className="relative flex max-h-[90vh] max-w-[92vw] flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="mb-3 flex w-full items-center justify-between gap-4">
          <span className="rounded-md bg-white/10 px-2.5 py-1 text-xs font-medium text-white/80">
            {IMAGE_TYPE_LABEL[current.type]} · {index + 1} / {images.length}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            aria-label="Close lightbox"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Image */}
        <img
          src={current.url}
          alt={`${IMAGE_TYPE_LABEL[current.type]} photo ${index + 1}`}
          className="max-h-[80vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
          draggable={false}
        />

        {/* Prev / Next */}
        {hasPrev && (
          <>
            <button
              type="button"
              onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
              className="absolute left-0 top-1/2 -translate-x-12 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              aria-label="Previous image"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setIndex((i) => (i + 1) % images.length)}
              className="absolute right-0 top-1/2 translate-x-12 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              aria-label="Next image"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </>
        )}

        {/* Dot strip */}
        {images.length > 1 && (
          <div className="mt-4 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Go to image ${i + 1}`}
                className={`h-1.5 rounded-full transition-all focus-visible:outline-none ${
                  i === index ? 'w-5 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Image strip ───────────────────────────────────────────────────────────────

type ImageStripProps = {
  images: AuditImage[];
  onOpen: (images: AuditImage[], index: number) => void;
};

function ImageStrip({ images, onOpen }: ImageStripProps) {
  if (!images.length) return null;

  return (
    <div className="flex gap-2 flex-wrap">
      {images.map((img, i) => (
        <button
          key={img.url}
          type="button"
          onClick={() => onOpen(images, i)}
          className="group relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-lg border border-border/40 bg-muted/20 shadow-sm transition-all hover:border-primary/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`View ${IMAGE_TYPE_LABEL[img.type]} image ${i + 1}`}
        >
          <img
            src={img.url}
            alt={`${IMAGE_TYPE_LABEL[img.type]} ${i + 1}`}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-110"
          />
          {/* Hover zoom overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white" aria-hidden="true">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </button>
      ))}
    </div>
  );
}

// ─── Section header with images ────────────────────────────────────────────────

type SectionHeaderProps = {
  label: string;
  count: number;
};

function SectionHeader({ label, count }: SectionHeaderProps) {
  return (
    <div className="mb-3 space-y-2">
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <div className="h-px flex-1 bg-border/40" />
        <span className="text-[11px] text-muted-foreground">
          {count} issue{count !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
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
          cx="48" cy="48" r={radius} fill="none"
          stroke={color} strokeWidth="7"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 48 48)"
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

function SlotPanel({
  slots,
  images,
  onOpenLightbox,
}: {
  slots: SlotResult[];
  images: AuditImage[];
  onOpenLightbox: (images: AuditImage[], index: number) => void;
}) {
  if (!slots.length) return null;

  const allKeys = Object.keys(slots[0].extracted as SlotExtracted);
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
      </div>

      {/* Image strip for this slot */}
      {images.length > 0 && (
        <div className="mb-4 rounded-lg border border-border/30 bg-muted/10 p-3">
          <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Source Images
          </p>
          <ImageStrip images={images} onOpen={onOpenLightbox} />
        </div>
      )}

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
        const nonNull = rawValues.filter((v) => v !== null);

        const isBoolField = nonNull.length > 0 && nonNull.every((v) => typeof v === 'boolean');

        const valueTokens: string[] | null = (() => {
          if (nonNull.length === 0) return null;
          if (isBoolField) return [(nonNull as boolean[]).some(Boolean) ? 'Yes' : 'No'];
          if (key === 'properShippingName') {
            const seen = new Set<string>();
            nonNull.forEach(v => seen.add(String(v).trim()));
            return [...seen];
          }
          const parts = nonNull.flatMap((v) =>
            String(v).split(/[;,]+/).map((s) => s.trim()).filter(Boolean)
          );
          const seen = new Map<string, string>();
          for (const part of parts) {
            const normalized = part.replace(/^\+/, '').replace(/\s+/g, '').toLowerCase();
            if (!seen.has(normalized)) seen.set(normalized, part);
          }
          return [...seen.values()];
        })();

        const valueColor =
          valueTokens === null
            ? 'text-muted-foreground/50'
            : isBoolField
            ? valueTokens[0] === 'Yes' ? 'text-emerald-600' : 'text-red-500'
            : 'text-foreground';

        const meanings = fields
          .map((f) => f.meaning)
          .filter((m): m is string => !!m && m.trim().length > 0);
        const uniqueMeanings = [...new Set(meanings)];

        const formattedKey = key.replace(/([A-Z])/g, ' $1').trim();
        const isMultiToken = valueTokens && valueTokens.length > 1;

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
            {valueTokens === null ? (
              <span className="shrink-0 text-xs font-semibold tabular-nums text-muted-foreground/50">—</span>
            ) : isMultiToken ? (
              <div className="flex flex-wrap justify-end gap-1 max-w-[55%]">
                {valueTokens.map((token, i) => (
                  <React.Fragment key={i}>
                    <span className={`text-xs font-medium tabular-nums ${valueColor}`}>{token}</span>
                    {i < valueTokens.length - 1 && (
                      <span className="text-xs font-medium tabular-nums text-muted-foreground">;</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <span className={`text-xs font-semibold text-right max-w-[60%] break-words ${valueColor} ${key !== 'properShippingName' ? 'shrink-0 tabular-nums' : ''}`}>
                {valueTokens[0]}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main dialog ───────────────────────────────────────────────────────────────

const SLOT_TABS = [
  { key: 'bol',    label: 'BOL',      slotKey: 'bol'    },
  { key: 'marker', label: 'Placard',  slotKey: 'marker' },
  { key: 'cargo',  label: 'Interior', slotKey: 'cargo'  },
] as const;

type SlotKey = typeof SLOT_TABS[number]['key'];

type LightboxState = { images: AuditImage[]; index: number } | null;

type Props = {
  audit: StoredAudit | null;
  open: boolean;
  onClose: () => void;
};

export const AuditResultDialog: React.FC<Props> = ({ audit, open, onClose }) => {
  const [activeTab,  setActiveTab]  = React.useState<'issues' | 'details'>('issues');
  const [activeSlot, setActiveSlot] = React.useState<SlotKey>('bol');
  const [lightbox,   setLightbox]   = React.useState<LightboxState>(null);

  // useMemo must run unconditionally — safely derive from nullable audit
  const imagesByType = React.useMemo<Record<AuditImageType, AuditImage[]>>(() => {
    const map: Record<AuditImageType, AuditImage[]> = { bol: [], placard: [], cargo: [] };
    for (const img of audit?.auditImages ?? []) map[img.type]?.push(img);
    return map;
  }, [audit]);

  if (!open || !audit) return null;
  
  const { response } = audit;
  const { audit: result } = response;
  const auditImages = audit.auditImages ?? [];
  const allImages = auditImages;

  const issuesBySource = result.issues
    .filter((issue) => issue.check && issue.message)
    .reduce<Record<string, AuditIssue[]>>((acc, issue) => {
      (acc[issue.source] ??= []).push(issue);
      return acc;
    }, {});

  const slotData: Record<SlotKey, SlotResult[]> = {
    bol:    Array.isArray(response.bol)    ? response.bol    : [response.bol],
    marker: Array.isArray(response.marker) ? response.marker : [response.marker],
    cargo:  Array.isArray(response.cargo)  ? response.cargo  : [response.cargo],
  };

  const validIssueCount = result.issues.filter((i) => i.check && i.message).length;

  const openLightbox = (images: AuditImage[], index: number) => {
    setLightbox({ images, index });
  };

  return (
    <>
      <Modal
        open={open}
        onOpenChange={(v) => { if (!v && !lightbox) onClose(); }}
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

            {/* All-images strip in hero */}
            {allImages.length > 0 && (
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Audited Images
                </p>
                <ImageStrip images={allImages} onOpen={openLightbox} />
              </div>
            )}
          </div>
        </div>

        {/* ── Tab switcher ── */}
        <div className="sticky top-[-10px] z-10 mb-4 rounded-xl bg-background/95 backdrop-blur">
          <div className="flex gap-1 rounded-xl border border-border/40 bg-muted/30 p-1">
            {(
              [
                { key: 'issues',  label: 'Issues',       count: validIssueCount },
                { key: 'details', label: 'Slot Details',  count: null },
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
              Object.entries(issuesBySource).map(([source, issues]) => {
                return (
                  <div key={source}>
                    <SectionHeader
                      label={source}
                      count={issues.length}
                    />
                    <div className="space-y-2">
                      {issues.map((issue, i) => (
                        <IssueCard key={i} issue={issue} />
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── Details tab ── */}
        {activeTab === 'details' && (
          <div>
            {/* Sticky slot tab switcher */}
            <div className="sticky top-[42px] z-10 rounded-xl bg-background/95 backdrop-blur">
              <div className="flex gap-1 rounded-xl border border-border/40 bg-muted/30 p-1">
                {SLOT_TABS.map(({ key, label }) => (
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
                    {label}
                    {/* Image count badge on tab */}
                    {(() => {
                      const t = SLOT_TO_IMAGE_TYPE[key];
                      const c = t ? (imagesByType[t]?.length ?? 0) : 0;
                      return c > 0 ? (
                        <span className="ml-1.5 rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground">
                          {c}
                        </span>
                      ) : null;
                    })()}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border/40 bg-background p-4 mt-3">
              <SlotPanel
                slots={slotData[activeSlot]}
                images={imagesByType[SLOT_TO_IMAGE_TYPE[activeSlot]] ?? []}
                onOpenLightbox={openLightbox}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Lightbox in a portal — fully outside Radix DOM tree */}
      {lightbox && ReactDOM.createPortal(
        <Lightbox
          images={lightbox.images}
          initialIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />,
        document.body,
      )}
    </>
  );
};