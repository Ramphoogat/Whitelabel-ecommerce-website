"use client";

import Link from "next/link";
import { useState } from "react";
import { MarketingNav } from "@/components/landingpage/marketing-nav";
import { GOLD, GOLD_SOFT, GOLD_BORDER, BG, SURFACE, SURFACE2, LINE, INK, INK2, INK3 } from "@/components/landingpage/tokens";

const SECTIONS = [
  {
    title: "Getting Started",
    icon: "◎",
    color: "#5c8a6e",
    articles: [
      { title: "Create your Shoplux account", time: "2 min" },
      { title: "Set up your first store", time: "5 min" },
      { title: "Add your first products", time: "4 min" },
      { title: "Connect a custom domain", time: "3 min" },
      { title: "Go live checklist", time: "5 min" },
    ],
  },
  {
    title: "Theme Studio",
    icon: "◈",
    color: "#c8a96e",
    articles: [
      { title: "Overview: storefront vs admin surface", time: "3 min" },
      { title: "Changing brand colours", time: "2 min" },
      { title: "Fonts and typography", time: "3 min" },
      { title: "Header layout presets", time: "2 min" },
      { title: "Uploading your logo", time: "1 min" },
    ],
  },
  {
    title: "Products & Catalog",
    icon: "⬡",
    color: "#818cf8",
    articles: [
      { title: "Creating products and variants", time: "5 min" },
      { title: "Collections and categories", time: "4 min" },
      { title: "Inventory management", time: "3 min" },
      { title: "Bulk import via CSV", time: "6 min" },
      { title: "Product images and media", time: "3 min" },
    ],
  },
  {
    title: "Payments & Orders",
    icon: "○",
    color: "#e8a0a0",
    articles: [
      { title: "Connecting Stripe", time: "4 min" },
      { title: "Connecting Razorpay", time: "4 min" },
      { title: "Order fulfilment workflow", time: "5 min" },
      { title: "Refunds and cancellations", time: "3 min" },
      { title: "Tax configuration", time: "4 min" },
    ],
  },
  {
    title: "Marketing",
    icon: "◇",
    color: "#d4a060",
    articles: [
      { title: "Creating discount coupons", time: "3 min" },
      { title: "Hero banners", time: "2 min" },
      { title: "Blog posts and the journal", time: "4 min" },
      { title: "Custom CMS pages", time: "3 min" },
      { title: "Email campaigns", time: "5 min" },
    ],
  },
  {
    title: "Analytics",
    icon: "□",
    color: "#a0b8d8",
    articles: [
      { title: "Reading the revenue chart", time: "2 min" },
      { title: "Understanding AOV and order count", time: "3 min" },
      { title: "Inventory alerts", time: "2 min" },
      { title: "Exporting data", time: "3 min" },
    ],
  },
];

export default function DocsPage() {
  const [search, setSearch] = useState("");

  const filtered = SECTIONS.map((s) => ({
    ...s,
    articles: s.articles.filter(
      (a) =>
        !search ||
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        s.title.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((s) => s.articles.length > 0);

  return (
    <div style={{ background: BG, color: INK, fontFamily: "var(--font-body), ui-sans-serif, sans-serif", minHeight: "100vh" }}>
      <MarketingNav solid />

      {/* Hero */}
      <section style={{ paddingTop: 140, paddingBottom: 60, textAlign: "center", borderBottom: `1px solid ${LINE}`, position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(200,169,110,0.05), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: 600, margin: "0 auto", padding: "0 32px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: GOLD_SOFT, border: `1px solid ${GOLD_BORDER}`, borderRadius: 999, padding: "5px 14px", marginBottom: 24 }}>
            <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.16em", color: GOLD }}>Documentation</span>
          </div>
          <h1 style={{ fontFamily: "var(--font-display), Georgia, serif", fontStyle: "italic", fontSize: "clamp(2.5rem,5vw,4rem)", color: INK, margin: "0 0 20px", letterSpacing: "-0.02em" }}>
            How-to guides & reference
          </h1>
          <p style={{ fontSize: 17, color: INK2, margin: "0 0 32px" }}>
            Everything you need to set up and run your Shoplux store.
          </p>

          {/* Search */}
          <div style={{ position: "relative", maxWidth: 440, margin: "0 auto" }}>
            <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: INK3, fontSize: 15 }}>⌕</span>
            <input
              type="text"
              placeholder="Search docs…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%", boxSizing: "border-box",
                background: SURFACE, border: `1px solid ${LINE}`, borderRadius: 8,
                padding: "12px 16px 12px 40px", fontSize: 14, color: INK,
                outline: "none",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = GOLD_BORDER)}
              onBlur={(e) => (e.currentTarget.style.borderColor = LINE)}
            />
          </div>
        </div>
      </section>

      {/* Sections */}
      <section style={{ maxWidth: 1240, margin: "0 auto", padding: "72px 32px 100px" }}>
        {filtered.length === 0 ? (
          <p style={{ textAlign: "center", color: INK2, fontSize: 15 }}>No articles match &ldquo;{search}&rdquo;.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 28 }}>
            {filtered.map((s) => (
              <div key={s.title} style={{ background: SURFACE, border: `1px solid ${LINE}`, borderRadius: 16, padding: "32px 32px 28px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(to right, transparent, ${s.color}40, transparent)` }} />
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                  <span style={{ fontSize: 18, color: s.color }}>{s.icon}</span>
                  <h2 style={{ fontFamily: "var(--font-display), Georgia, serif", fontStyle: "italic", fontSize: 18, color: INK, margin: 0 }}>{s.title}</h2>
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                  {s.articles.map((a) => (
                    <li key={a.title}>
                      <a href="#" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", borderRadius: 7, textDecoration: "none", transition: "background 0.15s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = SURFACE2)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                        <span style={{ fontSize: 14, color: INK2 }}>{a.title}</span>
                        <span style={{ fontSize: 11, color: INK3, flexShrink: 0, marginLeft: 12 }}>{a.time}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Bottom CTA */}
      <section style={{ background: SURFACE, borderTop: `1px solid ${LINE}`, padding: "60px 32px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "var(--font-display), Georgia, serif", fontStyle: "italic", fontSize: 26, color: INK, margin: "0 0 12px" }}>
          Still have questions?
        </h2>
        <p style={{ fontSize: 14, color: INK2, margin: "0 0 28px" }}>Our team usually replies within a few hours.</p>
        <Link href="/staff-login" style={{ background: GOLD, color: "#1c1408", padding: "12px 24px", borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
          Contact support
        </Link>
      </section>

      <footer style={{ background: BG, borderTop: `1px solid ${LINE}`, padding: "40px 32px", textAlign: "center" }}>
        <span style={{ fontSize: 11, color: INK3 }}>© 2026 Shoplux. All rights reserved.</span>
      </footer>
    </div>
  );
}
