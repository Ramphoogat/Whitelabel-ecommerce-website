import Link from "next/link";
import { LoginForm } from "@/components/store/login-form";

export default function LoginPage() {
  return (
    <div className="rounded-[var(--radius-lg)] border border-line/70 bg-surface p-8">
      <h1 className="font-display text-2xl italic text-ink">Welcome back</h1>
      <p className="mt-1 text-[13px] text-ink-soft">Sign in to track orders and manage your account.</p>

      <LoginForm />

      <p className="mt-7 text-center text-[13px] text-ink-soft">
        New here?{" "}
        <Link href="/register" className="text-accent hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
