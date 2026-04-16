import React from 'react';
import ReactDOM from 'react-dom';
import { Modal } from '../ui/dialog';
import type {
  StoredAudit,
  AuditIssue,
  AuditImage,
  AuditImageType,
  SlotResult
} from '../../lib/utils/useAuditStore';
import { ScoreRing } from './ScoreRing';
import { ImageStrip } from '../common/ImageStrip';
import { IssueCard } from './IssueCard';
import { BADGE, SLOT_TO_IMAGE_TYPE } from '../../lib/utils/constants';
import { SlotPanel } from './SlotPanel';
import { Lightbox } from '../common/Lightbox';


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

// ─── Main dialog ───────────────────────────────────────────────────────────────

const SLOT_TABS = [
  { key: 'bol',    label: 'BOL',      slotKey: 'bol'    },
  { key: 'marker', label: 'Placard',  slotKey: 'marker' },
  { key: 'cargo',  label: 'Interior', slotKey: 'cargo'  },
  { key: 'seal',   label: 'Seal',     slotKey: 'seal'   },
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
    const map: Record<AuditImageType, AuditImage[]> = { bol: [], placard: [], cargo: [], seal: [] };
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
    seal:   Array.isArray(response.seal)   ? response.seal   : [response.seal],
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