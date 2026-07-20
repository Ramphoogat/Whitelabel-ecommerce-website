"use client";

import { useToastStore } from "@/stores/toast-store";

const ICONS = { success: "✓", error: "✕", info: "·" };
const COLORS = {
  success: { bg: "var(--success)", text: "white" },
  error: { bg: "var(--danger)", text: "white" },
  info: { bg: "var(--ink)", text: "var(--bone)" },
};

export function Toaster() {
  const { toasts, remove } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className="flex items-center gap-3 rounded-[var(--radius-md)] px-4 py-3 text-[13px] shadow-lg"
          style={{ background: COLORS[t.kind].bg, color: COLORS[t.kind].text, minWidth: 240 }}
        >
          <span className="font-mono text-[11px] opacity-80">{ICONS[t.kind]}</span>
          <span className="flex-1">{t.message}</span>
          <button
            aria-label="Dismiss"
            onClick={() => remove(t.id)}
            className="ml-2 opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
