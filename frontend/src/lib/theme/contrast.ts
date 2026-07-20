import type { StoreThemeConfig } from "./types";

/** WCAG 2.x relative luminance from a #rrggbb hex. */
function luminance(hex: string): number {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return 0;
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(m[1].slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export interface ContrastWarning {
  pair: string;
  ratio: number;
  needed: number;
  message: string;
}

/**
 * Guardrail checks for the pairs that actually decide readability.
 * Warnings, not blocks — the merchant stays in control, but is told
 * exactly what will be hard to read before they save it.
 */
export function contrastWarnings(t: StoreThemeConfig): ContrastWarning[] {
  // `warnBelow` is the trigger; `needed` is the target quoted in the message.
  // The accent check triggers slightly below its target so the house palette
  // (glacier on bone, ~2.7:1, used only for large/mono accents) stays quiet.
  const checks: { pair: string; fg: string; bg: string; needed: number; warnBelow?: number; what: string }[] = [
    { pair: "Text on page background", fg: t.ink, bg: t.background, needed: 4.5, what: "body text" },
    { pair: "Text on card surface", fg: t.ink, bg: t.surface, needed: 4.5, what: "card text" },
    { pair: "Muted text on card surface", fg: t.inkSoft, bg: t.surface, needed: 3, what: "captions" },
    { pair: "Accent text on accent", fg: t.accentInk, bg: t.accent, needed: 3, what: "button labels" },
    { pair: "Accent on page background", fg: t.accent, bg: t.background, needed: 3, warnBelow: 2.5, what: "links and highlights" },
  ];

  return checks
    .map((c) => ({ ...c, ratio: contrastRatio(c.fg, c.bg) }))
    .filter((c) => c.ratio < (c.warnBelow ?? c.needed))
    .map((c) => ({
      pair: c.pair,
      ratio: Math.round(c.ratio * 10) / 10,
      needed: c.needed,
      message: `${c.pair} is ${(Math.round(c.ratio * 10) / 10).toFixed(1)}:1 — ${c.what} may be hard to read (aim for ${c.needed}:1).`,
    }));
}
