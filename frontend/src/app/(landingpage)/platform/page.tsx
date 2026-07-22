"use client";

import Link from "next/link";
import { MarketingNav } from "@/components/landingpage/marketing-nav";
import { GOLD, GOLD_SOFT, GOLD_BORDER, BG, SURFACE, SURFACE2, LINE, INK, INK2, INK3 } from "@/components/landingpage/tokens";

const PILLARS = [
  {
    icon: "⬡",
    title: "Commerce Engine",
    body: "A production-grade order pipeline — catalog, variants, inventory, cart, checkout, tax calculation, and fulfillment — all wired up and ready on day one.",
    items: ["Multi-variant product catalog", "Real-time inventory tracking", "Flexible discount engine", "Order fulfillment workflow"],
  },
  {
    icon: "◈",
    title: "Theme Studio",
    body: "Live dual-surface theming lets merchants retint storefront and admin independently. No CSS knowledge needed — just a colour picker and instant preview.",
    items: ["Storefront & admin scoped tokens", "Google Fonts integration", "Header layout presets", "Live iframe preview"],
  },
  {
    icon: "◎",
    title: "Marketing Suite",
    body: "Run promotions, publish content, and manage banners from one place. No developer required for any campaign.",
    items: ["Coupon & discount codes", "Hero banners with image + tags", "Blog / journal CMS", "Custom pages"],
  },
  {
    icon: "◇",
    title: "Analytics Dashboard",
    body: "Revenue charts, order counts, AOV, and inventory alerts — actionable numbers on the first screen merchants see each day.",
    items: ["30-day revenue trend", "Best-selling products", "Low-stock alerts", "Order velocity metrics"],
  },
  {
    icon: "○",
    title: "Payment Gateways",
    body: "Connect Stripe, Razorpay, or any gateway through the admin panel. Credentials are encrypted at rest. Switch providers without touching code.",
    items: ["Stripe & Razorpay built-in", "Multiple currencies", "Encrypted credential storage", "Webhook reconciliation"],
  },
  {
    icon: "□",
    title: "Infrastructure",
    body: "One store, one database, one VPS. Fully isolated per merchant — no noisy neighbours, no shared slowdowns, no data leakage.",
    items: ["Isolated per-merchant stack", "Single-command deployment", "Custom domain support", "99.9% uptime SLA"],
  },
];

export default function PlatformPage() {
  return (
    <div style={{ background: BG, color: INK, fontFamily: "var(--font-body), ui-sans-serif, sans-serif", minHeight: "100vh" }}>
      <MarketingNav solid />

      {/* Page hero */}
      <section style={{ paddingTop: 140, paddingBottom: 80, textAlign: "center", borderBottom: `1px solid ${LINE}`, position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(200,169,110,0.05), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 32px", position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: GOLD_SOFT, border: `1px solid ${GOLD_BORDER}`, borderRadius: 999, padding: "5px 14px", marginBottom: 28 }}>
            <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.16em", color: GOLD }}>Platform</span>
          </div>
          <h1 style={{ fontFamily: "var(--font-display), Georgia, serif", fontStyle: "italic", fontSize: "clamp(2.5rem,5vw,4rem)", lineHeight: 1.05, color: INK, margin: "0 0 24px", letterSpacing: "-0.02em" }}>
            Everything a modern store needs
          </h1>
          <p style={{ fontSize: 18, color: INK2, lineHeight: 1.65, margin: "0 0 40px" }}>
            Shoplux is a complete white-label commerce platform. Every feature shown here is live, production-grade, and available from the moment you sign up.
          </p>
          <Link href="/staff-login" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: GOLD, color: "#1c1408", padding: "14px 28px", borderRadius: 8, fontSize: 15, fontWeight: 700, textDecoration: "none" }}>
            Start free →
          </Link>
        </div>
      </section>

      {/* Feature pillars */}
      <section style={{ maxWidth: 1240, margin: "0 auto", padding: "100px 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 32 }}>
          {PILLARS.map((p) => (
            <div key={p.title} style={{ background: SURFACE, border: `1px solid ${LINE}`, borderRadius: 16, padding: "40px 36px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(to right, transparent, ${GOLD_BORDER}, transparent)` }} />
              <div style={{ fontSize: 22, color: GOLD, marginBottom: 16 }}>{p.icon}</div>
              <h3 style={{ fontFamily: "var(--font-display), Georgia, serif", fontStyle: "italic", fontSize: 22, color: INK, margin: "0 0 14px" }}>{p.title}</h3>
              <p style={{ fontSize: 14, color: INK2, lineHeight: 1.7, margin: "0 0 24px" }}>{p.body}</p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {p.items.map((item) => (
                  <li key={item} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: INK2 }}>
                    <span style={{ color: GOLD, fontSize: 10 }}>✦</span>{item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA strip */}
      <section style={{ borderTop: `1px solid ${LINE}`, background: SURFACE, padding: "80px 32px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "var(--font-display), Georgia, serif", fontStyle: "italic", fontSize: "clamp(1.8rem,3vw,2.8rem)", color: INK, margin: "0 0 16px" }}>
          Ready to explore it yourself?
        </h2>
        <p style={{ fontSize: 15, color: INK2, margin: "0 auto 36px", maxWidth: 480 }}>
          Sign up free and have your first store running in under two hours.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/staff-login" style={{ background: GOLD, color: "#1c1408", padding: "13px 28px", borderRadius: 8, fontSize: 15, fontWeight: 700, textDecoration: "none" }}>
            Start free trial
          </Link>
          <Link href="/pricing" style={{ background: "transparent", color: INK, padding: "13px 28px", borderRadius: 8, fontSize: 15, border: `1px solid ${LINE}`, textDecoration: "none" }}>
            See pricing →
          </Link>
        </div>
      </section>

      <footer style={{ background: BG, borderTop: `1px solid ${LINE}`, padding: "40px 32px", textAlign: "center" }}>
        <span style={{ fontSize: 11, color: INK3 }}>© 2026 Shoplux. All rights reserved.</span>
      </footer>
    </div>
  );
}
