import React from "react";
import type { AuditImage } from "../../lib/utils/useAuditStore";
import { IMAGE_TYPE_LABEL } from "../../lib/utils/constants";

type LightboxProps = {
  images: AuditImage[];
  initialIndex: number;
  onClose: () => void;
};

export const Lightbox = ({ images, initialIndex, onClose }: LightboxProps) => {
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