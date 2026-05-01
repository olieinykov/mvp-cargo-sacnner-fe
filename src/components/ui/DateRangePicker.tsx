import React from 'react';
import { formatLabel, isoDate } from '../../lib/utils/date';

type DateRange = { from: string | undefined; to: string | undefined };

type CalendarMonthProps = {
  year: number;
  month: number;
  from: string | undefined;
  to: string | undefined;
  hovered: string | undefined;
  onDayClick: (iso: string) => void;
  onDayHover: (iso: string | undefined) => void;
};

type DateRangePickerProps = {
  from: string | undefined;
  to: string | undefined;
  disabled: boolean;
  onChange: (range: DateRange) => void;
};

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const DOW = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const CalendarMonth: React.FC<CalendarMonthProps> = ({
  year,
  month,
  from,
  to,
  hovered,
  onDayClick,
  onDayHover,
}) => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const rangeEnd = to ?? hovered;

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const today = isoDate(new Date());

  return (
    <div className="min-w-[224px]">
      <p className="mb-2 text-center text-xs font-medium text-foreground">
        {MONTHS[month]} {year}
      </p>
      <div className="grid grid-cols-7 gap-y-0.5">
        {DOW.map((d) => (
          <span
            key={d}
            className="flex h-7 items-center justify-center text-[11px] text-muted-foreground/60"
          >
            {d}
          </span>
        ))}
        {cells.map((day, i) => {
          if (!day) return <span key={`empty-${i}`} />;
          const iso = isoDate(new Date(year, month, day));

          const isFrom = iso === from;
          const isTo = iso === to;

          const lo = from && rangeEnd && from <= rangeEnd ? from : rangeEnd;
          const hi = from && rangeEnd && from <= rangeEnd ? rangeEnd : from;
          const inRange = !!(lo && hi && iso > lo && iso < hi);
          const isToday = iso === today;

          return (
            <button
              key={iso}
              type="button"
              onClick={() => onDayClick(iso)}
              onMouseEnter={() => onDayHover(iso)}
              onMouseLeave={() => onDayHover(undefined)}
              aria-label={iso}
              aria-pressed={isFrom || isTo}
              className={[
                'flex h-7 w-full items-center justify-center rounded-md text-xs transition-colors',
                isFrom || isTo
                  ? 'bg-primary text-primary-foreground font-semibold'
                  : inRange
                    ? 'bg-primary/10 text-foreground'
                    : isToday
                      ? 'ring-1 ring-inset ring-primary/40 text-primary font-medium hover:bg-muted'
                      : 'text-foreground hover:bg-muted',
              ].join(' ')}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  from,
  to,
  disabled,
  onChange,
}) => {
  const [open, setOpen] = React.useState(false);
  const [selecting, setSelecting] = React.useState<'from' | 'to'>('from');
  const [hovered, setHovered] = React.useState<string | undefined>();
  const ref = React.useRef<HTMLDivElement>(null);

  const today = new Date();
  const [viewYear, setViewYear] = React.useState(today.getFullYear());
  const [viewMonth, setViewMonth] = React.useState(today.getMonth());

  React.useEffect(() => {
    if (!open) return;
    const onOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onOutside);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onOutside);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else setViewMonth((m) => m + 1);
  };

  const secondMonth = viewMonth === 11 ? 0 : viewMonth + 1;
  const secondYear = viewMonth === 11 ? viewYear + 1 : viewYear;

  const handleDayClick = (iso: string) => {
    if (selecting === 'from') {
      onChange({ from: iso, to: undefined });
      setSelecting('to');
    } else {
      if (from && iso < from) {
        onChange({ from: iso, to: from });
      } else {
        onChange({ from, to: iso });
      }
      setSelecting('from');
      setOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({ from: undefined, to: undefined });
    setSelecting('from');
  };

  const hasValue = !!(from || to);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          setOpen((o) => !o);
          setSelecting('from');
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Date range"
        className={[
          'flex h-8 items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm font-medium shadow-sm transition-all hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40 text-foreground',
        ].join(' ')}
      >
        {/* calendar icon */}
        <svg
          width="13"
          height="13"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
          className="shrink-0"
        >
          <rect
            x="1"
            y="2.5"
            width="12"
            height="10.5"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <path d="M1 5.5h12" stroke="currentColor" strokeWidth="1.4" />
          <path
            d="M4.5 1v3M9.5 1v3"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
        <span>{formatLabel(from, to)}</span>
        {hasValue && (
          <span
            role="button"
            aria-label="Clear date range"
            onClick={handleClear}
            className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground hover:bg-muted-foreground/20 hover:text-foreground"
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
              <path
                d="M1 1l6 6M7 1L1 7"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </span>
        )}
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
          className={`shrink-0 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <path
            d="M2.5 4.5L6 8l3.5-3.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Date range picker"
          className="absolute left-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-border bg-background p-3 shadow-lg ring-1 ring-black/5"
        >
          {/* header nav */}
          <div className="mb-2 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={prevMonth}
              aria-label="Previous month"
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path
                  d="M9 11L5 7l4-4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div className="flex gap-8">
              <CalendarMonth
                year={viewYear}
                month={viewMonth}
                from={from}
                to={to}
                hovered={hovered}
                onDayClick={handleDayClick}
                onDayHover={setHovered}
              />
              <CalendarMonth
                year={secondYear}
                month={secondMonth}
                from={from}
                to={to}
                hovered={hovered}
                onDayClick={handleDayClick}
                onDayHover={setHovered}
              />
            </div>
            <button
              type="button"
              onClick={nextMonth}
              aria-label="Next month"
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path
                  d="M5 3l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* hint */}
          <p className="mt-1 text-center text-[11px] text-muted-foreground/60">
            {selecting === 'from' ? 'Select start date' : 'Select end date'}
          </p>
        </div>
      )}
    </div>
  );
};
