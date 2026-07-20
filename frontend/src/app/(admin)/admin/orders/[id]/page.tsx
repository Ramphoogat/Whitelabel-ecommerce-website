"use client";

import { use } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminOrderDetail } from "@/hooks/use-admin-data";
import { updateOrderStatus } from "@/lib/api/admin.api";
import { AdminTopbar } from "@/components/admin/topbar";
import { toast } from "@/stores/toast-store";
import { formatPrice } from "@/lib/data/products";
import { STATUS_STYLES, type OrderStatus } from "@/lib/data/admin";

const TRANSITIONS: Record<string, string[]> = {
  pending:    ["processing", "cancelled"],
  processing: ["shipped",    "cancelled"],
  shipped:    ["delivered"],
  delivered:  [],
  cancelled:  [],
};

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const qc = useQueryClient();
  const { data: order, isLoading, isError } = useAdminOrderDetail(id);

  const statusMutation = useMutation({
    mutationFn: (status: string) => updateOrderStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-order", id] });
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Order status updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <>
        <AdminTopbar title="Order" />
        <div className="px-6 py-8">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-[var(--radius-lg)] bg-line/40"
              />
            ))}
          </div>
        </div>
      </>
    );
  }

  if (isError || !order) {
    return (
      <>
        <AdminTopbar title="Order" />
        <div className="px-6 py-8">
          <p className="text-[14px] text-danger">
            Order not found or backend unavailable.{" "}
            <Link href="/admin/orders" className="underline">
              ← Back to orders
            </Link>
          </p>
        </div>
      </>
    );
  }

  const status = order.status as OrderStatus;
  const nextStatuses = TRANSITIONS[status] ?? [];
  const subtotal = order.subtotalCents ?? order.totalCents;
  const tax = order.taxCents ?? 0;
  const discount = order.discountCents ?? 0;

  return (
    <>
      <AdminTopbar title={`Order ${order.orderNumber}`} />
      <div className="px-6 py-8">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Link
            href="/admin/orders"
            className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft hover:text-ink"
          >
            ← Orders
          </Link>
          <span className="text-line">/</span>
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink">
            {order.orderNumber}
          </span>
          <span
            className={`ml-auto rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.08em] ${STATUS_STYLES[status] ?? "bg-line-soft text-ink-soft"}`}
          >
            {status}
          </span>
          {nextStatuses.length > 0 && (
            <div className="flex gap-2">
              {nextStatuses.map((s) => (
                <button
                  key={s}
                  disabled={statusMutation.isPending}
                  onClick={() => statusMutation.mutate(s)}
                  className="rounded-full border border-line px-3 py-1 font-mono text-[11px] uppercase tracking-[0.08em] text-ink transition-colors hover:border-ink disabled:opacity-50"
                >
                  → {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Line items */}
          <div className="space-y-6">
            <section className="rounded-[var(--radius-lg)] border border-line/70 bg-surface">
              <p className="border-b border-line/70 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">
                Items ({order.items?.length ?? 0})
              </p>
              <table className="w-full text-[13px]">
                <tbody>
                  {(order.items ?? []).map((item, i) => (
                    <tr key={i} className="border-b border-line/50 last:border-0">
                      <td className="px-5 py-3">
                        <p className="text-ink">{item.title ?? "—"}</p>
                        <p className="font-mono text-[11px] text-ink-soft">{item.sku ?? item.variantId}</p>
                      </td>
                      <td className="px-5 py-3 text-center font-mono text-ink-soft">
                        × {item.quantity}
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-ink">
                        {formatPrice((item.unitPriceCents ?? 0) * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* Shipping address */}
            {order.shippingAddress && (
              <section className="rounded-[var(--radius-lg)] border border-line/70 bg-surface p-5">
                <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">
                  Shipping address
                </p>
                <div className="space-y-0.5 text-[13px] text-ink">
                  {order.shippingAddress.fullName && <p>{order.shippingAddress.fullName}</p>}
                  {order.shippingAddress.line1 && <p>{order.shippingAddress.line1}</p>}
                  <p>
                    {[order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.postalCode]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  {order.shippingAddress.country && (
                    <p className="text-ink-soft">{order.shippingAddress.country}</p>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* Summary sidebar */}
          <div className="space-y-6">
            <section className="rounded-[var(--radius-lg)] border border-line/70 bg-surface p-5">
              <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">
                Summary
              </p>
              <div className="space-y-2 text-[13px]">
                <div className="flex justify-between text-ink-soft">
                  <span>Subtotal</span>
                  <span className="font-mono">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Discount</span>
                    <span className="font-mono">−{formatPrice(discount)}</span>
                  </div>
                )}
                {tax > 0 && (
                  <div className="flex justify-between text-ink-soft">
                    <span>Tax</span>
                    <span className="font-mono">{formatPrice(tax)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-line/70 pt-2 text-[15px] text-ink">
                  <span>Total</span>
                  <span className="font-mono">{formatPrice(order.totalCents)}</span>
                </div>
              </div>
            </section>

            <section className="rounded-[var(--radius-lg)] border border-line/70 bg-surface p-5">
              <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">
                Customer
              </p>
              <p className="text-[13px] text-ink">{order.contactEmail ?? "Guest"}</p>
              <p className="mt-1 font-mono text-[11px] text-ink-soft">
                Placed {new Date(order.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
              </p>
            </section>

            <a
              href={`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"}/admin/orders/${id}/invoice`}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-full border border-line px-5 py-2.5 text-center font-mono text-[11px] uppercase tracking-[0.1em] text-ink transition-colors hover:border-ink"
            >
              Download invoice
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
