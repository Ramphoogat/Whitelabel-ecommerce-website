"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { loginCustomer } from "@/lib/api/auth.api";
import { ApiError } from "@/lib/api/client";
import { useAuthStore } from "@/stores/auth-store";

export function LoginForm() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: loginCustomer,
    onSuccess: (data) => {
      setSession(data);
      router.push("/account");
    },
  });

  return (
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
          placeholder="you@example.com"
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
          {mutation.error instanceof ApiError ? mutation.error.message : "Something went wrong. Try again."}
        </p>
      )}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full rounded-full bg-ink px-5 py-3 font-mono text-[12px] uppercase tracking-[0.14em] text-bone transition-opacity hover:opacity-85 disabled:opacity-50"
      >
        {mutation.isPending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
