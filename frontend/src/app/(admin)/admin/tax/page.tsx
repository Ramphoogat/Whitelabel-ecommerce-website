"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminTopbar } from "@/components/admin/topbar";
import { useAdminTaxRates } from "@/hooks/use-admin-data";
import { createTaxRate, updateTaxRate, deleteTaxRate, type AdminApiTaxRate } from "@/lib/api/admin.api";
import { SkeletonTable } from "@/components/ui/skeleton";
import { Pagination, usePagination } from "@/components/admin/pagination";
import { toast } from "@/stores/toast-store";

type FormState = Omit<AdminApiTaxRate, "_id" | "isActive">;
const BLANK: FormState = { name: "", type: "percentage", rate: 0, priority: 0 };

export default function AdminTaxPage() {
  const qc = useQueryClient();
  const { data: rates, isLoading } = useAdminTaxRates();
  const [editing, setEditing] = useState<AdminApiTaxRate | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<FormState>(BLANK);

  function openAdd() {
    setForm(BLANK);
    setAdding(true);
    setEditing(null);
  }
  function openEdit(r: AdminApiTaxRate) {
    setForm({ name: r.name, type: r.type, rate: r.rate, priority: r.priority, countryCode: r.countryCode, stateCode: r.stateCode, categorySlug: r.categorySlug });
    setEditing(r);
    setAdding(false);
  }
  function closePanel() { setAdding(false); setEditing(null); }

  const { pageItems, page, pageCount, setPage, total, pageSize } = usePagination(rates ?? []);

  const createMut = useMutation({
    mutationFn: () => createTaxRate(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-tax-rates"] }); toast.success("Tax rate created"); closePanel(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMut = useMutation({
    mutationFn: () => updateTaxRate(editing!._id, form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-tax-rates"] }); toast.success("Tax rate updated"); closePanel(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteTaxRate(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-tax-rates"] }); toast.success("Tax rate deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const busy = createMut.isPending || updateMut.isPending;

  return (
    <>
      <AdminTopbar title="Tax Rates" />
      <div className="px-6 py-8">
        <div className="mb-5 flex justify-end">
          <button
            onClick={openAdd}
            className="rounded-full bg-accent px-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-accent-ink hover:opacity-90"
          >
            + Add rate
          </button>
        </div>

        {/* Create / Edit panel */}
        {(adding || editing) && (
          <div className="mb-6 rounded-[var(--radius-lg)] border border-line/70 bg-surface p-5">
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">
              {editing ? "Edit rate" : "New rate"}
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="sm:col-span-2">
                <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.08em] text-ink-soft">Name</span>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="GST 18%" className="input-field" />
              </label>
              <label>
                <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.08em] text-ink-soft">Type</span>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as "percentage" | "fixed" }))} className="input-field">
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed (₹)</option>
                </select>
              </label>
              <label>
                <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.08em] text-ink-soft">
                  Rate {form.type === "percentage" ? "(%)" : "(₹ paise)"}
                </span>
                <input type="number" min={0} step={0.01} value={form.rate} onChange={e => setForm(f => ({ ...f, rate: Number(e.target.value) }))} className="input-field" />
              </label>
              <label>
                <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.08em] text-ink-soft">Country code</span>
                <input value={form.countryCode ?? ""} onChange={e => setForm(f => ({ ...f, countryCode: e.target.value || undefined }))} placeholder="IN (blank = all)" className="input-field" />
              </label>
              <label>
                <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.08em] text-ink-soft">Priority</span>
                <input type="number" min={0} value={form.priority} onChange={e => setForm(f => ({ ...f, priority: Number(e.target.value) }))} className="input-field" />
              </label>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                disabled={busy || !form.name}
                onClick={() => editing ? updateMut.mutate() : createMut.mutate()}
                className="rounded-full bg-accent px-5 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-accent-ink disabled:opacity-50"
              >
                {busy ? "Saving…" : editing ? "Save" : "Create"}
              </button>
              <button onClick={closePanel} className="rounded-full border border-line px-5 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-ink hover:border-ink">
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-line/70 bg-surface">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-line/70 bg-bone font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft">
                <th className="px-5 py-3 font-normal">Name</th>
                <th className="px-5 py-3 font-normal">Type</th>
                <th className="px-5 py-3 font-normal">Rate</th>
                <th className="px-5 py-3 font-normal">Scope</th>
                <th className="px-5 py-3 font-normal">Priority</th>
                <th className="px-5 py-3 font-normal">Active</th>
                <th className="px-5 py-3 font-normal" />
              </tr>
            </thead>
            <tbody>
              {isLoading && <SkeletonTable rows={3} cols={7} />}
              {!isLoading && pageItems.map(r => (
                <tr key={r._id} className="border-b border-line/50 last:border-0 hover:bg-bone/60">
                  <td className="px-5 py-3 text-ink">{r.name}</td>
                  <td className="px-5 py-3 font-mono text-ink-soft">{r.type}</td>
                  <td className="px-5 py-3 font-mono text-ink">
                    {r.type === "percentage" ? `${r.rate}%` : `₹${r.rate / 100}`}
                  </td>
                  <td className="px-5 py-3 font-mono text-ink-soft">
                    {[r.countryCode, r.stateCode, r.categorySlug].filter(Boolean).join(" · ") || "Global"}
                  </td>
                  <td className="px-5 py-3 font-mono text-ink-soft">{r.priority}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] ${r.isActive ? "bg-success/10 text-success" : "bg-bone text-ink-soft"}`}>
                      {r.isActive ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-3">
                      <button onClick={() => openEdit(r)} className="font-mono text-[11px] text-accent hover:underline">Edit</button>
                      <button
                        onClick={() => { if (confirm(`Delete "${r.name}"?`)) deleteMut.mutate(r._id); }}
                        className="font-mono text-[11px] text-danger hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && (rates ?? []).length === 0 && (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-[13px] text-ink-soft">No tax rates yet.</td></tr>
              )}
            </tbody>
          </table>
          <Pagination page={page} pageCount={pageCount} total={total} pageSize={pageSize} onPage={setPage} label="rates" />
        </div>
      </div>
    </>
  );
}
