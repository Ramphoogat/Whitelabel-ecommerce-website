import { CheckoutForm } from "@/components/store/checkout-form";

export default function CheckoutPage() {
  return (
    <section className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
      <h1 className="font-display text-3xl italic text-ink">Checkout</h1>
      <div className="mt-8">
        <CheckoutForm />
      </div>
    </section>
  );
}
