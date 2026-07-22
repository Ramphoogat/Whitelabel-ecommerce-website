"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useCartStore, cartSubtotal } from "@/stores/cart-store";
import { formatPrice } from "@/lib/data/products";
import { PAYMENT_OPTIONS, type PaymentMode } from "@/lib/data/payment-options";
import { COUPONS, type Coupon } from "@/lib/data/admin-marketing";

const SHIPPING_METHODS = [
  { id: "standard", label: "Standard", eta: "4–6 business days", price: 0 },
  { id: "express", label: "Express", eta: "1–2 business days", price: 250 },
];

const TAX_RATE = 0.18;

const TODAY = new Date().toISOString().slice(0, 10);

function couponStatus(c: Coupon): "valid" | "inactive" | "expired" | "exhausted" {
  if (!c.active) return "inactive";
  if (c.expires !== "—" && c.expires < TODAY) return "expired";
  if (c.usage >= c.limit) return "exhausted";
  return "valid";
}

function discountAmount(subtotal: number, coupon: Coupon): number {
  if (coupon.type === "percentage") return Math.round(subtotal * (coupon.value / 100));
  return Math.min(coupon.value * 100, subtotal);
}

export function CheckoutForm() {
  const router = useRouter();
  const { lines, clear } = useCartStore();
  const [shipping, setShipping] = useState(SHIPPING_METHODS[0].id);
  const [mode, setMode] = useState<PaymentMode["code"]>("upi");
  const [gateway, setGateway] = useState(PAYMENT_OPTIONS.modes[0].gateways[0]);

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState("");

  const shippingCost = SHIPPING_METHODS.find((m) => m.id === shipping)?.price ?? 0;
  const subtotal = cartSubtotal(lines);
  const discount = appliedCoupon ? discountAmount(subtotal, appliedCoupon) : 0;
  const taxable = subtotal - discount + shippingCost;
  const tax = Math.round(taxable * TAX_RATE);
  const total = taxable + tax;

  const activeMode = useMemo(
    () => PAYMENT_OPTIONS.modes.find((m) => m.code === mode)!,
    [mode],
  );

  function selectMode(m: PaymentMode) {
    setMode(m.code);
    setGateway(m.gateways[0] ?? "");
  }

  function tryApply(code: string) {
    const match = COUPONS.find((c) => c.code === code.trim().toUpperCase());
    if (!match) { setCouponError("Coupon not found."); return; }
    const status = couponStatus(match);
    if (status === "inactive") { setCouponError("This coupon is no longer active."); return; }
    if (status === "expired") { setCouponError("This coupon has expired."); return; }
    if (status === "exhausted") { setCouponError("This coupon has reached its usage limit."); return; }
    setAppliedCoupon(match);
    setCouponError("");
    setCouponInput("");
  }

  function removeApplied() {
    setAppliedCoupon(null);
    setCouponError("");
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

        {/* 01 · Shipping Address */}
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

        {/* 02 · Shipping Method */}
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

        {/* 03 · Payment */}
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

        {/* 04 · Coupon */}
        <section>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
            04 · Coupon
          </p>

          {/* Applied coupon chip */}
          {appliedCoupon ? (
            <div className="mt-4 flex items-center justify-between rounded-[var(--radius-md)] border border-success/40 bg-success/8 px-4 py-3">
              <div>
                <span className="font-mono text-[13px] font-medium text-success">{appliedCoupon.code}</span>
                <span className="ml-2 font-mono text-[11px] text-success/70">
                  {appliedCoupon.type === "percentage"
                    ? `${appliedCoupon.value}% off applied`
                    : `₹${appliedCoupon.value} off applied`}
                </span>
              </div>
              <button
                type="button"
                onClick={removeApplied}
                className="ml-4 font-mono text-[11px] text-success/60 hover:text-danger"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="mt-4">
              <div className="flex gap-2">
                <input
                  value={couponInput}
                  onChange={(e) => { setCouponInput(e.target.value); setCouponError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), tryApply(couponInput))}
                  placeholder="Enter coupon code"
                  className="input-field flex-1 font-mono uppercase"
                  style={{ fontSize: "12px", letterSpacing: "0.08em" }}
                />
                <button
                  type="button"
                  onClick={() => tryApply(couponInput)}
                  disabled={!couponInput.trim()}
                  className="rounded-full bg-ink px-5 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-bone transition-opacity hover:opacity-80 disabled:opacity-30"
                >
                  Apply
                </button>
              </div>
              {couponError && (
                <p className="mt-1.5 font-mono text-[11px] text-danger">{couponError}</p>
              )}
            </div>
          )}

          {/* Available coupons list */}
          <div className="mt-5 space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft/60">
              Available offers
            </p>
            {COUPONS.map((c) => {
              const status = couponStatus(c);
              const valid = status === "valid";
              return (
                <div
                  key={c.code}
                  className="flex items-start justify-between gap-4 rounded-[var(--radius-md)] border px-4 py-3"
                  style={{
                    borderColor: valid ? "var(--line)" : "var(--line)",
                    opacity: valid ? 1 : 0.5,
                  }}
                >
                  <div className="flex items-start gap-3">
                    {/* Dashed code box */}
                    <span
                      className="mt-0.5 shrink-0 rounded border border-dashed px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.08em]"
                      style={{
                        borderColor: valid ? "var(--accent)" : "var(--line)",
                        color: valid ? "var(--accent)" : "var(--ink-soft)",
                        background: valid ? "color-mix(in srgb, var(--accent) 8%, transparent)" : "transparent",
                      }}
                    >
                      {c.code}
                    </span>
                    <div>
                      <p className="text-[13px] text-ink">
                        {c.type === "percentage"
                          ? `${c.value}% off on your order`
                          : `Flat ₹${c.value} off on your order`}
                      </p>
                      {!valid && (
                        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-danger/70">
                          {status === "expired" ? "Expired" : status === "exhausted" ? "Limit reached" : "Not available"}
                        </p>
                      )}
                      {valid && c.expires !== "—" && (
                        <p className="mt-0.5 font-mono text-[10px] text-ink-soft/60">
                          Valid until {c.expires}
                        </p>
                      )}
                    </div>
                  </div>
                  {valid && !appliedCoupon && (
                    <button
                      type="button"
                      onClick={() => tryApply(c.code)}
                      className="shrink-0 rounded-full border border-accent px-3 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-accent transition-colors hover:bg-accent hover:text-accent-ink"
                    >
                      Apply
                    </button>
                  )}
                  {appliedCoupon?.code === c.code && (
                    <span className="shrink-0 rounded-full bg-success/15 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-success">
                      Applied
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Order Summary sidebar */}
      <div className="h-fit rounded-[var(--radius-lg)] border border-line/70 bg-surface p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">
          {lines.length} item{lines.length > 1 ? "s" : ""}
        </p>
        <ul className="mt-3 space-y-2">
          {lines.map((l) => (
            <li key={`${l.slug}-${l.color}-${l.size}`} className="flex justify-between gap-3 text-[13px] text-ink-soft">
              <span className="min-w-0 truncate">
                {l.name} · {l.size} × {l.quantity}
              </span>
              <span className="shrink-0 font-mono text-ink">{formatPrice(l.price * l.quantity)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 space-y-2 border-t border-line/70 pt-4 text-[13px]">
          <div className="flex justify-between text-ink-soft">
            <span>Subtotal</span>
            <span className="font-mono">{formatPrice(subtotal)}</span>
          </div>

          {appliedCoupon && (
            <div className="flex justify-between text-success">
              <span className="flex items-center gap-1.5">
                Discount
                <span className="rounded-full bg-success/10 px-1.5 py-0.5 font-mono text-[9px] uppercase">
                  {appliedCoupon.code}
                </span>
              </span>
              <span className="font-mono">−{formatPrice(discount)}</span>
            </div>
          )}

          <div className="flex justify-between text-ink-soft">
            <span>Shipping</span>
            <span className="font-mono">{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</span>
          </div>

          <div className="flex justify-between text-ink-soft">
            <span>GST (18%)</span>
            <span className="font-mono">{formatPrice(tax)}</span>
          </div>
        </div>

        <div className="mt-3 border-t border-line/70 pt-3">
          <div className="flex justify-between text-[15px] text-ink">
            <span>Total</span>
            <span className="font-mono font-medium">{formatPrice(total)}</span>
          </div>
          {appliedCoupon && (
            <p className="mt-1 font-mono text-[10px] text-success/70">
              You save {formatPrice(discount)} with {appliedCoupon.code}
            </p>
          )}
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
