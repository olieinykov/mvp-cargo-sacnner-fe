export const Field = ({
  label, id, required, children,
  hint,
}: {
  label: string;
  id: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {!required && <span className="ml-1 text-xs font-normal text-muted-foreground">(optional)</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}