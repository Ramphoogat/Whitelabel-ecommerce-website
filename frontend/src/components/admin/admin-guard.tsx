"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStaffStore } from "@/stores/staff-store";

/**
 * Client-side gate for the merchant console.
 * Waits one tick for Zustand's localStorage hydration before redirecting —
 * otherwise a full-page navigation flashes to /staff-login even when a
 * valid session exists in storage.
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useStaffStore((s) => s.user);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && !user) router.replace("/staff-login");
  }, [hydrated, user, router]);

  // Before hydration finishes, render nothing to avoid a flash.
  if (!hydrated || !user) return null;

  return <>{children}</>;
}
