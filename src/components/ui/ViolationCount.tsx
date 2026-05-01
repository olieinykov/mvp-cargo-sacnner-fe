type ViolationCountProps = {
  count: number | null;
};

export const ViolationCount: React.FC<ViolationCountProps> = ({ count }) => {
  if (count == null) {
    return <span className="text-muted-foreground/50">—</span>;
  }

  if (count === 0) {
    return <span className="text-muted-foreground/50">0</span>;
  }

  return <span className="font-mono text-sm font-semibold text-amber-600">{count}</span>;
};
