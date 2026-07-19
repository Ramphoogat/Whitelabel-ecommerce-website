export function StatTile({
  label,
  value,
  delta,
  up,
}: {
  label: string;
  value: string;
  delta: string;
  up: boolean;
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-line/70 bg-surface p-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-soft">{label}</p>
      <p className="mt-2 font-display text-2xl text-ink">{value}</p>
      <p
        className="mt-1 font-mono text-[11px]"
        style={{ color: up ? "var(--success)" : "var(--danger)" }}
      >
        {up ? "↑" : "↓"} {delta}
      </p>
    </div>
  );
}
