export function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="flex h-40 items-end gap-3">
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
          <div
            className="w-full rounded-t-[4px] bg-accent-soft transition-all"
            style={{ height: `${(d.value / max) * 100}%`, background: "var(--accent)" }}
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-ink-soft">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
