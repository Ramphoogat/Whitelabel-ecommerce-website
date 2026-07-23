"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listStaff,
  createStaff,
  updateStaff,
  removeStaff,
  type AdminApiStaffUser,
} from "@/lib/api/admin.api";
import { useStaffStore } from "@/stores/staff-store";
import { SkeletonTable } from "@/components/ui/skeleton";
import { toast } from "@/stores/toast-store";
import { Modal } from "./modal";
import { Pagination, usePagination } from "./pagination";

const ALL_SECTIONS: { key: string; label: string; group: string }[] = [
  { key: "dashboard",  label: "Dashboard",  group: "Overview" },
  { key: "orders",     label: "Orders",     group: "Operations" },
  { key: "products",   label: "Products",   group: "Operations" },
  { key: "inventory",  label: "Inventory",  group: "Operations" },
  { key: "customers",  label: "Customers",  group: "Operations" },
  { key: "marketing",  label: "Marketing",  group: "Operations" },
  { key: "shipping",   label: "Shipping",   group: "Operations" },
  { key: "cms",        label: "CMS",        group: "Content" },
  { key: "analytics",  label: "Analytics",  group: "Finance & Data" },
  { key: "wallet",     label: "Wallet",     group: "Finance & Data" },
  { key: "payments",   label: "Payments",   group: "Finance & Data" },
  { key: "tax",        label: "Tax",        group: "Finance & Data" },
  { key: "currency",   label: "Currency",   group: "Finance & Data" },
  { key: "staff",      label: "Staff",      group: "Admin" },
  { key: "settings",   label: "Settings",   group: "Admin" },
];

function AccessModal({ user, onClose, onSave }: { user: AdminApiStaffUser; onClose: () => void; onSave: (sections: string[] | null) => void }) {
  const allGranted = user.allowedSections == null;
  const [unrestricted, setUnrestricted] = useState(allGranted);
  const [selected, setSelected] = useState<Set<string>>(
    new Set(allGranted ? ALL_SECTIONS.map((s) => s.key) : (user.allowedSections ?? []))
  );

  function toggle(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function handleSave() {
    onSave(unrestricted ? null : Array.from(selected));
  }

  return (
    <Modal title={`Access — ${user.name}`} open onClose={onClose}>
      <p className="mb-4 text-[13px] text-ink-soft">
        Choose which sections this staff member can open. Unselected sections appear dimmed in their sidebar.
      </p>

      <label className="mb-4 flex cursor-pointer items-center gap-3 rounded-[var(--radius-md)] border border-line px-4 py-3">
        <input
          type="checkbox"
          checked={unrestricted}
          onChange={(e) => setUnrestricted(e.target.checked)}
          className="accent-[var(--accent)] size-4"
        />
        <div>
          <p className="text-[13px] font-medium text-ink">Full access (no restrictions)</p>
          <p className="text-[11px] text-ink-soft">Staff can open every section — same as admin</p>
        </div>
      </label>

      {!unrestricted && (
        <div className="space-y-3 rounded-[var(--radius-md)] border border-line p-4">
          {/* Select all / none shortcuts */}
          <div className="flex items-center justify-between pb-1 border-b border-line/50">
            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft">Sections</span>
            <div className="flex gap-3">
              <button type="button" onClick={() => setSelected(new Set(ALL_SECTIONS.map(s => s.key)))} className="font-mono text-[10px] uppercase tracking-[0.08em] text-accent hover:underline">All</button>
              <button type="button" onClick={() => setSelected(new Set())} className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-soft hover:text-ink hover:underline">None</button>
            </div>
          </div>

          {/* Grouped sections */}
          {Array.from(new Set(ALL_SECTIONS.map(s => s.group))).map(group => (
            <div key={group}>
              <p className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-soft/60">{group}</p>
              <div className="grid grid-cols-2 gap-1">
                {ALL_SECTIONS.filter(s => s.group === group).map((s) => {
                  const checked = selected.has(s.key);
                  return (
                    <label
                      key={s.key}
                      className="flex cursor-pointer items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-2 transition-colors hover:bg-bone/70"
                      style={{ background: checked ? "var(--accent-soft)" : undefined }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(s.key)}
                        className="accent-[var(--accent)] size-3.5 shrink-0"
                      />
                      <span className="font-mono text-[11px] uppercase tracking-[0.06em]" style={{ color: checked ? "var(--accent)" : "var(--ink)" }}>
                        {s.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          {selected.size === 0 && (
            <p className="text-center font-mono text-[11px] text-danger/70 pt-1">
              No sections selected — staff will see only a dimmed sidebar.
            </p>
          )}
        </div>
      )}

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={handleSave}
          className="flex-1 rounded-full bg-accent px-5 py-3 font-mono text-[12px] uppercase tracking-[0.14em] text-accent-ink hover:opacity-90"
        >
          Save access
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-line px-5 py-3 font-mono text-[12px] uppercase tracking-[0.14em] text-ink-soft hover:text-ink"
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
}

const ROLE_META: Record<string, { label: string; bg: string; color: string }> = {
  owner: { label: "Owner", bg: "rgba(217,119,6,0.12)", color: "#b45309" },
  admin: { label: "Admin", bg: "rgba(124,58,237,0.12)", color: "#7c3aed" },
  staff: { label: "Staff", bg: "rgba(14,165,233,0.12)", color: "#0284c7" },
};

function RoleBadge({ role }: { role: string }) {
  const m = ROLE_META[role] ?? ROLE_META.staff;
  return (
    <span
      className="rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em]"
      style={{ background: m.bg, color: m.color }}
    >
      {m.label}
    </span>
  );
}

function AddStaffModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"staff" | "admin">("staff");

  const mutation = useMutation({
    mutationFn: () => createStaff({ name, email, password, role }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-staff"] });
      toast.success("Staff account created");
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const canSubmit = name.trim().length >= 2 && email.includes("@") && password.length >= 8;

  return (
    <Modal title="Add staff member" open onClose={onClose}>
      <form
        onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}
        className="space-y-4"
      >
        <label className="block">
          <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">Name</span>
          <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Priya Sharma" className="input-field text-[13px]" />
        </label>
        <label className="block">
          <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">Email</span>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="priya@mystore.com" className="input-field text-[13px]" />
        </label>
        <label className="block">
          <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">Temporary password (min 8 chars)</span>
          <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="input-field font-mono text-[13px]" />
        </label>
        <div>
          <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">Role</span>
          <div className="flex gap-2">
            {(["staff", "admin"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                aria-pressed={role === r}
                className="flex-1 rounded-[var(--radius-md)] border px-4 py-3 text-left transition-colors"
                style={{
                  borderColor: role === r ? "var(--accent)" : "var(--line)",
                  background: role === r ? "var(--accent-soft)" : "transparent",
                }}
              >
                <span className="block text-[13px] font-medium text-ink capitalize">{r}</span>
                <span className="block text-[11px] text-ink-soft">
                  {r === "admin" ? "full access incl. payments, theme, staff" : "day-to-day: orders, products, inventory"}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3 border-t border-line/50 pt-4">
          <button
            type="submit"
            disabled={!canSubmit || mutation.isPending}
            className="flex-1 rounded-full bg-accent px-5 py-3 font-mono text-[12px] uppercase tracking-[0.14em] text-accent-ink hover:opacity-90 disabled:opacity-40"
          >
            {mutation.isPending ? "Creating…" : "Create account"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-line px-5 py-3 font-mono text-[12px] uppercase tracking-[0.14em] text-ink-soft hover:text-ink"
          >
            Cancel
          </button>
        </div>
        <p className="font-mono text-[10px] text-ink-soft/60">
          Share the temporary password with them privately — they sign in at /staff-login.
        </p>
      </form>
    </Modal>
  );
}

export function StaffManager() {
  const qc = useQueryClient();
  const me = useStaffStore((s) => s.user);
  const [adding, setAdding] = useState(false);

  const { data: staff, isLoading, isError } = useQuery({
    queryKey: ["admin-staff"],
    queryFn: listStaff,
    retry: 0,
  });

  const [confirmRemove, setConfirmRemove] = useState<AdminApiStaffUser | null>(null);
  const [accessTarget, setAccessTarget] = useState<AdminApiStaffUser | null>(null);

  const removeMut = useMutation({
    mutationFn: (id: string) => removeStaff(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-staff"] });
      toast.success("Staff member removed");
      setConfirmRemove(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, input }: { id: string; input: { role?: "staff" | "admin"; isActive?: boolean } }) =>
      updateStaff(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-staff"] });
      toast.success("Staff member updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = staff ?? [];
  const { pageItems, page, pageCount, setPage, total, pageSize } = usePagination(rows);

  const counts = {
    total: rows.length,
    admins: rows.filter((u) => u.role === "admin" || u.role === "owner").length,
    active: rows.filter((u) => u.isActive).length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Team members", value: counts.total },
          { label: "Admins", value: counts.admins, sub: "incl. owner" },
          { label: "Active", value: counts.active },
        ].map((s) => (
          <div key={s.label} className="rounded-[var(--radius-lg)] border border-line/60 px-5 py-4" style={{ background: "var(--surface)" }}>
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft">{s.label}</p>
            <p className="mt-1 font-display text-2xl font-medium text-ink">{s.value}</p>
            {s.sub && <p className="mt-0.5 font-mono text-[10px] text-ink-soft/70">{s.sub}</p>}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-[13px] text-ink-soft">
          Staff sign in at <code className="font-mono text-ink">/staff-login</code> with the
          credentials you create here.
        </p>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="rounded-full bg-accent px-5 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-accent-ink hover:opacity-90"
        >
          + Add staff
        </button>
      </div>

      {isError && (
        <p className="rounded-[var(--radius-md)] border border-line bg-surface px-4 py-3 text-[13px] text-ink-soft">
          Couldn&apos;t load staff — you need an owner or admin session, and the backend must be running.
        </p>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-line/70" style={{ background: "var(--surface)" }}>
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-line/70 bg-bone font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft">
              <th className="px-5 py-3 font-normal">Member</th>
              <th className="px-5 py-3 font-normal">Role</th>
              <th className="px-5 py-3 font-normal">Last sign-in</th>
              <th className="px-5 py-3 font-normal">Status</th>
              <th className="px-5 py-3 font-normal" />
            </tr>
          </thead>
          <tbody>
            {isLoading && <SkeletonTable rows={3} cols={5} />}
            {!isLoading && pageItems.map((u: AdminApiStaffUser) => {
              const isOwner = u.role === "owner";
              const isMe = me?.email === u.email;
              return (
                <tr key={u._id} className="border-b border-line/50 last:border-0 hover:bg-bone/40" style={{ opacity: u.isActive ? 1 : 0.55 }}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-bone font-mono text-[11px] text-ink-soft">
                        {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </span>
                      <div>
                        <p className="font-medium text-ink">
                          {u.name}
                          {isMe && <span className="ml-2 font-mono text-[9px] uppercase tracking-[0.08em] text-accent">you</span>}
                        </p>
                        <p className="font-mono text-[11px] text-ink-soft">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    {isOwner ? (
                      <RoleBadge role="owner" />
                    ) : (
                      <select
                        value={u.role}
                        onChange={(e) => updateMut.mutate({ id: u._id, input: { role: e.target.value as "staff" | "admin" } })}
                        disabled={updateMut.isPending}
                        className="rounded-[var(--radius-sm)] border border-line bg-surface px-2 py-1.5 font-mono text-[11px] uppercase text-ink outline-none focus:border-accent"
                        aria-label={`Role for ${u.name}`}
                      >
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                      </select>
                    )}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[12px] text-ink-soft">
                    {u.lastLoginAt ? u.lastLoginAt.slice(0, 10) : "never"}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] ${u.isActive ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}
                    >
                      {u.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {!isOwner && !isMe && (
                      <div className="flex items-center justify-end gap-3">
                        {u.role === "staff" && (
                          <>
                            <button
                              type="button"
                              onClick={() => setAccessTarget(u)}
                              className="font-mono text-[11px] text-ink-soft hover:text-ink hover:underline"
                            >
                              Access
                            </button>
                            <span className="text-ink-soft/30">·</span>
                          </>
                        )}
                        <button
                          type="button"
                          disabled={updateMut.isPending}
                          onClick={() => updateMut.mutate({ id: u._id, input: { isActive: !u.isActive } })}
                          className="font-mono text-[11px] hover:underline"
                          style={{ color: u.isActive ? "var(--danger)" : "var(--success)" }}
                        >
                          {u.isActive ? "Disable" : "Re-enable"}
                        </button>
                        <span className="text-ink-soft/30">·</span>
                        <button
                          type="button"
                          onClick={() => setConfirmRemove(u)}
                          className="font-mono text-[11px] text-danger/70 hover:text-danger hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {!isLoading && !isError && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center font-mono text-[12px] text-ink-soft">
                  No staff yet — add your first team member.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination page={page} pageCount={pageCount} total={total} pageSize={pageSize} onPage={setPage} label="members" />
      </div>

      {accessTarget && (
        <AccessModal
          user={accessTarget}
          onClose={() => setAccessTarget(null)}
          onSave={(sections) => {
            updateMut.mutate(
              { id: accessTarget._id, input: { allowedSections: sections } },
              { onSuccess: () => setAccessTarget(null) },
            );
          }}
        />
      )}

      {adding && <AddStaffModal onClose={() => setAdding(false)} />}

      {confirmRemove && (
        <Modal title="Remove staff member" open onClose={() => setConfirmRemove(null)}>
          <p className="text-[14px] text-ink leading-relaxed">
            Permanently remove <strong>{confirmRemove.name}</strong> ({confirmRemove.email})?
            They will lose all access immediately and cannot be recovered — you would need to create a new account.
          </p>
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              disabled={removeMut.isPending}
              onClick={() => removeMut.mutate(confirmRemove._id)}
              className="flex-1 rounded-full bg-danger px-5 py-3 font-mono text-[12px] uppercase tracking-[0.14em] text-white hover:opacity-90 disabled:opacity-50"
            >
              {removeMut.isPending ? "Removing…" : "Yes, remove"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmRemove(null)}
              className="rounded-full border border-line px-5 py-3 font-mono text-[12px] uppercase tracking-[0.14em] text-ink-soft hover:text-ink"
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
