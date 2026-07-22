"use client";

import Link from "next/link";
import { MarketingNav } from "@/components/landingpage/marketing-nav";
import { GOLD, GOLD_SOFT, GOLD_BORDER, BG, SURFACE, SURFACE2, LINE, INK, INK2, INK3 } from "@/components/landingpage/tokens";

const THEMES = [
  {
    name: "Dusk",
    tagline: "Dark luxury — gold on near-black.",
    accent: "#c8a96e",
    bg: "#080810",
    surface: "#0e0e18",
    category: "Luxury",
  },
  {
    name: "Ivory",
    tagline: "Clean, airy — cream with warm ink.",
    accent: "#a0845c",
    bg: "#faf8f4",
    surface: "#f2efe9",
    category: "Minimal",
  },
  {
    name: "Indigo",
    tagline: "Bold and modern — violet with crisp white.",
    accent: "#818cf8",
    bg: "#0c0c1a",
    surface: "#13132a",
    category: "Bold",
  },
  {
    name: "Sage",
    tagline: "Natural and calm — forest green on linen.",
    accent: "#5c8a6e",
    bg: "#f6f4ef",
    surface: "#eceae3",
    category: "Organic",
  },
  {
    name: "Ember",
    tagline: "Warm and artisan — terracotta on sand.",
    accent: "#c0683c",
    bg: "#1a1008",
    surface: "#241808",
    category: "Artisan",
  },
  {
    name: "Slate",
    tagline: "Cool and professional — steel on off-white.",
    accent: "#6b94b4",
    bg: "#f8f9fb",
    surface: "#eff1f5",
    category: "Corporate",
  },
];

function ThemeCard({ t }: { t: typeof THEMES[0] }) {
  const dark = t.bg.startsWith("#0") || t.bg.startsWith("#1") || t.bg.startsWith("#2");
  const ink = dark ? "#f6f4ee" : "#1c1a16";
  const ink2 = dark ? "#a9a6a4" : "#6e6b66";
  const line = dark ? "#28283a" : "#e4e0d4";

  return (
    <div style={{ background: SURFACE, border: `1px solid ${LINE}`, borderRadius: 16, overflow: "hidden" }}>
      {/* Preview */}
      <div style={{ background: t.bg, border: `1px solid ${line}20`, margin: 12, borderRadius: 10, overflow: "hidden" }}>
        {/* Mock nav */}
        <div style={{ background: t.surface, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${line}40` }}>
          <span style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 13, color: ink }}>{t.name} Store</span>
          <div style={{ display: "flex", gap: 12 }}>
            {["Shop", "Journal"].map((l) => <span key={l} style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: ink2 }}>{l}</span>)}
          </div>
        </div>
        {/* Mock hero */}
        <div style={{ height: 120, background: `linear-gradient(135deg, ${t.accent}20, ${t.bg})`, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 6 }}>
          <span style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 18, color: ink }}>New Collection</span>
          <span style={{ display: "inline-block", background: t.accent, color: dark ? "#1c1408" : "#fff", padding: "5px 14px", borderRadius: 4, fontSize: 10, fontWeight: 600 }}>Shop now</span>
        </div>
        {/* Mock product row */}
        <div style={{ display: "flex", gap: 4, padding: 8 }}>
          {[1, 2, 3].map((n) => (
            <div key={n} style={{ flex: 1, background: t.surface, borderRadius: 6, padding: 8 }}>
              <div style={{ height: 40, background: `${t.accent}18`, borderRadius: 4, marginBottom: 6 }} />
              <div style={{ height: 6, background: `${line}60`, borderRadius: 3, marginBottom: 4, width: "70%" }} />
              <div style={{ fontSize: 9, color: t.accent, fontWeight: 600 }}>${24 + n * 12}.00</div>
            </div>
          ))}
        </div>
      </div>

      {/* Meta */}
      <div style={{ padding: "16px 20px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <h3 style={{ fontFamily: "var(--font-display), Georgia, serif", fontStyle: "italic", fontSize: 18, color: INK, margin: 0 }}>{t.name}</h3>
          <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.14em", color: GOLD, background: GOLD_SOFT, border: `1px solid ${GOLD_BORDER}`, borderRadius: 999, padding: "2px 9px" }}>{t.category}</span>
        </div>
        <p style={{ fontSize: 13, color: INK2, margin: "0 0 16px", lineHeight: 1.5 }}>{t.tagline}</p>
        <div style={{ display: "flex", gap: 8 }}>
          {[t.accent, t.bg, t.surface].map((c) => (
            <div key={c} title={c} style={{ width: 18, height: 18, borderRadius: "50%", background: c, border: `1px solid ${LINE}` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ThemesPage() {
  return (
    <div style={{ background: BG, color: INK, fontFamily: "var(--font-body), ui-sans-serif, sans-serif", minHeight: "100vh" }}>
      <MarketingNav solid />

      {/* Hero */}
      <section style={{ paddingTop: 140, paddingBottom: 72, textAlign: "center", borderBottom: `1px solid ${LINE}`, position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(200,169,110,0.05), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: 600, margin: "0 auto", padding: "0 32px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: GOLD_SOFT, border: `1px solid ${GOLD_BORDER}`, borderRadius: 999, padding: "5px 14px", marginBottom: 24 }}>
            <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.16em", color: GOLD }}>Themes</span>
          </div>
          <h1 style={{ fontFamily: "var(--font-display), Georgia, serif", fontStyle: "italic", fontSize: "clamp(2.5rem,5vw,4rem)", color: INK, margin: "0 0 20px", letterSpacing: "-0.02em" }}>
            Themes built for your brand
          </h1>
          <p style={{ fontSize: 17, color: INK2, margin: "0 0 36px", lineHeight: 1.65 }}>
            Start with a curated preset, then fine-tune every colour, font, and layout token in Theme Studio — no CSS required.
          </p>
          <Link href="/staff-login" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: GOLD, color: "#1c1408", padding: "14px 28px", borderRadius: 8, fontSize: 15, fontWeight: 700, textDecoration: "none" }}>
            Try Theme Studio free →
          </Link>
        </div>
      </section>

      {/* Theme gallery */}
      <section style={{ maxWidth: 1240, margin: "0 auto", padding: "80px 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 28 }}>
          {THEMES.map((t) => <ThemeCard key={t.name} t={t} />)}
        </div>
      </section>

      {/* Studio callout */}
      <section style={{ background: SURFACE, borderTop: `1px solid ${LINE}`, padding: "80px 32px", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.18em", color: GOLD, marginBottom: 16 }}>Theme Studio</div>
          <h2 style={{ fontFamily: "var(--font-display), Georgia, serif", fontStyle: "italic", fontSize: "clamp(1.8rem,3vw,2.8rem)", color: INK, margin: "0 0 16px" }}>
            Make any theme yours in minutes
          </h2>
          <p style={{ fontSize: 15, color: INK2, margin: "0 auto 36px", lineHeight: 1.65 }}>
            Pick a preset, open Theme Studio, and drag a colour slider. Your storefront and admin update live — side by side, simultaneously — with no code.
          </p>
          <Link href="/staff-login" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: GOLD, color: "#1c1408", padding: "13px 28px", borderRadius: 8, fontSize: 15, fontWeight: 700, textDecoration: "none" }}>
            Open Theme Studio
          </Link>
        </div>
      </section>

      <footer style={{ background: BG, borderTop: `1px solid ${LINE}`, padding: "40px 32px", textAlign: "center" }}>
        <span style={{ fontSize: 11, color: INK3 }}>© 2026 Shoplux. All rights reserved.</span>
      </footer>
    </div>
  );
}
