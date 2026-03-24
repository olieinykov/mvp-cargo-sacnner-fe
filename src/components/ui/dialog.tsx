import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '../../lib/utils/cn';

export type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** Visible subtitle; if omitted, a screen-reader-only description is still rendered for Radix a11y */
  description?: string;
  /** Scrollable main area */
  children: React.ReactNode;
  /** Pinned to the bottom (e.g. actions). Use `form="your-form-id"` on submit buttons when the form lives in `children`. */
  footer?: React.ReactNode;
  /** Tailwind max-width class for the panel */
  maxWidthClassName?: string;
};

/**
 * Single modal shell: fixed header + scrollable body + fixed footer.
 * Use everywhere instead of ad-hoc Dialog + manual layout.
 */
export const Modal: React.FC<ModalProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  maxWidthClassName = 'max-w-3xl',
}) => (
  <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />
      <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
        <DialogPrimitive.Content
          className={cn(
            'flex w-full flex-col overflow-hidden bg-background p-0 shadow-2xl outline-none',
            'rounded-t-2xl border border-border/60 sm:rounded-2xl',
            'max-h-[92dvh] sm:max-h-[min(90vh,calc(100vh-2rem))]',
            maxWidthClassName,
          )}
        >
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border/60 px-6 py-4">
            <div className="min-w-0 flex-1">
              <DialogPrimitive.Title className="text-base font-semibold leading-none tracking-tight">
                {title}
              </DialogPrimitive.Title>
              {description ? (
                <DialogPrimitive.Description className="mt-1.5 text-sm text-muted-foreground">
                  {description}
                </DialogPrimitive.Description>
              ) : (
                <DialogPrimitive.Description className="sr-only">
                  Dialog content.
                </DialogPrimitive.Description>
              )}
            </div>
            <DialogPrimitive.Close
              className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Close dialog"
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                <path d="M3 3l9 9M12 3l-9 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </DialogPrimitive.Close>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5">
            {children}
          </div>

          {footer ? (
            <div className="shrink-0 border-t border-border/60 px-6 py-4">
              <div className="flex flex-wrap items-center justify-end gap-2">{footer}</div>
            </div>
          ) : null}
        </DialogPrimitive.Content>
      </div>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>
);

/** @deprecated Use `Modal` — same component, kept for imports that still say `Dialog` */
export const Dialog = Modal;
