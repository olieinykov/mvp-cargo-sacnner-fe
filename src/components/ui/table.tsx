import React from "react";
import { cn } from "../../lib/utils/cn";

type TableProps = React.TableHTMLAttributes<HTMLTableElement>;

/** Native `<table>` only. Put rounded border + `overflow-hidden` on a non-scrolling parent and scroll an inner wrapper so the frame stays fixed while rows scroll. */
export const Table: React.FC<TableProps> = ({ className, ...props }) => (
  <table className={cn("w-full text-left text-sm", className)} {...props} />
);

type TableHeadProps = React.ThHTMLAttributes<HTMLTableCellElement>;
export const TableHead: React.FC<TableHeadProps> = ({
  className,
  ...props
}) => (
  <th
    className={cn(
      "sticky top-0 z-10 bg-muted px-4 py-2 text-xs font-medium text-muted-foreground/90",
      className,
    )}
    {...props}
  />
);

type TableRowProps = React.HTMLAttributes<HTMLTableRowElement>;
export const TableRow: React.FC<TableRowProps> = ({ className, ...props }) => (
  <tr
    className={cn("border-b border-border last:border-0", className)}
    {...props}
  />
);

type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement>;
export const TableCell: React.FC<TableCellProps> = ({
  className,
  ...props
}) => <td className={cn("px-4 py-2 align-middle", className)} {...props} />;
