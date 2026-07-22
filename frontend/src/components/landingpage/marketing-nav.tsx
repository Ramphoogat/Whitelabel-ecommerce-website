"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GOLD, GOLD_BORDER, LINE, INK, INK2, INK3 } from "./tokens";

const NAV_LINKS = [
  { label: "Platform", href: "/platform" },
  { label: "Pricing",  href: "/pricing"  },
  { label: "Themes",   href: "/themes"   },
  { label: "Docs",     href: "/docs"     },
];

export function MarketingNav({ solid = false }: { solid?: boolean }) {
  const [scrolled, setScrolled] = useState(solid);

  useEffect(() => {
    if (solid) return;
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [solid]);

  return (
    <header
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 50,
        transition: "background 0.4s ease, border-color 0.4s ease, backdrop-filter 0.4s ease",
        background: scrolled ? "rgba(8,8,16,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? `1px solid ${LINE}` : "1px solid transparent",
      }}
    >
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 32px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ fontFamily: "var(--font-display), Georgia, serif", fontStyle: "italic", fontSize: 22, color: INK, letterSpacing: "-0.01em", textDecoration: "none" }}>
          Shoplux
        </Link>

        <nav style={{ display: "flex", gap: 36, alignItems: "center" }}>
          {NAV_LINKS.map((n) => (
            <Link key={n.label} href={n.href}
              style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.14em", color: INK2, textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = INK)}
              onMouseLeave={(e) => (e.currentTarget.style.color = INK2)}>
              {n.label}
            </Link>
          ))}
        </nav>

        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/staff-login"
            style={{ fontSize: 13, color: INK2, textDecoration: "none", padding: "8px 16px", borderRadius: 6, transition: "color 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = INK)}
            onMouseLeave={(e) => (e.currentTarget.style.color = INK2)}>
            Sign in
          </Link>
          <Link href="/staff-login"
            style={{ fontSize: 13, background: GOLD, color: "#1c1408", padding: "9px 20px", borderRadius: 6, textDecoration: "none", fontWeight: 600, letterSpacing: "0.01em", transition: "opacity 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>
            Start free →
          </Link>
        </div>
      </div>
    </header>
  );
}
