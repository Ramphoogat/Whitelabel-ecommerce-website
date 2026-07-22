"use client";

import { useEffect } from "react";

export function Modal({
  title,
  open,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/25 backdrop-blur-[2px]" />
      <div className={`animate-rise relative w-full rounded-[var(--radius-lg)] border border-line/70 bg-surface p-6 ${wide ? "max-w-4xl" : "max-w-md"}`} style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.18)" }}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-medium text-ink">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft hover:text-ink"
          >
            ✕
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
