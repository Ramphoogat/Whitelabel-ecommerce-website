"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { loginStaff } from "@/lib/api/admin.api";
import { ApiError } from "@/lib/api/client";
import { useStaffStore } from "@/stores/staff-store";

export default function StaffLoginPage() {
  const router = useRouter();
  const setSession = useStaffStore((s) => s.setSession);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: loginStaff,
    onSuccess: (data) => {
      setSession(data);
      router.push("/admin");
    },
  });

  return (
    <div className="glass rounded-[var(--radius-lg)] p-8">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">Merchant Console</p>
      <h1 className="mt-1 font-display text-2xl font-medium text-ink">Staff sign in</h1>
      <p className="mt-1 text-[13px] text-ink-soft">
        For store owners and staff. Customers sign in from the storefront.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate({ email, password });
        }}
        className="mt-7 space-y-4"
      >
        <div>
          <label htmlFor="email" className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field mt-1.5"
            placeholder="owner@mystore.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field mt-1.5"
            placeholder="••••••••"
          />
        </div>

        {mutation.isError && (
          <p className="text-[13px] text-danger">
            {mutation.error instanceof ApiError
              ? mutation.error.message
              : "Couldn't reach the API — is the backend running?"}
          </p>
        )}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="glow-accent w-full rounded-full bg-accent px-5 py-3 font-mono text-[12px] uppercase tracking-[0.14em] text-accent-ink transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {mutation.isPending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setSession({
            accessToken: "demo",
            refreshToken: "demo",
            user: { id: "demo", email: "demo@store.local", name: "Demo", role: "demo" },
          });
          router.push("/admin");
        }}
        className="mt-4 w-full rounded-full border border-line px-5 py-3 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-soft transition-colors hover:border-accent hover:text-ink"
      >
        Explore in demo mode
      </button>
    </div>
  );
}
