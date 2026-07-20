"use client";

import { useState, useRef } from "react";
import { useStaffStore } from "@/stores/staff-store";

type Tab = "profile" | "password" | "preferences";

function Avatar({
  name,
  avatarUrl,
  size = "lg",
}: {
  name: string;
  avatarUrl?: string;
  size?: "sm" | "lg";
}) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const dim = size === "lg" ? "size-20" : "size-8";
  const text = size === "lg" ? "text-2xl" : "text-[11px]";

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={name}
        className={`${dim} rounded-full object-cover ring-2 ring-line`}
      />
    );
  }
  return (
    <div
      className={`${dim} ${text} flex items-center justify-center rounded-full bg-ink font-mono font-medium text-bone`}
    >
      {initials}
    </div>
  );
}

function Field({
  label,
  id,
  ...props
}: { label: string; id: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
        {label}
      </label>
      <input id={id} className="input-field" {...props} />
    </div>
  );
}

function Textarea({
  label,
  id,
  ...props
}: { label: string; id: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
        {label}
      </label>
      <textarea
        id={id}
        rows={3}
        className="input-field resize-none"
        {...props}
      />
    </div>
  );
}

function SaveButton({ saving, saved }: { saving: boolean; saved: boolean }) {
  return (
    <button
      type="submit"
      disabled={saving}
      className="mt-6 w-full rounded-full bg-accent py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-accent-ink transition-all hover:brightness-110 disabled:opacity-50"
    >
      {saving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
    </button>
  );
}

function ProfileTab() {
  const user = useStaffStore((s) => s.user)!;
  const updateUser = useStaffStore((s) => s.updateUser);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone ?? "",
    bio: user.bio ?? "",
    avatarUrl: user.avatarUrl ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function set(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  function handleAvatarFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set("avatarUrl", reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    updateUser(form);
    setSaving(false);
    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Avatar picker */}
      <div className="flex items-center gap-5">
        <Avatar name={form.name || user.name} avatarUrl={form.avatarUrl} size="lg" />
        <div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="rounded-full border border-line px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink transition-colors hover:border-accent hover:text-accent"
          >
            Change photo
          </button>
          {form.avatarUrl && (
            <button
              type="button"
              onClick={() => set("avatarUrl", "")}
              className="ml-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft hover:text-danger"
            >
              Remove
            </button>
          )}
          <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-ink-soft/60">
            JPG, PNG or WebP · Max 2 MB
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarFile}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Full name"
          id="profile-name"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          required
        />
        <Field
          label="Email"
          id="profile-email"
          type="email"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          required
        />
      </div>

      <Field
        label="Phone"
        id="profile-phone"
        type="tel"
        value={form.phone}
        onChange={(e) => set("phone", e.target.value)}
        placeholder="+1 (555) 000-0000"
      />

      <Textarea
        label="Bio"
        id="profile-bio"
        value={form.bio}
        onChange={(e) => set("bio", e.target.value)}
        placeholder="A short note about yourself…"
      />

      {/* Read-only role pill */}
      <div>
        <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">Role</p>
        <span className="inline-block rounded-full border border-line px-3 py-1 font-mono text-[11px] capitalize text-ink-soft">
          {user.role}
        </span>
      </div>

      <SaveButton saving={saving} saved={saved} />
    </form>
  );
}

function PasswordTab() {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function set(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setError("");
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.next !== form.confirm) { setError("New passwords don't match."); return; }
    if (form.next.length < 8) { setError("Password must be at least 8 characters."); return; }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false);
    setSaved(true);
    setForm({ current: "", next: "", confirm: "" });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field
        label="Current password"
        id="pw-current"
        type="password"
        value={form.current}
        onChange={(e) => set("current", e.target.value)}
        required
        autoComplete="current-password"
      />
      <Field
        label="New password"
        id="pw-next"
        type="password"
        value={form.next}
        onChange={(e) => set("next", e.target.value)}
        required
        autoComplete="new-password"
      />
      <Field
        label="Confirm new password"
        id="pw-confirm"
        type="password"
        value={form.confirm}
        onChange={(e) => set("confirm", e.target.value)}
        required
        autoComplete="new-password"
      />
      {error && (
        <p className="font-mono text-[11px] text-danger">{error}</p>
      )}
      <SaveButton saving={saving} saved={saved} />
    </form>
  );
}

function PreferencesTab() {
  const [notifyOrders, setNotifyOrders] = useState(true);
  const [notifyLowStock, setNotifyLowStock] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    setSaving(false);
    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">Notifications</p>
      {[
        { label: "New orders", value: notifyOrders, onChange: setNotifyOrders },
        { label: "Low stock alerts", value: notifyLowStock, onChange: setNotifyLowStock },
      ].map(({ label, value, onChange }) => (
        <div key={label} className="flex items-center justify-between rounded-[var(--radius-md)] border border-line px-4 py-3">
          <span className="text-[13px] text-ink">{label}</span>
          <button
            type="button"
            role="switch"
            aria-checked={value}
            aria-label={label}
            onClick={() => { onChange(!value); setSaved(false); }}
            className={`relative h-5 w-9 flex-shrink-0 overflow-hidden rounded-full transition-colors duration-200 ${value ? "bg-accent" : "bg-line"}`}
          >
            <span
              className={`absolute top-[1.5px] left-[1.5px] size-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${value ? "translate-x-[18px]" : "translate-x-0"}`}
            />
          </button>
        </div>
      ))}
      <SaveButton saving={saving} saved={saved} />
    </form>
  );
}

const TABS: { id: Tab; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "password", label: "Password" },
  { id: "preferences", label: "Preferences" },
];

export function ProfileModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const user = useStaffStore((s) => s.user);
  const [tab, setTab] = useState<Tab>("profile");

  if (!open || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink/30 backdrop-blur-[3px]"
      />

      <div
        className="glass animate-rise relative w-full max-w-lg overflow-hidden rounded-[var(--radius-lg)] bg-surface"
        style={{ boxShadow: "0 12px 60px rgba(28,24,18,0.22)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line/60 px-6 py-5">
          <div className="flex items-center gap-3">
            <Avatar name={user.name} avatarUrl={user.avatarUrl} size="sm" />
            <div>
              <p className="font-display text-[15px] font-medium leading-tight text-ink">{user.name}</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft">{user.role}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex size-7 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-bone hover:text-ink"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M1 1l12 12M13 1L1 13" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-line/60 px-6 pt-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`-mb-px border-b-2 px-1 pb-3 pt-2 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors ${
                tab === t.id
                  ? "border-accent text-accent"
                  : "border-transparent text-ink-soft hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-hidden px-6 py-6">
          {tab === "profile" && <ProfileTab />}
          {tab === "password" && <PasswordTab />}
          {tab === "preferences" && <PreferencesTab />}
        </div>
      </div>
    </div>
  );
}
