import React, { useEffect, useMemo, useRef, useState } from 'react';
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
        return {
          file,
          isImage,
          url: URL.createObjectURL(file),
        };
      }

      return {
        file,
        isImage,
      };
    });

    setPreviews(nextPreviews);

    return () => {
      nextPreviews.forEach((p) => {
        if (p.url) {
          URL.revokeObjectURL(p.url);
        }
      });
    };
  }, [files]);

  const hasPreviews = previews.length > 0;

  const handleAddFilesClick = () => {
    inputRef.current?.click();
  };

  const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.currentTarget.files;
    if (!fileList || fileList.length === 0) {
      return;
    }

    const nextFiles = [...files, ...Array.from(fileList)];
    onFilesChange(nextFiles);

    // allow selecting the same file again
    event.currentTarget.value = '';
  };

  const cardsContainerClassName = useMemo(
    () => cn('flex flex-wrap w-full gap-3 rounded-xl border border-dashed border-border/60 bg-muted/5 p-4 min-h-[110px] items-start'),
    [],
  );

  const previewCardClassName = useMemo(
    () => cn('relative h-20 w-32 shrink-0 overflow-hidden rounded-md border border-border/50 bg-background'),
    [],
  );

  const addCardClassName = useMemo(
    () => cn('flex h-20 w-32 shrink-0 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border/60 bg-background text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'),
    [],
  );  

  return (
    <div className="space-y-3">
      <Label htmlFor={id}>{label}</Label>
      {helpText ? <p className="text-xs text-muted-foreground">{helpText}</p> : null}

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

      {error ? <p className="text-xs text-red-500">{error}</p> : null}

      <div className={cardsContainerClassName} aria-label={`${label} files`}>
        {hasPreviews
          ? previews.map((preview, index) => (
              <div
                key={`${preview.file.name}-${preview.file.size}-${index}`}
                className={previewCardClassName}
              >
                {preview.isImage && preview.url ? (
                  <img
                    src={preview.url}
                    alt={preview.file.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted/30 text-muted-foreground">
                    <FileIcon />
                  </div>
                )}

                <div className="absolute inset-x-0 bottom-0 rounded-t-none bg-background/85 px-1 py-0.5">
                  <div className="truncate text-[9px] text-muted-foreground">{preview.file.name}</div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const nextFiles = files.filter((_, fileIndex) => fileIndex !== index);
                    onFilesChange(nextFiles);
                  }}
                  className="absolute right-1.5 top-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full border border-border bg-background/90 text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={`Remove ${label} file ${preview.file.name}`}
                >
                  <span aria-hidden="true" className="text-base leading-none">
                    ×
                  </span>
                </button>
              </div>
            ))
          : null}

        <button
          type="button"
          onClick={handleAddFilesClick}
          className={addCardClassName}
          aria-label={`Add ${label} files`}
        >
          <span className="text-xl leading-none">+</span>
          <span className="px-2 text-center text-xs">Add file</span>
        </button>
      </div>
    </div>
  );
};

