"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getCustomerProfile, listAddresses, logoutCustomer } from "@/lib/api/auth.api";
import { useAuthStore } from "@/stores/auth-store";

export default function AccountPage() {
  const router = useRouter();
  const { accessToken, refreshToken, customer, clearSession } = useAuthStore();

  useEffect(() => {
    if (!accessToken) router.replace("/login");
  }, [accessToken, router]);

  const profileQuery = useQuery({
    queryKey: ["customer-profile"],
    queryFn: getCustomerProfile,
    enabled: Boolean(accessToken),
  });

  const addressesQuery = useQuery({
    queryKey: ["customer-addresses"],
    queryFn: listAddresses,
    enabled: Boolean(accessToken),
  });

  if (!accessToken) return null;

  async function handleLogout() {
    if (refreshToken) await logoutCustomer(refreshToken).catch(() => {});
    clearSession();
    router.push("/");
  }

  return (
    <section className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
      <div className="flex items-baseline justify-between">
        <h1 className="font-display text-3xl italic text-ink">
          Hi, {customer?.name.split(" ")[0]}
        </h1>
        <button
          onClick={handleLogout}
          className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft hover:text-ink"
        >
          Sign out
        </button>
      </div>

      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        <div className="rounded-[var(--radius-lg)] border border-line/70 bg-surface p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">Profile</p>
          {profileQuery.isLoading && <p className="mt-3 text-[13px] text-ink-soft">Loading…</p>}
          {profileQuery.isError && (
            <p className="mt-3 text-[13px] text-danger">
              Couldn&apos;t reach the API — is the backend running on localhost:4000?
            </p>
          )}
          {profileQuery.data && (
            <div className="mt-3 space-y-1 text-[14px] text-ink">
              <p>{profileQuery.data.name}</p>
              <p className="text-ink-soft">{profileQuery.data.email}</p>
              <p className="text-ink-soft">{profileQuery.data.phone ?? "No phone on file"}</p>
            </div>
          )}
        </div>

        <div className="rounded-[var(--radius-lg)] border border-line/70 bg-surface p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">
            Addresses ({addressesQuery.data?.length ?? 0})
          </p>
          {addressesQuery.isLoading && <p className="mt-3 text-[13px] text-ink-soft">Loading…</p>}
          {addressesQuery.data?.length === 0 && (
            <p className="mt-3 text-[13px] text-ink-soft">No saved addresses yet.</p>
          )}
          <div className="mt-3 space-y-3">
            {addressesQuery.data?.map((a) => (
              <div key={a._id} className="text-[13px] text-ink-soft">
                <p className="text-ink">{a.fullName}</p>
                <p>
                  {a.line1}, {a.city}, {a.state} {a.postalCode}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
