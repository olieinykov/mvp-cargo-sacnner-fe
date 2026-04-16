import React from "react";

export const Pagination = ({
  page,
  totalPages,
  hasPrev,
  hasNext,
  disabled,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
  disabled: boolean;
  onPageChange: (p: number) => void;
}) => {
  const pages = React.useMemo(() => {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const result: (number | "…")[] = [];
    const addRange = (from: number, to: number) => {
      for (let i = from; i <= to; i++) result.push(i);
    };
    result.push(1);
    if (page > 4) result.push("…");
    addRange(Math.max(2, page - 2), Math.min(totalPages - 1, page + 2));
    if (page < totalPages - 3) result.push("…");
    result.push(totalPages);
    return result;
  }, [page, totalPages]);

  return (
    <nav className="flex items-center gap-1" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={!hasPrev || disabled}
        aria-label="Previous page"
        className="flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Prev
      </button>

      <div className="flex items-center gap-0.5">
        {pages.map((p, i) =>
          p === "…" ? (
            <span
              key={`ellipsis-${i}`}
              className="flex h-9 w-9 items-center justify-center text-sm text-muted-foreground/50"
            >
              ···
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p as number)}
              disabled={disabled}
              aria-label={`Page ${p}`}
              aria-current={p === page ? "page" : undefined}
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-40 ${
                p === page
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {p}
            </button>
          ),
        )}
      </div>

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNext || disabled}
        aria-label="Next page"
        className="flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
      >
        Next
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </nav>
  );
}