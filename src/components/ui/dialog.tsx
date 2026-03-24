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
      <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/30" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <DialogPrimitive.Content
          className={cn(
            'flex w-full flex-col overflow-hidden rounded-xl border border-border bg-background p-0 shadow-lg outline-none ring-1 ring-border/40',
            maxWidthClassName,
            'max-h-[min(90vh,calc(100vh-2rem))]',
          )}
        >
          <div className="shrink-0 border-b border-border px-6 py-4">
            <DialogPrimitive.Title className="text-lg font-semibold leading-none tracking-tight">
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

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4">
            {children}
          </div>

          {footer ? (
            <div className="shrink-0 border-t border-border px-6 py-4">
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
