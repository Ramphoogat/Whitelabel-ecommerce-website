export function AdminTopbar({ title }: { title: string }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-line/70 px-6">
      <h1 className="font-display text-xl italic text-ink">{title}</h1>
      <div className="flex items-center gap-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">
          Aldergate & Co.
        </span>
        <div className="size-8 rounded-full bg-ink font-mono text-[11px] leading-8 text-center text-bone">
          RP
        </div>
      </div>
    </header>
  );
}
