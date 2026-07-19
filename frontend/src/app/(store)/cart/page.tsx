"use client";

import Link from "next/link";
import { useCartStore, cartSubtotal } from "@/stores/cart-store";
import { formatPrice } from "@/lib/data/products";

export default function CartPage() {
  const { lines, setQuantity, removeLine } = useCartStore();

  if (lines.length === 0) {
    return (
      <section className="mx-auto max-w-6xl px-5 py-24 text-center sm:px-8">
        <p className="font-display text-2xl italic text-ink">Your cart is empty.</p>
        <p className="mt-2 text-[14px] text-ink-soft">Nothing here yet — go find something worth keeping.</p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-full bg-ink px-6 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-bone"
        >
          Shop the collection
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
      <h1 className="font-display text-3xl italic text-ink">Your Cart</h1>

      <div className="mt-8 grid gap-10 md:grid-cols-[1fr_320px]">
        <ul className="divide-y divide-line/70 border-y border-line/70">
          {lines.map((l) => (
            <li key={`${l.slug}-${l.color}-${l.size}`} className="flex gap-5 py-6">
              <div className="size-28 shrink-0 rounded-[var(--radius-md)]" style={{ background: l.tone }} />
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between gap-4">
                  <div>
                    <p className="font-display text-[16px] text-ink">{l.name}</p>
                    <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">
                      {l.color} · {l.size}
                    </p>
                  </div>
                  <p className="font-mono text-[14px] text-ink">{formatPrice(l.price * l.quantity)}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity(l.slug, l.color, l.size, l.quantity - 1)}
                      aria-label="Decrease quantity"
                      className="size-7 rounded-full border border-line font-mono text-[13px] text-ink hover:border-ink"
                    >
                      −
                    </button>
                    <span className="w-5 text-center font-mono text-[13px] text-ink">{l.quantity}</span>
                    <button
                      onClick={() => setQuantity(l.slug, l.color, l.size, l.quantity + 1)}
                      aria-label="Increase quantity"
                      className="size-7 rounded-full border border-line font-mono text-[13px] text-ink hover:border-ink"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeLine(l.slug, l.color, l.size)}
                    className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft hover:text-danger"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="h-fit rounded-[var(--radius-lg)] border border-line/70 bg-surface p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">Order Summary</p>
          <div className="mt-4 flex justify-between text-[14px] text-ink">
            <span>Subtotal</span>
            <span className="font-mono">{formatPrice(cartSubtotal(lines))}</span>
          </div>
          <div className="mt-2 flex justify-between text-[13px] text-ink-soft">
            <span>Shipping</span>
            <span className="font-mono">Calculated at checkout</span>
          </div>
          <Link
            href="/checkout"
            className="mt-6 block w-full rounded-full bg-accent px-5 py-3.5 text-center font-mono text-[12px] uppercase tracking-[0.14em] text-accent-ink transition-opacity hover:opacity-90"
          >
            Proceed to checkout
          </Link>
        </div>
      </div>
    </section>
  );
}
