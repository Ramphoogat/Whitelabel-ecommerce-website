"use client";

import Link from "next/link";
import { useState } from "react";
import { MarketingNav } from "@/components/landingpage/marketing-nav";
import { GOLD, GOLD_SOFT, GOLD_BORDER, BG, SURFACE, SURFACE2, LINE, INK, INK2, INK3 } from "@/components/landingpage/tokens";

const PLANS = [
  {
    name: "Starter",
    monthly: "Free",
    annually: "Free",
    sub: "forever",
    desc: "For new merchants exploring the platform.",
    features: [
      "1 storefront",
      "Up to 100 products",
      "Standard themes (3 presets)",
      "Basic analytics",
      "Email support",
      "Custom domain",
    ],
    cta: "Get started",
    featured: false,
  },
  {
    name: "Growth",
    monthly: "$49",
    annually: "$39",
    sub: "/ month",
    desc: "For brands ready to scale and stand out.",
    features: [
      "Unlimited storefronts",
      "Unlimited products",
      "All themes + Theme Studio",
      "Full analytics dashboard",
      "Priority email & chat support",
      "Custom domain + SSL",
      "Marketing suite (coupons, banners, CMS)",
      "Multi-gateway payments",
    ],
    cta: "Start free trial",
    featured: true,
    badge: "Most popular",
  },
  {
    name: "Enterprise",
    monthly: "Custom",
    annually: "Custom",
    sub: "",
    desc: "For agencies and high-volume merchants.",
    features: [
      "Everything in Growth",
      "Dedicated VPS per store",
      "SLA guarantee",
      "Onboarding concierge",
      "Custom integrations",
      "Invoiced billing",
    ],
    cta: "Contact us",
    featured: false,
  },
];

const FAQS = [
  { q: "Is the Starter plan really free?", a: "Yes — no credit card required. You get a fully functional store with up to 100 products for as long as you need." },
  { q: "Can I switch plans later?", a: "Absolutely. Upgrade or downgrade at any time. Upgrades take effect immediately; downgrades at the end of your billing period." },
  { q: "Do you charge transaction fees?", a: "No. Shoplux does not take a cut of your sales. You only pay your payment gateway's standard processing fee." },
  { q: "What happens to my data if I cancel?", a: "You can export everything before you cancel. We retain your data for 30 days after cancellation for your peace of mind." },
  { q: "Is the annual discount applied upfront?", a: "Yes — you pay the annual total at the start of the year and save 20% compared to monthly billing." },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div style={{ background: BG, color: INK, fontFamily: "var(--font-body), ui-sans-serif, sans-serif", minHeight: "100vh" }}>
      <MarketingNav solid />

      {/* Hero */}
      <section style={{ paddingTop: 140, paddingBottom: 72, textAlign: "center", borderBottom: `1px solid ${LINE}`, position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(200,169,110,0.05), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: 600, margin: "0 auto", padding: "0 32px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: GOLD_SOFT, border: `1px solid ${GOLD_BORDER}`, borderRadius: 999, padding: "5px 14px", marginBottom: 24 }}>
            <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.16em", color: GOLD }}>Pricing</span>
          </div>
          <h1 style={{ fontFamily: "var(--font-display), Georgia, serif", fontStyle: "italic", fontSize: "clamp(2.5rem,5vw,4rem)", color: INK, margin: "0 0 16px", letterSpacing: "-0.02em" }}>
            Simple, honest pricing
          </h1>
          <p style={{ fontSize: 17, color: INK2, margin: "0 0 36px" }}>Start free. Upgrade when your store is ready to grow.</p>

          {/* Billing toggle */}
          <div style={{ display: "inline-flex", background: SURFACE, border: `1px solid ${LINE}`, borderRadius: 999, padding: 4, gap: 4 }}>
            {[["Monthly", false], ["Annual · save 20%", true]].map(([label, val]) => (
              <button key={String(val)} onClick={() => setAnnual(val as boolean)} style={{
                padding: "8px 20px", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 13,
                background: annual === val ? GOLD : "transparent",
                color: annual === val ? "#1c1408" : INK2,
                fontWeight: annual === val ? 600 : 400,
                transition: "all 0.2s",
              }}>
                {label as string}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Plan cards */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24, alignItems: "start" }}>
          {PLANS.map((p) => (
            <div key={p.name} style={{
              background: p.featured ? SURFACE2 : SURFACE,
              border: p.featured ? `1px solid ${GOLD_BORDER}` : `1px solid ${LINE}`,
              boxShadow: p.featured ? `0 0 0 1px rgba(200,169,110,0.1), 0 24px 64px rgba(0,0,0,0.4)` : undefined,
              borderRadius: 16, padding: "40px 36px", position: "relative", overflow: "hidden"
            }}>
              {p.featured && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(to right, transparent, ${GOLD}, transparent)` }} />}
              {p.badge && (
                <div style={{ position: "absolute", top: 20, right: 20, background: GOLD_SOFT, border: `1px solid ${GOLD_BORDER}`, borderRadius: 999, padding: "3px 10px", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.14em", color: GOLD }}>
                  {p.badge}
                </div>
              )}
              <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.16em", color: p.featured ? GOLD : INK3, marginBottom: 12 }}>{p.name}</div>
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontFamily: "var(--font-display), Georgia, serif", fontStyle: "italic", fontSize: 44, color: INK, lineHeight: 1 }}>
                  {annual ? p.annually : p.monthly}
                </span>
                {p.sub && <span style={{ fontSize: 13, color: INK3, marginLeft: 6 }}>{p.sub}</span>}
              </div>
              <p style={{ fontSize: 13, color: INK3, margin: "0 0 28px", lineHeight: 1.5 }}>{p.desc}</p>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 36px", display: "flex", flexDirection: "column", gap: 12 }}>
                {p.features.map((f) => (
                  <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: INK2 }}>
                    <span style={{ color: GOLD, fontSize: 10, marginTop: 3, flexShrink: 0 }}>✦</span>{f}
                  </li>
                ))}
              </ul>
              <Link href={p.name === "Enterprise" ? "#" : "/staff-login"} style={{
                display: "block", textAlign: "center", padding: "13px", borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none",
                background: p.featured ? GOLD : "transparent",
                color: p.featured ? "#1c1408" : INK,
                border: p.featured ? "none" : `1px solid ${LINE}`,
              }}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ maxWidth: 720, margin: "0 auto", padding: "0 32px 100px" }}>
        <h2 style={{ fontFamily: "var(--font-display), Georgia, serif", fontStyle: "italic", fontSize: 28, color: INK, marginBottom: 40, textAlign: "center" }}>Frequently asked questions</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ background: SURFACE, border: `1px solid ${LINE}`, borderRadius: 10, overflow: "hidden" }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{
                width: "100%", padding: "18px 22px", display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "transparent", border: "none", cursor: "pointer", color: INK, fontSize: 15, textAlign: "left",
              }}>
                <span>{faq.q}</span>
                <span style={{ color: GOLD, fontSize: 18, transform: openFaq === i ? "rotate(45deg)" : "none", transition: "transform 0.2s", flexShrink: 0, marginLeft: 12 }}>+</span>
              </button>
              {openFaq === i && (
                <div style={{ padding: "0 22px 18px", fontSize: 14, color: INK2, lineHeight: 1.7 }}>{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      <footer style={{ background: BG, borderTop: `1px solid ${LINE}`, padding: "40px 32px", textAlign: "center" }}>
        <span style={{ fontSize: 11, color: INK3 }}>© 2026 Shoplux. All rights reserved.</span>
      </footer>
    </div>
  );
}
