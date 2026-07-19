"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useCartStore, cartSubtotal } from "@/stores/cart-store";
import { formatPrice } from "@/lib/data/products";
import { PAYMENT_OPTIONS, type PaymentMode } from "@/lib/data/payment-options";

const SHIPPING_METHODS = [
  { id: "standard", label: "Standard", eta: "4–6 business days", price: 0 },
  { id: "express", label: "Express", eta: "1–2 business days", price: 250 },
];

export function CheckoutForm() {
  const router = useRouter();
  const { lines, clear } = useCartStore();
  const [shipping, setShipping] = useState(SHIPPING_METHODS[0].id);
  const [mode, setMode] = useState<PaymentMode["code"]>("upi");
  const [gateway, setGateway] = useState(PAYMENT_OPTIONS.modes[0].gateways[0]);

  const shippingCost = SHIPPING_METHODS.find((m) => m.id === shipping)?.price ?? 0;
  const subtotal = cartSubtotal(lines);
  const total = subtotal + shippingCost;

  const activeMode = useMemo(
    () => PAYMENT_OPTIONS.modes.find((m) => m.code === mode)!,
    [mode],
  );

  function selectMode(m: PaymentMode) {
    setMode(m.code);
    setGateway(m.gateways[0] ?? "");
  }

  function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    const orderId = `ORD-${Math.floor(10000 + Math.random() * 89999)}`;
    clear();
    router.push(`/checkout/confirmation?order=${orderId}`);
  }

  if (lines.length === 0) {
    return (
      <p className="text-[14px] text-ink-soft">
        Your cart is empty — add something before checking out.
      </p>
    );
  }

  return (
    <form onSubmit={placeOrder} className="grid gap-10 md:grid-cols-[1fr_340px]">
      <div className="space-y-10">
        <section>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
            01 · Shipping Address
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <input required placeholder="Full name" className="input-field sm:col-span-2" />
            <input required placeholder="Address line 1" className="input-field sm:col-span-2" />
            <input placeholder="Address line 2 (optional)" className="input-field sm:col-span-2" />
            <input required placeholder="City" className="input-field" />
            <input required placeholder="PIN code" className="input-field" />
            <input required placeholder="Phone number" className="input-field sm:col-span-2" />
          </div>
        </section>

        <section>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
            02 · Shipping Method
          </p>
          <div className="mt-4 space-y-2">
            {SHIPPING_METHODS.map((m) => (
              <label
                key={m.id}
                className="flex cursor-pointer items-center justify-between rounded-[var(--radius-md)] border px-4 py-3.5"
                style={{ borderColor: shipping === m.id ? "var(--ink)" : "var(--line)" }}
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shipping"
                    checked={shipping === m.id}
                    onChange={() => setShipping(m.id)}
                    className="accent-[var(--ink)]"
                  />
                  <span>
                    <span className="block text-[14px] text-ink">{m.label}</span>
                    <span className="block text-[12px] text-ink-soft">{m.eta}</span>
                  </span>
                </span>
                <span className="font-mono text-[13px] text-ink">
                  {m.price === 0 ? "Free" : formatPrice(m.price)}
                </span>
              </label>
            ))}
          </div>
        </section>

        <section>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
            03 · Payment
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {PAYMENT_OPTIONS.modes.map((m) => (
              <button
                key={m.code}
                type="button"
                onClick={() => selectMode(m)}
                className="rounded-full border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors"
                style={{
                  borderColor: mode === m.code ? "var(--ink)" : "var(--line)",
                  background: mode === m.code ? "var(--ink)" : "transparent",
                  color: mode === m.code ? "var(--bone)" : "var(--ink)",
                }}
              >
                {m.label}
              </button>
            ))}
          </div>

          {activeMode.gateways.length > 0 ? (
            <div className="mt-4 space-y-2">
              {activeMode.gateways.map((g) => (
                <label
                  key={g}
                  className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-md)] border px-4 py-3"
                  style={{ borderColor: gateway === g ? "var(--ink)" : "var(--line)" }}
                >
                  <input
                    type="radio"
                    name="gateway"
                    checked={gateway === g}
                    onChange={() => setGateway(g)}
                    className="accent-[var(--ink)]"
                  />
                  <span className="text-[14px] text-ink">{g}</span>
                </label>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-[13px] text-ink-soft">
              Pay in cash when your order is delivered.
            </p>
          )}
        </section>
      </div>

      <div className="h-fit rounded-[var(--radius-lg)] border border-line/70 bg-surface p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">
          {lines.length} item{lines.length > 1 ? "s" : ""}
        </p>
        <ul className="mt-3 space-y-2">
          {lines.map((l) => (
            <li key={`${l.slug}-${l.color}-${l.size}`} className="flex justify-between text-[13px] text-ink-soft">
              <span>
                {l.name} · {l.size} × {l.quantity}
              </span>
              <span className="font-mono text-ink">{formatPrice(l.price * l.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1.5 border-t border-line/70 pt-4">
          <div className="flex justify-between text-[13px] text-ink-soft">
            <span>Subtotal</span>
            <span className="font-mono">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-[13px] text-ink-soft">
            <span>Shipping</span>
            <span className="font-mono">{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</span>
          </div>
          <div className="flex justify-between pt-1.5 text-[15px] text-ink">
            <span>Total</span>
            <span className="font-mono">{formatPrice(total)}</span>
          </div>
        </div>
        <button
          type="submit"
          className="mt-6 w-full rounded-full bg-accent px-5 py-3.5 font-mono text-[12px] uppercase tracking-[0.14em] text-accent-ink transition-opacity hover:opacity-90"
        >
          Place order
        </button>
      </div>
    </form>
  );
}
