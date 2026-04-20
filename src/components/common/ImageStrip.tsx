import { IMAGE_TYPE_LABEL } from "../../lib/utils/constants";
import type { AuditImage } from "../../lib/utils/useAuditStore";

type ImageStripProps = {
  images: AuditImage[];
  onOpen: (images: AuditImage[], index: number) => void;
};

export const ImageStrip: React.FC<ImageStripProps> = ({ images, onOpen }) => {
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