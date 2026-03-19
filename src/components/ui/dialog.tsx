import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '../../lib/utils/cn';

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
};

export const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => (
  <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/30" />
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-4">
        <DialogPrimitive.Content
          className={cn(
            'w-full max-w-3xl rounded-lg bg-background p-4 shadow-lg outline-none ring-1 ring-border/50',
            'max-h-[calc(100vh-2rem)] overflow-y-auto overscroll-contain',
          )}
        >
          {children}
        </DialogPrimitive.Content>
      </div>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>
);

type DialogHeaderProps = {
  title: string;
  description?: string;
};

export const DialogHeader: React.FC<DialogHeaderProps> = ({ title, description }) => (
  <div className="mb-4 space-y-1">
    <h2 className="text-lg font-semibold leading-none tracking-tight">{title}</h2>
    {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
  </div>
);

