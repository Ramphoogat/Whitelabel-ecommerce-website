import Link from "next/link";

export default async function CheckoutConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;

  return (
    <section className="mx-auto max-w-md px-5 py-24 text-center sm:px-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent">Order confirmed</p>
      <h1 className="mt-3 font-display text-3xl italic text-ink">Thank you.</h1>
      <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
        Your order{" "}
        <span className="font-mono text-ink">{order ?? "—"}</span> is being
        prepared. A confirmation has been sent to your email.
      </p>
      <Link
        href="/products"
        className="mt-8 inline-block rounded-full bg-ink px-6 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-bone"
      >
        Continue shopping
      </Link>
    </section>
  );
}
