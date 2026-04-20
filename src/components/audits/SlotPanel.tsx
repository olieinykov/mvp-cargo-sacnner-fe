import React from "react";
import { isExtractedField, isOtherNotes } from "../../lib/utils/typeGuard";
import type { AuditImage, SlotExtracted, SlotResult } from "../../lib/utils/useAuditStore";
import { ImageStrip } from "../common/ImageStrip";

type SlotPanelProps = {
  slots: SlotResult[];
  images: AuditImage[];
  onOpenLightbox: (images: AuditImage[], index: number) => void;
}

export const SlotPanel: React.FC<SlotPanelProps> = ({
  slots,
  images,
  onOpenLightbox,
}) => {
  const validSlots = slots?.filter(Boolean) ?? [];

  if (!validSlots.length && !images.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10 text-muted-foreground">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="text-muted-foreground/40" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="text-sm">No data or images available for this category.</p>
      </div>
    );
  }

  const avgConfidence = validSlots.length > 0
    ? Math.round((validSlots.reduce((sum, s) => sum + (s.confidence?.overall ?? 0), 0) / validSlots.length) * 100)
    : null;

  const allKeys = validSlots.length > 0 && validSlots[0].extracted
    ? Object.keys(validSlots[0].extracted as SlotExtracted)
    : [];

  return (
    <div className="space-y-1">
      {/* Confidence bar */}
      {avgConfidence !== null && (
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
      )}

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
          const allNotes = validSlots.flatMap((s) => {
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

        const fields = validSlots
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

          if (key === 'unNumber') {
            const parts = nonNull.flatMap((v) =>
              String(v).split(/[;,]+/).map((s) => s.trim().toUpperCase()).filter(Boolean)
            );
            const seen = new Set<string>();
            for (let part of parts) {
              part = part.replace(/\s+/g, '');
              if (/^\d{4}$/.test(part)) {
                part = `UN${part}`;
              }
              seen.add(part);
            }
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