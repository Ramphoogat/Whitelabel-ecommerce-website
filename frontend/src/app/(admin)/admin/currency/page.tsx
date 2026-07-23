"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminTopbar } from "@/components/admin/topbar";
import { useAdminCurrencyRates } from "@/hooks/use-admin-data";
import { upsertCurrencyRate, deleteCurrencyRate } from "@/lib/api/admin.api";
import { SkeletonTable } from "@/components/ui/skeleton";
import { Pagination, usePagination } from "@/components/admin/pagination";
import { toast } from "@/stores/toast-store";

const BLANK = { baseCurrency: "USD", targetCurrency: "", rate: 0 };

export default function AdminCurrencyPage() {
  const qc = useQueryClient();
  const { data: rates, isLoading } = useAdminCurrencyRates();
  const [form, setForm] = useState(BLANK);
  const [showForm, setShowForm] = useState(false);

  const { pageItems, page, pageCount, setPage, total, pageSize } = usePagination(rates ?? []);

  const upsertMut = useMutation({
    mutationFn: () => upsertCurrencyRate(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-currency-rates"] });
      toast.success("Exchange rate saved");
      setForm(BLANK);
      setShowForm(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteCurrencyRate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-currency-rates"] });
      toast.success("Rate deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <AdminTopbar title="Currency Rates" />
      <div className="px-6 py-8">
        <div className="mb-5 flex justify-end">
          <button
            onClick={() => setShowForm((v) => !v)}
            className="rounded-full bg-accent px-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-accent-ink hover:opacity-90"
          >
            {showForm ? "Cancel" : "+ Add / Update rate"}
          </button>
        </div>

        {showForm && (
          <div className="mb-6 rounded-[var(--radius-lg)] border border-line/70 bg-surface p-5">
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">
              Upsert exchange rate
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <label>
                <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.08em] text-ink-soft">Base</span>
                <input
                  value={form.baseCurrency}
                  onChange={(e) => setForm((f) => ({ ...f, baseCurrency: e.target.value.toUpperCase() }))}
                  placeholder="USD"
                  maxLength={3}
                  className="input-field font-mono"
                />
              </label>
              <label>
                <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.08em] text-ink-soft">Target</span>
                <input
                  value={form.targetCurrency}
                  onChange={(e) => setForm((f) => ({ ...f, targetCurrency: e.target.value.toUpperCase() }))}
                  placeholder="INR"
                  maxLength={3}
                  className="input-field font-mono"
                />
              </label>
              <label>
                <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.08em] text-ink-soft">Rate</span>
                <input
                  type="number"
                  min={0}
                  step={0.0001}
                  value={form.rate}
                  onChange={(e) => setForm((f) => ({ ...f, rate: Number(e.target.value) }))}
                  className="input-field font-mono"
                />
              </label>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                disabled={upsertMut.isPending || !form.targetCurrency || form.rate <= 0}
                onClick={() => upsertMut.mutate()}
                className="rounded-full bg-accent px-5 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-accent-ink disabled:opacity-50"
              >
                {upsertMut.isPending ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-line/70 bg-surface">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-line/70 bg-bone font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft">
                <th className="px-5 py-3 font-normal">Pair</th>
                <th className="px-5 py-3 font-normal">Rate</th>
                <th className="px-5 py-3 font-normal">Active</th>
                <th className="px-5 py-3 font-normal" />
              </tr>
            </thead>
            <tbody>
              {isLoading && <SkeletonTable rows={3} cols={4} />}
              {!isLoading &&
                pageItems.map((r) => (
                  <tr key={r._id} className="border-b border-line/50 last:border-0 hover:bg-bone/60">
                    <td className="px-5 py-3 font-mono text-ink">
                      {r.baseCurrency} → {r.targetCurrency}
                    </td>
                    <td className="px-5 py-3 font-mono text-ink">{r.rate.toFixed(4)}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] ${
                          r.isActive ? "bg-success/10 text-success" : "bg-bone text-ink-soft"
                        }`}
                      >
                        {r.isActive ? "Active" : "Off"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => {
                          if (confirm(`Delete ${r.baseCurrency}→${r.targetCurrency}?`))
                            deleteMut.mutate(r._id);
                        }}
                        className="font-mono text-[11px] text-danger hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              {!isLoading && (rates ?? []).length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-[13px] text-ink-soft">
                    No exchange rates yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination page={page} pageCount={pageCount} total={total} pageSize={pageSize} onPage={setPage} label="rates" />
        </div>
      </div>
    </>
  );
}
