"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStaffStore } from "@/stores/staff-store";
import { ProfileModal } from "./profile-modal";

function ProfileAvatar({ name, avatarUrl }: { name: string; avatarUrl?: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={avatarUrl} alt={name} className="size-8 rounded-full object-cover" />
    );
  }
  return (
    <div className="size-8 rounded-full bg-ink font-mono text-[11px] leading-8 text-center text-bone">
      {initials}
    </div>
  );
}

function ProfileDropdown({ onEditProfile, onClose }: { onEditProfile: () => void; onClose: () => void }) {
  const router = useRouter();
  const clearSession = useStaffStore((s) => s.clearSession);
  const user = useStaffStore((s) => s.user);

  function signOut() {
    clearSession();
    router.replace("/staff-login");
  }

  const items = [
    {
      label: "Edit profile",
      icon: (
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 2l2 2-6 6H3V8l6-6z" />
        </svg>
      ),
      action: () => { onClose(); onEditProfile(); },
    },
    {
      label: "Change password",
      icon: (
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="6" width="9" height="6" rx="1.5" />
          <path d="M4.5 6V4a2 2 0 014 0v2" />
        </svg>
      ),
      action: () => { onClose(); onEditProfile(); },
    },
  ];

  return (
    <div
      className="glass absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-[var(--radius-md)] bg-surface py-1"
      style={{ boxShadow: "0 8px 32px rgba(28,24,18,0.16)" }}
    >
      {/* User info header */}
      <div className="border-b border-line/60 px-4 py-3">
        <p className="text-[13px] font-medium leading-tight text-ink">{user?.name}</p>
        <p className="mt-0.5 font-mono text-[10px] text-ink-soft">{user?.email}</p>
      </div>

      {/* Actions */}
      <div className="py-1">
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={item.action}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-[13px] text-ink transition-colors hover:bg-bone"
          >
            <span className="text-ink-soft">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      {/* Sign out */}
      <div className="border-t border-line/60 py-1">
        <button
          type="button"
          onClick={signOut}
          className="flex w-full items-center gap-3 px-4 py-2.5 text-[13px] text-danger transition-colors hover:bg-bone"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 2H2.5A1.5 1.5 0 001 3.5v6A1.5 1.5 0 002.5 11H5M8.5 9.5L12 6.5 8.5 3.5M12 6.5H5" />
          </svg>
          Sign out
        </button>
      </div>
    </div>
  );
}

export function AdminTopbar({ title }: { title: string }) {
  const user = useStaffStore((s) => s.user);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [dropdownOpen]);

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b border-line/70 px-6">
        <h1 className="font-display text-xl italic text-ink">{title}</h1>

        <div className="flex items-center gap-3">
          <span className="hidden font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft sm:inline">
            {user?.name?.split(" ")[0] ?? "Admin"}
          </span>

          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen((o) => !o)}
              aria-label="Open profile menu"
              aria-expanded={dropdownOpen}
              className="group relative flex items-center rounded-full ring-2 ring-transparent transition-all hover:ring-accent/40 focus-visible:ring-accent"
            >
              {user && (
                <ProfileAvatar name={user.name} avatarUrl={user.avatarUrl} />
              )}
              {/* Small chevron badge */}
              <span className="absolute -bottom-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full bg-bone ring-1 ring-line">
                <svg width="6" height="6" viewBox="0 0 6 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-ink-soft">
                  <path d="M1 2l2 2 2-2" />
                </svg>
              </span>
            </button>

            {dropdownOpen && (
              <ProfileDropdown
                onEditProfile={() => setModalOpen(true)}
                onClose={() => setDropdownOpen(false)}
              />
            )}
          </div>
        </div>
      </header>

      <ProfileModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
