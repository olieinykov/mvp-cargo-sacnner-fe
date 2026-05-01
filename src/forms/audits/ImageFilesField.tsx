import React, { useEffect, useRef, useState } from 'react';
import { Label } from '../../components/ui/label';
import { cn } from '../../lib/utils/cn';

type ImageFilesFieldProps = {
  id: string;
  label: string;
  files: File[];
  onFilesChange: (files: File[]) => void;
  error?: string;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  helpText?: string;
  disabled?: boolean;
};

type PreviewItem = {
  file: File;
  isImage: boolean;
  url?: string;
};

const FileIcon: React.FC = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M7 3H14L20 9V21C20 21.6 19.6 22 19 22H7C6.4 22 6 21.6 6 21V4C6 3.4 6.4 3 7 3Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path d="M14 3V9H20" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  </svg>
);

const TrashIcon: React.FC = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M10 11v5M14 11v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const UploadIcon: React.FC = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <polyline
      points="17 8 12 3 7 8"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line
      x1="12"
      y1="3"
      x2="12"
      y2="15"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

const AddMoreIcon: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export const ImageFilesField: React.FC<ImageFilesFieldProps> = ({
  id,
  label,
  files,
  onFilesChange,
  error,
  onBlur,
  helpText,
  disabled,
}) => {
  const [previews, setPreviews] = useState<PreviewItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dropRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const nextPreviews: PreviewItem[] = files.map((file) => {
      const isImage = file.type.startsWith('image/');
      return isImage ? { file, isImage, url: URL.createObjectURL(file) } : { file, isImage };
    });
    setPreviews(nextPreviews);
    return () => {
      nextPreviews.forEach((p) => p.url && URL.revokeObjectURL(p.url));
    };
  }, [files]);

  const addFiles = (incoming: FileList | File[]) => {
    const arr = Array.from(incoming);
    if (!arr.length) return;
    onFilesChange([...files, ...arr]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.files) addFiles(e.currentTarget.files);
    e.currentTarget.value = '';
  };

  const handleRemove = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  // Drag-and-drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    if (!dropRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
  };

  const hasFiles = files.length > 0;

  return (
    <div className="space-y-2">
      {label && <Label htmlFor={id}>{label}</Label>}
      {helpText && (
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
          {helpText}
        </p>
      )}
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-destructive">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path
              d="M12 8v4M12 16h.01"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          {error}
        </p>
      )}

      <input
        id={id}
        name={id}
        type="file"
        multiple
        accept="image/*,application/pdf"
        ref={inputRef}
        onChange={handleInputChange}
        onBlur={onBlur}
        className="hidden"
        aria-label={`Upload ${label || 'shipment'} images`}
      />

      {/* Drop zone — shown when no files yet */}
      {!hasFiles && (
        <div
          ref={dropRef}
          onClick={() => inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 transition-all duration-200',
            isDragging
              ? 'border-primary bg-primary/5 text-primary'
              : 'border-border/50 bg-muted/10 text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-primary',
          )}
          role="button"
          tabIndex={0}
          aria-label="Upload images"
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        >
          <div
            className={cn(
              'flex h-14 w-14 items-center justify-center rounded-full border transition-colors duration-200',
              isDragging ? 'border-primary/30 bg-primary/10' : 'border-border/60 bg-muted/30',
            )}
          >
            <UploadIcon />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold">
              {isDragging ? 'Drop images here' : 'Drop images or click to browse'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              BOL documents, placard photos, cargo interiors — mix freely
            </p>
          </div>
        </div>
      )}

      {/* File grid — shown once files are added */}
      {hasFiles && (
        <div
          ref={dropRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'rounded-xl border border-dashed p-3 transition-colors duration-200',
            isDragging ? 'border-primary/60 bg-primary/5' : 'border-border/40 bg-muted/5',
          )}
        >
          <div className="flex flex-wrap gap-2">
            {previews.map((preview, index) => (
              <div
                key={`${preview.file.name}-${preview.file.size}-${index}`}
                className="group relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-lg border border-border/30 bg-muted/20 shadow-sm"
              >
                {preview.isImage && preview.url ? (
                  <img
                    src={preview.url}
                    alt={preview.file.name}
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <FileIcon />
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/55 opacity-0 backdrop-blur-[2px] transition-opacity duration-150 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/20 transition-colors hover:bg-red-500/80 hover:ring-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    aria-label={`Remove ${preview.file.name}`}
                  >
                    <TrashIcon />
                  </button>
                  <span className="max-w-[76px] truncate px-1 text-center text-[9px] font-medium text-white/75">
                    {preview.file.name}
                  </span>
                </div>
              </div>
            ))}

            {/* Add more tile */}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className={cn(
                'flex h-[88px] w-[88px] shrink-0 flex-col items-center justify-center gap-1 rounded-lg',
                'border-2 border-dashed border-border/40 bg-transparent text-muted-foreground',
                'transition-all duration-150 hover:border-primary/50 hover:bg-primary/5 hover:text-primary',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              )}
              aria-label="Add more images"
            >
              <AddMoreIcon />
              <span className="text-[10px] font-medium">Add more</span>
            </button>
          </div>

          {/* Bottom bar */}
          <div className="mt-3 flex items-center justify-between border-t border-border/30 pt-2.5">
            <p className="text-[11px] text-muted-foreground">
              <span className="font-semibold text-foreground">{files.length}</span>{' '}
              {files.length === 1 ? 'image' : 'images'} selected
            </p>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onFilesChange([])}
              className="text-[11px] text-muted-foreground underline-offset-2 transition-colors hover:text-destructive hover:underline disabled:pointer-events-none disabled:opacity-50"
            >
              Clear all
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
