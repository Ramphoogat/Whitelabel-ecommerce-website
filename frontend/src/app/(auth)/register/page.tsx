import Link from "next/link";
import { RegisterForm } from "@/components/store/register-form";

export default function RegisterPage() {
  return (
    <div className="rounded-[var(--radius-lg)] border border-line/70 bg-surface p-8">
      <h1 className="font-display text-2xl italic text-ink">Create an account</h1>
      <p className="mt-1 text-[13px] text-ink-soft">Save addresses, track orders, and build a wishlist.</p>

      <RegisterForm />

      <p className="mt-7 text-center text-[13px] text-ink-soft">
        Already have an account?{" "}
        <Link href="/login" className="text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
