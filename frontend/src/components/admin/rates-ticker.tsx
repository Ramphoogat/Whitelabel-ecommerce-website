"use client";

import { useAdminCurrencyRates } from "@/hooks/use-admin-data";

/**
 * Right-to-left auto-scrolling ticker of exchange rates. Uses the store's
 * configured currency rates (Currency section); falls back to indicative
 * market rates when none are configured or the API is unreachable.
 */

interface TickerRate {
  pair: string;
  rate: number;
  /** simulated daily movement, % — only for the up/down tint */
  delta: number;
  live: boolean;
}

const FALLBACK_RATES: TickerRate[] = [
  { pair: "USD → INR", rate: 87.42,  delta: 0.14,  live: false },
  { pair: "EUR → INR", rate: 101.87, delta: -0.08, live: false },
  { pair: "GBP → INR", rate: 118.32, delta: 0.21,  live: false },
  { pair: "AED → INR", rate: 23.8,   delta: 0.02,  live: false },
  { pair: "SGD → INR", rate: 64.95,  delta: -0.11, live: false },
  { pair: "JPY → INR", rate: 0.585,  delta: 0.05,  live: false },
  { pair: "AUD → INR", rate: 57.6,   delta: -0.19, live: false },
  { pair: "CAD → INR", rate: 63.72,  delta: 0.09,  live: false },
];

/** deterministic pseudo-delta so live rates get a stable up/down tint per pair */
function pseudoDelta(seed: string): number {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return ((h % 41) - 20) / 100; // −0.20 … +0.20
}

function fmtRate(n: number): string {
  return n >= 100 ? n.toFixed(2) : n >= 1 ? n.toFixed(2) : n.toFixed(4);
}

export function RatesTicker() {
  const { data: apiRates } = useAdminCurrencyRates();

  const configured: TickerRate[] = (apiRates ?? [])
    .filter((r) => r.isActive)
    .map((r) => ({
      pair: `${r.baseCurrency} → ${r.targetCurrency}`,
      rate: r.rate,
      delta: pseudoDelta(`${r.baseCurrency}${r.targetCurrency}`),
      live: true,
    }));

  // Live rates first, then market pairs they don't already cover — the
  // ribbon should always have plenty of entries even with one configured rate.
  const configuredPairs = new Set(configured.map((r) => r.pair));
  const rates = [...configured, ...FALLBACK_RATES.filter((r) => !configuredPairs.has(r.pair))];
  const isLive = configured.length > 0;

  // Repeat the sequence until one half is comfortably wider than any screen,
  // then duplicate that half so the -50% translate loops seamlessly.
  const repeats = Math.max(1, Math.ceil(12 / rates.length));
  const half = Array.from({ length: repeats }, () => rates).flat();
  const loop = [...half, ...half];

  return (
    <div
      className="mb-6 flex items-center overflow-hidden rounded-[var(--radius-lg)] border border-line/70"
      style={{ background: "var(--surface)" }}
    >
      <div className="z-10 flex shrink-0 items-center gap-2 border-r border-line/70 px-4 py-2.5" style={{ background: "var(--bone)" }}>
        <span className="relative flex size-2">
          <span
            className="absolute inline-flex size-full animate-ping rounded-full opacity-60"
            style={{ background: isLive ? "var(--success)" : "var(--accent)" }}
          />
          <span
            className="relative inline-flex size-2 rounded-full"
            style={{ background: isLive ? "var(--success)" : "var(--accent)" }}
          />
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft">
          {isLive ? "Live rates" : "Market rates"}
        </span>
      </div>

      <div className="group relative flex-1 overflow-hidden">
        <div
          className="flex w-max items-center gap-8 whitespace-nowrap py-2.5 pl-8 group-hover:[animation-play-state:paused]"
          style={{ animation: "ticker-rtl 30s linear infinite" }}
        >
          {loop.map((r, i) => (
            <span key={`${r.pair}-${i}`} className="flex items-center gap-2 font-mono text-[12px]">
              <span className="text-ink-soft">{r.pair}</span>
              <span className="font-medium text-ink">{fmtRate(r.rate)}</span>
              <span style={{ color: r.delta >= 0 ? "var(--success)" : "#dc2626" }}>
                {r.delta >= 0 ? "▲" : "▼"} {Math.abs(r.delta).toFixed(2)}%
              </span>
            </span>
          ))}
        </div>
        <style>{`
          @keyframes ticker-rtl {
            from { transform: translateX(-50%); }
            to   { transform: translateX(0); }
          }
        `}</style>
      </div>
    </div>
  );
}
