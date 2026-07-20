export function StatTile({
  label,
  value,
  delta,
  up,
  index = 0,
}: {
  label: string;
  value: string;
  delta: string;
  up: boolean;
  index?: number;
}) {
  return (
    <div
      className="glass animate-rise hover-glow rounded-[var(--radius-lg)] p-5"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-soft">{label}</p>
      <p className="mt-2 font-display text-2xl font-medium text-ink">{value}</p>
      <p
        className="mt-1 font-mono text-[11px]"
        style={{ color: up ? "var(--success)" : "var(--danger)" }}
      >
        {up ? "↑" : "↓"} {delta}
      </p>
    </div>
  );
}
