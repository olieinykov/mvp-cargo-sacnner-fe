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
};

type PreviewItem = {
  file: File;
  isImage: boolean;
  url?: string;
};

const FileIcon: React.FC = () => (
  <svg
    width="22"
    height="22"
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
    <path
      d="M14 3V9H20"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);

const TrashIcon: React.FC = () => (
  <svg
    width="18"
    height="18"
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
    <path
      d="M10 11v5M14 11v5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const PlusIcon: React.FC = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M12 5v14M5 12h14"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
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
}) => {
  const [previews, setPreviews] = useState<PreviewItem[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const nextPreviews: PreviewItem[] = files.map((file) => {
      const isImage = file.type.startsWith('image/');

      if (isImage) {
        return { file, isImage, url: URL.createObjectURL(file) };
      }

      return { file, isImage };
    });

    setPreviews(nextPreviews);

    return () => {
      nextPreviews.forEach((p) => {
        if (p.url) URL.revokeObjectURL(p.url);
      });
    };
  }, [files]);

  const handleAddFilesClick = () => {
    inputRef.current?.click();
  };

  const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.currentTarget.files;
    if (!fileList || fileList.length === 0) return;

    const nextFiles = [...files, ...Array.from(fileList)];
    onFilesChange(nextFiles);

    event.currentTarget.value = '';
  };

  const handleRemove = (index: number) => {
    const nextFiles = files.filter((_, i) => i !== index);
    onFilesChange(nextFiles);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {helpText ? <p className="text-xs text-muted-foreground">{helpText}</p> : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}

      <input
        id={id}
        name={id}
        type="file"
        multiple
        ref={inputRef}
        onChange={handleFilesChange}
        onBlur={onBlur}
        className="hidden"
        aria-label={`Upload ${label} files`}
      />

      <div
        className="flex flex-wrap gap-3 rounded-xl border border-dashed border-border/60 bg-muted/5 p-4 min-h-[120px] items-start"
        aria-label={`${label} files`}
      >
        {previews.map((preview, index) => (
          <div
            key={`${preview.file.name}-${preview.file.size}-${index}`}
            className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-border/40 bg-muted/20 shadow-sm"
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

            {/* Hover overlay with delete */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/50 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100">
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/20 transition-colors hover:bg-red-500/80 hover:ring-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label={`Remove ${preview.file.name}`}
              >
                <TrashIcon />
              </button>
              <span className="max-w-[80px] truncate px-1 text-center text-[9px] font-medium text-white/80">
                {preview.file.name}
              </span>
            </div>
          </div>
        ))}

        {/* Add file card */}
        <button
          type="button"
          onClick={handleAddFilesClick}
          className={cn(
            'flex h-24 w-24 shrink-0 flex-col items-center justify-center gap-1.5 rounded-lg',
            'border-2 border-dashed border-border/50 bg-transparent text-muted-foreground',
            'transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 hover:text-primary',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          )}
          aria-label={`Add ${label} files`}
        >
          <PlusIcon />
          <span className="text-[11px] font-medium">Add file</span>
        </button>
      </div>
    </div>
  );
};

