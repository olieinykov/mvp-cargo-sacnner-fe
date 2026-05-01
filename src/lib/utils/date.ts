export function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatLabel(from: string | undefined, to: string | undefined): string {
  if (!from && !to) return "All dates";
  const fmt = (s: string) =>
    new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  if (from && to) return `${fmt(from)} – ${fmt(to)}`;
  if (from) return `From ${fmt(from)}`;
  return `To ${fmt(to!)}`;
}

export function fmtDate(v: string | null): string {
  if (!v) return '—';
  const d = new Date(v);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}