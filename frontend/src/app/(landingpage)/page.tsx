"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MarketingNav } from "@/components/landingpage/marketing-nav";
import { GOLD, GOLD_SOFT, GOLD_BORDER, BG, SURFACE, SURFACE2, LINE, INK, INK2, INK3 } from "@/components/landingpage/tokens";

const HeroCanvas = dynamic(() => import("@/components/landingpage/hero-canvas"), { ssr: false });

// ── Hero ──────────────────────────────────────────────────────────────
function Hero() {
  const headRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function animate() {
      try {
        const { gsap } = await import("gsap");
        if (cancelled || !headRef.current) return;
        const words = headRef.current.querySelectorAll(".word");
        gsap.fromTo(words, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08, ease: "power3.out", delay: 0.3 });
      } catch { /* GSAP not ready */ }
    }
    animate();
    return () => { cancelled = true; };
  }, []);

  const headline = "Your brand. Your storefront. Built to feel inevitable.";
  const words = headline.split(" ");

  return (
    <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", background: BG, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 70% 60% at 65% 50%, rgba(200,169,110,0.06) 0%, transparent 70%)`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 50% 60% at 20% 80%, rgba(129,140,248,0.04) 0%, transparent 70%)`, pointerEvents: "none" }} />

      {/* Full-bleed canvas behind everything */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <HeroCanvas />
      </div>

      {/* Radial vignette so text stays legible over the globe */}
      <div style={{ position: "absolute", inset: 0, zIndex: 1, background: `radial-gradient(ellipse 55% 80% at 68% 50%, transparent 20%, ${BG} 75%)`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, zIndex: 1, background: `linear-gradient(to right, ${BG} 0%, ${BG}cc 30%, transparent 60%)`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 200, zIndex: 1, background: `linear-gradient(to top, ${BG}, transparent)`, pointerEvents: "none" }} />

      {/* Hero text — left-aligned, sits over the canvas */}
      <div style={{ position: "relative", zIndex: 2, maxWidth: 1240, margin: "0 auto", padding: "180px 32px 120px", width: "100%" }}>
        <div style={{ maxWidth: 580 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: GOLD_SOFT, border: `1px solid ${GOLD_BORDER}`, borderRadius: 999, padding: "5px 14px", marginBottom: 36 }}>
            <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: GOLD }} />
            <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.16em", color: GOLD }}>White-label · Launch in hours</span>
          </div>

          <h1 ref={headRef} style={{ fontFamily: "var(--font-display), Georgia, serif", fontStyle: "italic", fontWeight: 500, fontSize: "clamp(3rem,5.5vw,5rem)", lineHeight: 1.05, color: INK, margin: "0 0 28px", letterSpacing: "-0.02em" }}>
            {words.map((w, i) => (
              <span key={i} className="word" style={{ display: "inline-block", opacity: 0, marginRight: w === "." ? 0 : "0.22em" }}>{w}</span>
            ))}
          </h1>

          <p style={{ fontSize: 18, color: INK2, lineHeight: 1.65, maxWidth: 460, margin: "0 0 44px" }}>
            Shoplux gives merchants a fully-branded storefront, merchant admin, and the infrastructure of an enterprise platform — without the generic look.
          </p>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Link href="/staff-login" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: GOLD, color: "#1c1408", padding: "14px 28px", borderRadius: 8, fontSize: 15, fontWeight: 700, textDecoration: "none", transition: "transform 0.2s, box-shadow 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(200,169,110,0.3)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
              Start free trial →
            </Link>
            <a href="#how-it-works" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", color: INK, padding: "14px 28px", borderRadius: 8, fontSize: 15, border: `1px solid ${LINE}`, textDecoration: "none", transition: "border-color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = GOLD_BORDER)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = LINE)}>
              See how it works
            </a>
          </div>

          <div style={{ marginTop: 56, display: "flex", gap: 40 }}>
            {[["500+", "Stores launched"], ["99.9%", "Uptime SLA"], ["< 2h", "Average setup"]].map(([v, l]) => (
              <div key={l}>
                <div style={{ fontFamily: "var(--font-display), Georgia, serif", fontStyle: "italic", fontSize: 28, color: GOLD, lineHeight: 1 }}>{v}</div>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: INK3, marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating store card — anchored bottom-right of the content area */}
        <div style={{ position: "absolute", bottom: 80, right: 32, background: SURFACE2, border: `1px solid ${LINE}`, borderRadius: 14, padding: "18px 22px", width: 240, boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: GOLD, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 14 }}>✦</span>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: INK }}>Luna Atelier</div>
              <div style={{ fontSize: 10, color: INK3, textTransform: "uppercase", letterSpacing: "0.1em" }}>Fashion · Live</div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div><div style={{ fontSize: 10, color: INK3 }}>Today</div><div style={{ fontSize: 16, fontWeight: 600, color: INK }}>$4,280</div></div>
            <div style={{ textAlign: "right" }}><div style={{ fontSize: 10, color: INK3 }}>Orders</div><div style={{ fontSize: 16, fontWeight: 600, color: INK }}>31</div></div>
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.18em", color: INK3 }}>Scroll</span>
        <div style={{ width: 1, height: 40, background: `linear-gradient(to bottom, ${GOLD_BORDER}, transparent)` }} />
      </div>
    </section>
  );
}

// ── Logo bar ──────────────────────────────────────────────────────────
function LogoBar() {
  const brands = ["Maison Rowan", "Kova Studio", "Arco Supply", "Thread & Oak", "The Curio", "Fieldsong", "Bloc Market", "Ember & Co"];
  const doubled = [...brands, ...brands];

  return (
    <div style={{ borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}`, background: SURFACE, padding: "22px 0", overflow: "hidden" }}>
      <div style={{ display: "flex", gap: 72, width: "max-content", animation: "marquee 28s linear infinite" }}>
        {doubled.map((b, i) => (
          <span key={i} style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.18em", color: INK3, whiteSpace: "nowrap", flexShrink: 0 }}>{b}</span>
        ))}
      </div>
    </div>
  );
}

// ── How It Works ──────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { n: "01", title: "Sign up in seconds", body: "Create your Shoplux account. No credit card required. Your admin panel is ready immediately." },
    { n: "02", title: "Customize your store", body: "Set your brand colors, upload your logo, add products, configure shipping and payments — all from one panel." },
    { n: "03", title: "Go live", body: "Point your domain, flip the switch. Your store is live on a fully production-grade stack." },
  ];

  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function animate() {
      try {
        const { gsap } = await import("gsap");
        const { ScrollTrigger } = await import("gsap/ScrollTrigger");
        gsap.registerPlugin(ScrollTrigger);
        if (cancelled || !sectionRef.current) return;
        const cards = sectionRef.current.querySelectorAll(".step-card");
        gsap.fromTo(cards, { opacity: 0, y: 40 }, {
          opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
        });
      } catch { /* */ }
    }
    animate();
    return () => { cancelled = true; };
  }, []);

  return (
    <section id="how-it-works" ref={sectionRef} style={{ background: BG, padding: "var(--section-y) 0" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 32px" }}>
        <div style={{ marginBottom: 72, textAlign: "center" }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.18em", color: GOLD, marginBottom: 16 }}>Process</div>
          <h2 style={{ fontFamily: "var(--font-display), Georgia, serif", fontStyle: "italic", fontSize: "clamp(2rem,3.5vw,3rem)", color: INK, margin: 0 }}>Three steps to a live store</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {steps.map((s) => (
            <div key={s.n} className="step-card" style={{ background: SURFACE, border: `1px solid ${LINE}`, borderRadius: 14, padding: "36px 32px", opacity: 0, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(to right, transparent, ${GOLD_BORDER}, transparent)` }} />
              <div style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: 11, color: GOLD, letterSpacing: "0.14em", marginBottom: 20 }}>{s.n}</div>
              <h3 style={{ fontFamily: "var(--font-display), Georgia, serif", fontStyle: "italic", fontSize: 22, color: INK, margin: "0 0 14px", lineHeight: 1.2 }}>{s.title}</h3>
              <p style={{ fontSize: 14, color: INK2, lineHeight: 1.7, margin: 0 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Features ──────────────────────────────────────────────────────────
const FEATURES = [
  { title: "Theme Studio", body: "Live dual-surface theming — retint your storefront and admin independently, instantly, no redeploy required.", tag: "Design" },
  { title: "Full commerce stack", body: "Catalog, cart, checkout, payments, shipping, tax, currency — every feature is included out of the box.", tag: "Platform" },
  { title: "Analytics & Reporting", body: "Revenue, orders, AOV, inventory alerts — a real-time dashboard built for fast decisions.", tag: "Data" },
  { title: "Marketing Suite", body: "Coupons, banners, CMS content blocks. Run campaigns without touching code.", tag: "Growth" },
  { title: "Multi-gateway Payments", body: "Connect Stripe, Razorpay, or any supported gateway. Credentials are encrypted at rest.", tag: "Payments" },
  { title: "Your own deployment", body: "One VPS, one database, one domain. Fully isolated per merchant, never shared infrastructure.", tag: "Infrastructure" },
];

function Features() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function animate() {
      try {
        const { gsap } = await import("gsap");
        const { ScrollTrigger } = await import("gsap/ScrollTrigger");
        gsap.registerPlugin(ScrollTrigger);
        if (cancelled || !gridRef.current) return;
        const cards = gridRef.current.querySelectorAll(".feat-card");
        gsap.fromTo(cards, { opacity: 0, y: 32 }, {
          opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: "power3.out",
          scrollTrigger: { trigger: gridRef.current, start: "top 78%" },
        });
      } catch { /* */ }
    }
    animate();
    return () => { cancelled = true; };
  }, []);

  return (
    <section style={{ background: SURFACE, padding: "var(--section-y) 0", borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}` }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 32px" }}>
        <div style={{ marginBottom: 64, textAlign: "center" }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.18em", color: GOLD, marginBottom: 16 }}>Platform</div>
          <h2 style={{ fontFamily: "var(--font-display), Georgia, serif", fontStyle: "italic", fontSize: "clamp(2rem,3.5vw,3rem)", color: INK, margin: 0 }}>Everything a store needs</h2>
        </div>

        <div ref={gridRef} style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
          {FEATURES.map((f) => (
            <div key={f.title} className="feat-card" style={{ background: BG, padding: "36px 32px", opacity: 0, borderRadius: 2, transition: "background 0.25s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = SURFACE2)}
              onMouseLeave={(e) => (e.currentTarget.style.background = BG)}>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.16em", color: GOLD, marginBottom: 16 }}>{f.tag}</div>
              <h3 style={{ fontFamily: "var(--font-display), Georgia, serif", fontStyle: "italic", fontSize: 20, color: INK, margin: "0 0 12px", lineHeight: 1.2 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: INK2, lineHeight: 1.7, margin: 0 }}>{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Storefront preview — auto-scrolling carousel ──────────────────────
const STORES = [
  { name: "Luna Atelier",  type: "Fashion",          color: "#c8a96e", accent: "#1c1408" },
  { name: "Bloc Market",   type: "Electronics",      color: "#818cf8", accent: "#f8fafc" },
  { name: "Fieldsong",     type: "Food & Lifestyle", color: "#5c8a6e", accent: "#f0faf4" },
  { name: "Kova Studio",   type: "Beauty",           color: "#e8a0a0", accent: "#1a0808" },
  { name: "Thread & Oak",  type: "Apparel",          color: "#a0b8d8", accent: "#0a1020" },
  { name: "Ember & Co",    type: "Home Goods",       color: "#d4a060", accent: "#1c1208" },
];
const DOUBLED = [...STORES, ...STORES];

function StoreCard({ s }: { s: typeof STORES[0] }) {
  return (
    <div style={{ flexShrink: 0, width: 320, background: SURFACE, border: `1px solid ${LINE}`, borderRadius: 16, overflow: "hidden" }}>
      <div style={{ background: SURFACE2, padding: "12px 16px", display: "flex", alignItems: "center", gap: 8, borderBottom: `1px solid ${LINE}` }}>
        {["#ef4444", "#f59e0b", "#22c55e"].map((c) => <div key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />)}
        <div style={{ flex: 1, background: BG, borderRadius: 4, padding: "4px 10px", fontSize: 10, color: INK3, marginLeft: 8 }}>
          {s.name.toLowerCase().replace(/ /g, "")}.myshoplux.com
        </div>
      </div>
      <div style={{ height: 180, background: `linear-gradient(135deg, ${s.color}22, ${BG})`, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
        <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 24, color: s.color }}>{s.name}</div>
        <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.16em", color: INK3 }}>{s.type}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, padding: 1 }}>
        {[1, 2, 3, 4].map((n) => (
          <div key={n} style={{ background: SURFACE2, aspectRatio: "1", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 12 }}>
            <div style={{ height: 8, background: LINE, borderRadius: 4, marginBottom: 5, width: "70%" }} />
            <div style={{ fontSize: 11, color: s.color, fontWeight: 600 }}>${"" + (24 + n * 18)}.00</div>
          </div>
        ))}
      </div>
      <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: INK3 }}>Powered by</span>
        <span style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 14, color: GOLD }}>Shoplux</span>
      </div>
    </div>
  );
}

function StorefrontPreview() {
  const trackRef = useRef<HTMLDivElement>(null);
  const posRef   = useRef(0);
  const rafRef   = useRef<number>(0);
  const pausedRef = useRef(false);
  const SPEED = 0.6; // px per frame

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // We need half-width for the seamless loop reset
    function step() {
      if (!pausedRef.current && track) {
        posRef.current += SPEED;
        const halfW = track.scrollWidth / 2;
        if (posRef.current >= halfW) posRef.current -= halfW;
        track.style.transform = `translateX(-${posRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(step);
    }
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <section style={{ background: BG, padding: "var(--section-y) 0", overflow: "hidden" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 32px", marginBottom: 52 }}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.18em", color: GOLD, marginBottom: 16 }}>White-label</div>
        <h2 style={{ fontFamily: "var(--font-display), Georgia, serif", fontStyle: "italic", fontSize: "clamp(2rem,3.5vw,3rem)", color: INK, margin: 0 }}>
          One platform. Every brand.
        </h2>
      </div>

      {/* Fade edges */}
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 80, background: `linear-gradient(to right, ${BG}, transparent)`, zIndex: 2, pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 80, background: `linear-gradient(to left, ${BG}, transparent)`, zIndex: 2, pointerEvents: "none" }} />

        <div style={{ overflow: "hidden", paddingBottom: 16 }}
          onMouseEnter={() => { pausedRef.current = true; }}
          onMouseLeave={() => { pausedRef.current = false; }}>
          <div ref={trackRef} style={{ display: "flex", gap: 24, width: "max-content", willChange: "transform" }}>
            {DOUBLED.map((s, i) => <StoreCard key={i} s={s} />)}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Testimonial ───────────────────────────────────────────────────────
function Testimonial() {
  const quotes = [
    { q: "We swapped platforms in a weekend. It finally looks like us — not like every other Shopify store.", who: "Founder, Luna Atelier", type: "Fashion" },
    { q: "The theme studio alone justified the switch. We changed our entire brand palette in under ten minutes.", who: "Head of E-commerce, Bloc Market", type: "Electronics" },
    { q: "Setup was shockingly fast. We were live before our old provider even replied to our cancellation email.", who: "Owner, Fieldsong", type: "Food & Lifestyle" },
  ];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % quotes.length), 5000);
    return () => clearInterval(t);
  }, [quotes.length]);

  const q = quotes[idx];

  return (
    <section style={{ background: SURFACE, borderTop: `1px solid ${LINE}`, padding: "var(--section-y) 32px", textAlign: "center" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <div style={{ fontSize: 32, color: GOLD, marginBottom: 24, lineHeight: 1 }}>&ldquo;</div>
        <blockquote key={idx} style={{ fontFamily: "var(--font-display), Georgia, serif", fontStyle: "italic", fontSize: "clamp(1.3rem,2.2vw,1.7rem)", color: INK, lineHeight: 1.4, margin: "0 0 28px", animation: "rise 0.6s ease both" }}>
          {q.q}
        </blockquote>
        <cite style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.14em", color: INK3, fontStyle: "normal" }}>
          {q.who} · {q.type}
        </cite>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 32 }}>
          {quotes.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} style={{ width: i === idx ? 24 : 6, height: 6, borderRadius: 999, border: "none", cursor: "pointer", background: i === idx ? GOLD : LINE, transition: "all 0.3s" }} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Pricing ───────────────────────────────────────────────────────────
function Pricing() {
  const plans = [
    { name: "Starter", price: "Free", sub: "forever", features: ["1 store", "Up to 100 products", "Standard themes", "Email support"], cta: "Get started" },
    { name: "Growth", price: "$49", sub: "per month", features: ["Unlimited products", "All themes + Theme Studio", "Priority support", "Custom domain", "Analytics"], cta: "Start free trial", featured: true },
  ];

  return (
    <section id="pricing" style={{ background: BG, padding: "var(--section-y) 0", borderTop: `1px solid ${LINE}` }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 32px" }}>
        <div style={{ marginBottom: 64, textAlign: "center" }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.18em", color: GOLD, marginBottom: 16 }}>Pricing</div>
          <h2 style={{ fontFamily: "var(--font-display), Georgia, serif", fontStyle: "italic", fontSize: "clamp(2rem,3.5vw,3rem)", color: INK, margin: "0 0 12px" }}>Simple, honest pricing</h2>
          <p style={{ fontSize: 15, color: INK2, margin: 0 }}>Start free. Upgrade when you&apos;re ready.</p>
        </div>

        <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
          {plans.map((p) => (
            <div key={p.name} style={{
              background: p.featured ? SURFACE2 : SURFACE,
              border: p.featured ? `1px solid ${GOLD_BORDER}` : `1px solid ${LINE}`,
              boxShadow: p.featured ? "0 0 0 1px rgba(200,169,110,0.12), 0 20px 60px rgba(0,0,0,0.4)" : undefined,
              borderRadius: 16, padding: "40px 36px", width: 320, position: "relative"
            }}>
              {p.featured && (
                <div style={{ position: "absolute", top: -1, left: 0, right: 0, height: 1, background: `linear-gradient(to right, transparent, ${GOLD}, transparent)` }} />
              )}
              <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.16em", color: p.featured ? GOLD : INK3, marginBottom: 16 }}>{p.name}</div>
              <div style={{ marginBottom: 28 }}>
                <span style={{ fontFamily: "var(--font-display), Georgia, serif", fontStyle: "italic", fontSize: 44, color: INK, lineHeight: 1 }}>{p.price}</span>
                <span style={{ fontSize: 13, color: INK3, marginLeft: 6 }}>{p.sub}</span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 36px", display: "flex", flexDirection: "column", gap: 12 }}>
                {p.features.map((f) => (
                  <li key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: INK2 }}>
                    <span style={{ color: GOLD, fontSize: 12 }}>✦</span>{f}
                  </li>
                ))}
              </ul>
              <Link href="/staff-login" style={{
                display: "block", textAlign: "center", padding: "13px", borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none",
                background: p.featured ? GOLD : "transparent",
                color: p.featured ? "#1c1408" : INK,
                border: p.featured ? "none" : `1px solid ${LINE}`,
                transition: "opacity 0.2s"
              }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Final CTA ─────────────────────────────────────────────────────────
function FinalCTA() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function animate() {
      try {
        const { gsap } = await import("gsap");
        const { ScrollTrigger } = await import("gsap/ScrollTrigger");
        gsap.registerPlugin(ScrollTrigger);
        if (cancelled || !ref.current) return;
        const h = ref.current.querySelector("h2");
        if (h) gsap.fromTo(h, { scale: 0.88, opacity: 0 }, { scale: 1, opacity: 1, duration: 1, ease: "power3.out", scrollTrigger: { trigger: ref.current, start: "top 70%" } });
      } catch { /* */ }
    }
    animate();
    return () => { cancelled = true; };
  }, []);

  return (
    <section ref={ref} style={{ background: SURFACE, borderTop: `1px solid ${LINE}`, padding: "calc(var(--section-y) * 1.4) 32px", textAlign: "center" }}>
      <div style={{ position: "relative", display: "inline-block", marginBottom: 12 }}>
        <div style={{ position: "absolute", inset: "-80px -120px", background: "radial-gradient(ellipse at center, rgba(200,169,110,0.07), transparent 70%)", pointerEvents: "none" }} />
      </div>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.18em", color: GOLD, marginBottom: 20 }}>Ready to launch?</div>
      <h2 style={{ fontFamily: "var(--font-display), Georgia, serif", fontStyle: "italic", fontSize: "clamp(2.4rem,5vw,4.2rem)", color: INK, margin: "0 auto 28px", maxWidth: 680, lineHeight: 1.1 }}>
        Build the store your brand deserves.
      </h2>
      <p style={{ fontSize: 16, color: INK2, margin: "0 auto 44px", maxWidth: 480 }}>
        No templates that look like everyone else&apos;s. No compromises on how your brand looks. Just your vision, on a platform built to carry it.
      </p>
      <Link href="/staff-login" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: GOLD, color: "#1c1408", padding: "16px 36px", borderRadius: 8, fontSize: 16, fontWeight: 700, textDecoration: "none", transition: "transform 0.2s, box-shadow 0.2s" }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(200,169,110,0.35)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
        Start your free store →
      </Link>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ background: BG, borderTop: `1px solid ${LINE}`, padding: "48px 32px" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24 }}>
        <Link href="/" style={{ fontFamily: "var(--font-display), Georgia, serif", fontStyle: "italic", fontSize: 20, color: INK, textDecoration: "none" }}>Shoplux</Link>
        <div style={{ display: "flex", gap: 32 }}>
          {[["Privacy", "#"], ["Terms", "#"], ["Docs", "/docs"], ["Contact", "#"]].map(([l, h]) => (
            <Link key={l} href={h} style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.14em", color: INK3, textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = INK2)}
              onMouseLeave={(e) => (e.currentTarget.style.color = INK3)}>
              {l}
            </Link>
          ))}
        </div>
        <span style={{ fontSize: 11, color: INK3, letterSpacing: "0.04em" }}>© 2026 Shoplux. All rights reserved.</span>
      </div>
    </footer>
  );
}

// ── Page ──────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div style={{ background: BG, color: INK, fontFamily: "var(--font-body), ui-sans-serif, sans-serif" }}>
      <MarketingNav />
      <Hero />
      <LogoBar />
      <HowItWorks />
      <Features />
      <StorefrontPreview />
      <Testimonial />
      <Pricing />
      <FinalCTA />
      <Footer />
    </div>
  );
}
