import type { AuditFilters, AuditStatus } from '../../lib/api/audits';
import { DateRangePicker } from '../ui/DateRangePicker';
import { SelectControl } from '../ui/SelectControl';

type FiltersBarProps = {
  filters: AuditFilters;
  disabled: boolean;
  onChange: (next: Partial<AuditFilters>) => void;
};

const STATUS_OPTIONS: { value: AuditStatus | ''; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'passed', label: 'Passed' },
  { value: 'failed', label: 'Failed' },
];

export const FiltersBar: React.FC<FiltersBarProps> = ({ filters, disabled, onChange }) => {
  const hasActiveFilters = !!(filters.status || filters.dateFrom || filters.dateTo);

  return (
    <div className="flex flex-wrap items-center gap-2 pt-[3px]">
      {/* Status */}
      <SelectControl
        value={filters.status ?? ''}
        options={STATUS_OPTIONS}
        onChange={(v) => onChange({ status: v as AuditStatus | '' })}
        disabled={disabled}
        label="Filter by status"
      />

      {/* Date range */}
      <DateRangePicker
        from={filters.dateFrom ? filters.dateFrom.slice(0, 10) : undefined}
        to={filters.dateTo ? filters.dateTo.slice(0, 10) : undefined}
        disabled={disabled}
        onChange={({ from, to }) =>
          onChange({
            dateFrom: from ? new Date(`${from}T00:00:00`).toISOString() : undefined,
            dateTo: to ? new Date(`${to}T23:59:59.999`).toISOString() : undefined,
          })
        }
      />

      {/* Reset */}
      {hasActiveFilters && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange({ status: '', dateFrom: undefined, dateTo: undefined })}
          className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path
              d="M2 2l8 8M10 2l-8 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          Reset filters
        </button>
      )}
    </div>
  );
};
