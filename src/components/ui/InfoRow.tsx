type StaticInfoRowProps = { label: string; value: React.ReactNode }
type DetailRowProps = { label: string; children: React.ReactNode }

export const StaticInfoRow: React.FC<StaticInfoRowProps> = ({ label, value }) => {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border/40 bg-muted/10 px-4 py-3.5">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <div className="text-sm font-medium text-foreground/90">{value}</div>
      </div>
    </div>
  );
}

export const DetailRow: React.FC<DetailRowProps> = ({ label, children }) => {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border border-border/30 bg-muted/10 px-3 py-2.5">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="text-sm text-foreground/90">{children}</div>
    </div>
  );
}