"use client";

import { useState } from "react";
import Link from "next/link";
import { useCartStore, cartSubtotal } from "@/stores/cart-store";
import { formatPrice } from "@/lib/data/products";
import { COUPONS, type Coupon } from "@/lib/data/admin-marketing";

const TAX_RATE = 0.18; // 18% GST

function applyCoupon(code: string): { coupon: Coupon; error: null } | { coupon: null; error: string } {
  const match = COUPONS.find((c) => c.code === code.trim().toUpperCase());
  if (!match) return { coupon: null, error: "Coupon not found." };
  if (!match.active) return { coupon: null, error: "This coupon is no longer active." };
  if (match.usage >= match.limit) return { coupon: null, error: "This coupon has reached its usage limit." };
  const today = new Date().toISOString().slice(0, 10);
  if (match.expires !== "—" && match.expires < today) return { coupon: null, error: "This coupon has expired." };
  return { coupon: match, error: null };
}

function discountAmount(subtotal: number, coupon: Coupon): number {
  if (coupon.type === "percentage") return Math.round(subtotal * (coupon.value / 100));
  return Math.min(coupon.value * 100, subtotal); // flat in paise
}

export default function CartPage() {
  const { lines, setQuantity, removeLine } = useCartStore();
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState("");

  function handleApply() {
    const result = applyCoupon(couponInput);
    if (result.error) {
      setCouponError(result.error);
      setAppliedCoupon(null);
    } else {
      setAppliedCoupon(result.coupon);
      setCouponError("");
      setCouponInput("");
    }
  }

  function removeApplied() {
    setAppliedCoupon(null);
    setCouponError("");
  }

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

  const subtotal = cartSubtotal(lines);
  const discount = appliedCoupon ? discountAmount(subtotal, appliedCoupon) : 0;
  const taxable = subtotal - discount;
  const tax = Math.round(taxable * TAX_RATE);
  const total = taxable + tax;

  return (
    <section className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
      <h1 className="font-display text-3xl italic text-ink">Your Cart</h1>

      <div className="mt-8 grid gap-10 md:grid-cols-[1fr_320px]">
        {/* ── Line items ── */}
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

        {/* ── Order summary ── */}
        <div className="h-fit space-y-4">

          {/* Coupon input */}
          <div className="rounded-[var(--radius-lg)] border border-line/70 bg-surface p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">Coupon Code</p>

            {appliedCoupon ? (
              <div className="mt-3 flex items-center justify-between rounded-[var(--radius-sm)] border border-success/30 bg-success/8 px-4 py-2.5">
                <div>
                  <span className="font-mono text-[12px] font-medium text-success">{appliedCoupon.code}</span>
                  <span className="ml-2 font-mono text-[11px] text-success/70">
                    {appliedCoupon.type === "percentage"
                      ? `−${appliedCoupon.value}% applied`
                      : `−₹${appliedCoupon.value} applied`}
                  </span>
                </div>
                <button
                  onClick={removeApplied}
                  aria-label="Remove coupon"
                  className="ml-3 font-mono text-[10px] uppercase tracking-[0.08em] text-success/60 hover:text-danger"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="mt-3">
                <div className="flex gap-2">
                  <input
                    value={couponInput}
                    onChange={(e) => { setCouponInput(e.target.value); setCouponError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleApply()}
                    placeholder="Enter code"
                    className="input-field flex-1 font-mono uppercase"
                    style={{ fontSize: "12px", letterSpacing: "0.08em" }}
                  />
                  <button
                    onClick={handleApply}
                    disabled={!couponInput.trim()}
                    className="rounded-full bg-ink px-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-bone transition-opacity hover:opacity-80 disabled:opacity-30"
                  >
                    Apply
                  </button>
                </div>
                {couponError && (
                  <p className="mt-1.5 font-mono text-[11px] text-danger">{couponError}</p>
                )}
              </div>
            )}
          </div>

          {/* Price breakdown */}
          <div className="rounded-[var(--radius-lg)] border border-line/70 bg-surface p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">Order Summary</p>

            <div className="mt-4 space-y-2.5 text-[14px]">
              <div className="flex justify-between text-ink">
                <span>Subtotal</span>
                <span className="font-mono">{formatPrice(subtotal)}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-success">
                  <span className="flex items-center gap-1.5">
                    Discount
                    <span className="rounded-full bg-success/10 px-2 py-0.5 font-mono text-[10px] uppercase">
                      {appliedCoupon.code}
                    </span>
                  </span>
                  <span className="font-mono">−{formatPrice(discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-ink-soft">
                <span>GST (18%)</span>
                <span className="font-mono">{formatPrice(tax)}</span>
              </div>

              <div className="flex justify-between text-ink-soft">
                <span>Shipping</span>
                <span className="font-mono text-[12px]">At checkout</span>
              </div>
            </div>

            <div className="mt-4 border-t border-line/60 pt-4">
              <div className="flex justify-between">
                <span className="font-display text-[17px] text-ink">Total</span>
                <span className="font-mono text-[17px] font-medium text-ink">{formatPrice(total)}</span>
              </div>
              {appliedCoupon && (
                <p className="mt-1 font-mono text-[10px] text-success/70">
                  You save {formatPrice(discount)} with {appliedCoupon.code}
                </p>
              )}
            </div>

            <Link
              href="/checkout"
              className="mt-5 block w-full rounded-full bg-accent px-5 py-3.5 text-center font-mono text-[12px] uppercase tracking-[0.14em] text-accent-ink transition-opacity hover:opacity-90"
            >
              Proceed to checkout
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
