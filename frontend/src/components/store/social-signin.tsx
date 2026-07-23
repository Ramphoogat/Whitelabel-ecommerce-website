"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { socialLoginCustomer, type SocialProvider } from "@/lib/api/auth.api";
import { ApiError } from "@/lib/api/client";
import { useAuthStore } from "@/stores/auth-store";

const PROVIDERS: { key: SocialProvider; label: string; mark: string; color: string }[] = [
  { key: "google", label: "Google", mark: "G", color: "#4285F4" },
  { key: "facebook", label: "Facebook", mark: "f", color: "#1877F2" },
  { key: "apple", label: "Apple", mark: "", color: "var(--ink)" },
];

/**
 * Third-party sign-in for customers. Clicking a provider opens a small
 * consent step (standing in for the provider's OAuth screen) that asks for
 * the profile the provider would return, then signs in via
 * /auth/customer/social — the provider is recorded on the account and shows
 * in Admin → Customers as "joined via".
 */
export function SocialSignIn() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [active, setActive] = useState<SocialProvider | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const mutation = useMutation({
    mutationFn: socialLoginCustomer,
    onSuccess: (data) => {
      setSession(data);
      router.push("/account");
    },
  });

  const provider = PROVIDERS.find((p) => p.key === active);

  return (
    <div className="mt-6">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-line" />
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
          or continue with
        </span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {PROVIDERS.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => { mutation.reset(); setActive(active === p.key ? null : p.key); }}
            aria-pressed={active === p.key}
            className="flex items-center justify-center gap-2 rounded-full border px-3 py-2.5 text-[13px] text-ink transition-colors hover:border-accent"
            style={{ borderColor: active === p.key ? "var(--accent)" : "var(--line)" }}
          >
            <span className="font-bold" style={{ color: p.color }}>{p.mark}</span>
            {p.label}
          </button>
        ))}
      </div>

      {provider && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate({ provider: provider.key, email, name });
          }}
          className="mt-4 space-y-3 rounded-[var(--radius-md)] border border-line/70 p-4"
          style={{ background: "var(--surface)" }}
        >
          <p className="text-[12px] leading-relaxed text-ink-soft">
            Continue with your {provider.label} account — we&apos;ll use the email and name your
            provider shares.
          </p>
          <input
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={`you@${provider.key === "google" ? "gmail.com" : "example.com"}`}
            className="input-field text-[13px]"
            aria-label={`${provider.label} email`}
          />
          <input
            required
            minLength={2}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="input-field text-[13px]"
            aria-label={`${provider.label} display name`}
          />
          {mutation.isError && (
            <p className="text-[12px] text-danger">
              {mutation.error instanceof ApiError ? mutation.error.message : "Sign-in failed. Try again."}
            </p>
          )}
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full rounded-full bg-ink px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-bone transition-opacity hover:opacity-85 disabled:opacity-50"
          >
            {mutation.isPending ? "Signing in…" : `Continue with ${provider.label}`}
          </button>
        </form>
      )}
    </div>
  );
}
