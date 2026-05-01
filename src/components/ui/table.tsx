import React from 'react';
import { cn } from '../../lib/utils/cn';

type TableProps = React.TableHTMLAttributes<HTMLTableElement>;

/** Native `<table>` only. Put rounded border + `overflow-hidden` on a non-scrolling parent and scroll an inner wrapper so the frame stays fixed while rows scroll. */
export const Table: React.FC<TableProps> = ({ className, ...props }) => (
  <table className={cn('w-full text-left text-sm', className)} {...props} />
);

type TableHeadProps = React.ThHTMLAttributes<HTMLTableCellElement>;
export const TableHead: React.FC<TableHeadProps> = ({ className, style, ...props }) => (
  <th
    className={cn(
      'sticky top-0 z-20 border-b border-primary/15 px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-primary/60',
      className,
    )}
    style={{
      backgroundColor: 'hsl(var(--background))',
      backgroundImage: 'linear-gradient(hsl(var(--primary) / 0.07), hsl(var(--primary) / 0.07))',
      ...style,
    }}
    {...props}
  />
);

type TableRowProps = React.HTMLAttributes<HTMLTableRowElement>;
export const TableRow: React.FC<TableRowProps> = ({ className, ...props }) => (
  <tr
    className={cn(
      'border-b border-border/40 last:border-0 transition-colors duration-100',
      className,
    )}
    {...props}
  />
);

type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement>;
export const TableCell: React.FC<TableCellProps> = ({ className, ...props }) => (
  <td className={cn('px-4 py-3.5 align-middle', className)} {...props} />
);
