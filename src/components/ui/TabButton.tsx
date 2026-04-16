export const TabButton = ({
  active,
  onClick,
  children,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count?: number;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
        active
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
    >
      {children}
      {count !== undefined && (
        <span className={`rounded-full px-1.5 py-0.5 text-xs font-semibold leading-none ${
          active ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}
