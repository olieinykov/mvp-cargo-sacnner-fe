const BADGE =
  'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium leading-none ring-1 ring-inset';

type YesNoBadgeProps = {
  value: string | null;
};

export const YesNoBadge: React.FC<YesNoBadgeProps> = ({ value }) => {
  if (value === 'Y') {
    return (
      <span className={`${BADGE} bg-emerald-50 text-emerald-700 ring-emerald-600/20`}>Yes</span>
    );
  }

  if (value === 'N') {
    return <span className={`${BADGE} bg-red-50 text-red-700 ring-red-600/20`}>No</span>;
  }

  return <span className="text-xs text-muted-foreground/50">—</span>;
};
