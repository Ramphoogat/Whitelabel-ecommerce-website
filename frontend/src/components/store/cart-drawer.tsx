"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCartStore, cartSubtotal } from "@/stores/cart-store";
import { formatPrice } from "@/lib/data/products";

export function CartDrawer() {
  const { lines, isOpen, close, setQuantity } = useCartStore();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [close]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="Close cart"
        onClick={close}
        className="absolute inset-0 bg-ink/30 backdrop-blur-[1px]"
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-line/70 px-6 py-5">
          <h2 className="font-display text-lg italic text-ink">Your Cart</h2>
          <button
            onClick={close}
            aria-label="Close cart"
            className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft hover:text-ink"
          >
            Close ✕
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <p className="text-[14px] text-ink-soft">Your cart is empty.</p>
            <Link
              href="/products"
              onClick={close}
              className="mt-4 rounded-full bg-ink px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-bone"
            >
              Shop the collection
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <ul className="space-y-5">
                {lines.map((l) => (
                  <li key={`${l.slug}-${l.color}-${l.size}`} className="flex gap-4">
                    <div
                      className="size-20 shrink-0 rounded-[var(--radius-md)]"
                      style={{ background: l.tone }}
                    />
                    <div className="flex-1">
                      <p className="font-display text-[15px] text-ink">{l.name}</p>
                      <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">
                        {l.color} · {l.size}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setQuantity(l.slug, l.color, l.size, l.quantity - 1)}
                            aria-label="Decrease quantity"
                            className="size-6 rounded-full border border-line font-mono text-[12px] text-ink hover:border-ink"
                          >
                            −
                          </button>
                          <span className="w-4 text-center font-mono text-[12px] text-ink">
                            {l.quantity}
                          </span>
                          <button
                            onClick={() => setQuantity(l.slug, l.color, l.size, l.quantity + 1)}
                            aria-label="Increase quantity"
                            className="size-6 rounded-full border border-line font-mono text-[12px] text-ink hover:border-ink"
                          >
                            +
                          </button>
                        </div>
                        <p className="font-mono text-[13px] text-ink">
                          {formatPrice(l.price * l.quantity)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-line/70 px-6 py-5">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">
                  Subtotal
                </span>
                <span className="font-mono text-[15px] text-ink">
                  {formatPrice(cartSubtotal(lines))}
                </span>
              </div>
              <Link
                href="/checkout"
                onClick={close}
                className="mt-4 block w-full rounded-full bg-accent px-5 py-3.5 text-center font-mono text-[12px] uppercase tracking-[0.14em] text-accent-ink transition-opacity hover:opacity-90"
              >
                Checkout
              </Link>
              <Link
                href="/cart"
                onClick={close}
                className="mt-2 block w-full rounded-full border border-line px-5 py-3 text-center font-mono text-[12px] uppercase tracking-[0.14em] text-ink transition-colors hover:border-ink"
              >
                View cart
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
