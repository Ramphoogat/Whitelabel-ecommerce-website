"use client";

import { useMemo, useState } from "react";
import {
  WALLET_TXNS,
  PAYOUT_ACCOUNTS,
  WITHDRAWALS,
  MIN_WITHDRAWAL,
  type WalletTxn,
  type TxnType,
  type PayoutAccount,
  type Withdrawal,
} from "@/lib/data/admin-wallet";
import { Modal } from "./modal";
import { Pagination, usePagination } from "./pagination";

/* ── helpers ── */
const inr = (n: number) =>
  `${n < 0 ? "−" : ""}₹${Math.abs(n).toLocaleString("en-IN")}`;

const TYPE_META: Record<TxnType, { label: string; bg: string; color: string }> = {
  collection:  { label: "Collection", bg: "rgba(22,163,74,0.12)",  color: "#15803d" },
  refund:      { label: "Refund",     bg: "rgba(219,39,119,0.12)", color: "#be185d" },
  gateway_fee: { label: "Fee",        bg: "rgba(217,119,6,0.12)",  color: "#b45309" },
  withdrawal:  { label: "Withdrawal", bg: "rgba(14,165,233,0.12)", color: "#0284c7" },
};

function TypeBadge({ type }: { type: TxnType }) {
  const m = TYPE_META[type];
  return (
    <span
      className="rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em]"
      style={{ background: m.bg, color: m.color }}
    >
      {m.label}
    </span>
  );
}

function StatusPill({ status }: { status: string }) {
  const ok = status === "settled" || status === "completed";
  const bad = status === "failed";
  const color = ok ? "var(--success)" : bad ? "#dc2626" : "var(--ink-soft)";
  return (
    <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.06em]" style={{ color }}>
      <span className="size-1.5 rounded-full" style={{ background: ok ? "var(--success)" : bad ? "#dc2626" : "var(--line)" }} />
      {status}
    </span>
  );
}

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div
      className="rounded-[var(--radius-lg)] border px-5 py-4"
      style={{
        background: accent ? "var(--accent-soft)" : "var(--surface)",
        borderColor: accent ? "var(--accent)" : "var(--line)",
      }}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft">{label}</p>
      <p className="mt-1 font-display text-2xl font-medium" style={{ color: accent ? "var(--accent)" : "var(--ink)" }}>
        {value}
      </p>
      {sub && <p className="mt-0.5 font-mono text-[10px] text-ink-soft/70">{sub}</p>}
    </div>
  );
}

/* ── Withdraw modal ── */
function WithdrawModal({
  balance,
  accounts,
  onConfirm,
  onClose,
}: {
  balance: number;
  accounts: PayoutAccount[];
  onConfirm: (amount: number, account: PayoutAccount) => void;
  onClose: () => void;
}) {
  const verified = accounts.filter((a) => a.verified);
  const [accountId, setAccountId] = useState(
    verified.find((a) => a.isDefault)?.id ?? verified[0]?.id ?? "",
  );
  const [amountStr, setAmountStr] = useState("");

  const amount = Number(amountStr);
  const account = verified.find((a) => a.id === accountId);
  const error =
    !amountStr ? null
    : !Number.isFinite(amount) || amount <= 0 ? "Enter a valid amount"
    : amount < MIN_WITHDRAWAL ? `Minimum withdrawal is ${inr(MIN_WITHDRAWAL)}`
    : amount > balance ? "Amount exceeds available balance"
    : null;
  const canSubmit = Boolean(account) && amountStr !== "" && !error;

  return (
    <Modal title="Withdraw funds" open onClose={onClose}>
      <div className="space-y-5">
        <div className="rounded-[var(--radius-md)] border border-line/50 px-4 py-3" style={{ background: "var(--bone)" }}>
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft">Available balance</p>
          <p className="mt-1 font-display text-xl font-medium text-ink">{inr(balance)}</p>
        </div>

        <label className="block">
          <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">Amount (₹)</span>
          <input
            autoFocus
            type="number"
            min={MIN_WITHDRAWAL}
            max={balance}
            value={amountStr}
            onChange={(e) => setAmountStr(e.target.value)}
            placeholder={`Min ${MIN_WITHDRAWAL}`}
            className="input-field font-mono text-[14px]"
          />
          {error && <p className="mt-1 font-mono text-[10px]" style={{ color: "#dc2626" }}>{error}</p>}
        </label>

        <div className="flex gap-2">
          {[25, 50, 100].map((pct) => (
            <button
              key={pct}
              type="button"
              onClick={() => setAmountStr(String(Math.floor((balance * pct) / 100)))}
              className="rounded-full border border-line px-3 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-soft hover:border-accent hover:text-accent"
            >
              {pct === 100 ? "All" : `${pct}%`}
            </button>
          ))}
        </div>

        <div>
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">Withdraw to</p>
          {verified.length === 0 ? (
            <p className="font-mono text-[12px] text-ink-soft">No verified payout account. Add and verify one first.</p>
          ) : (
            <div className="space-y-2">
              {verified.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setAccountId(a.id)}
                  className="flex w-full items-center gap-3 rounded-[var(--radius-md)] border px-4 py-3 text-left transition-all"
                  style={{
                    borderColor: accountId === a.id ? "var(--accent)" : "var(--line)",
                    background: accountId === a.id ? "var(--accent-soft)" : "var(--surface)",
                  }}
                >
                  <span className="text-lg">{a.kind === "bank" ? "🏦" : "📲"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-ink">{a.label}</p>
                    <p className="font-mono text-[10px] text-ink-soft">{a.detail}{a.ifsc ? ` · ${a.ifsc}` : ""}</p>
                  </div>
                  {a.isDefault && (
                    <span className="rounded-full border border-line/60 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.08em] text-ink-soft">
                      Default
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 border-t border-line/50 pt-4">
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => account && onConfirm(amount, account)}
            className="flex-1 rounded-full bg-accent px-5 py-3 font-mono text-[12px] uppercase tracking-[0.14em] text-accent-ink hover:opacity-90 disabled:opacity-40"
          >
            Withdraw {amountStr && !error ? inr(amount) : ""}
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
          Payouts are processed within 1 business day. A bank UTR reference appears once completed.
        </p>
      </div>
    </Modal>
  );
}

/* ── Add-account modal ── */
function AddAccountModal({
  onAdd,
  onClose,
}: {
  onAdd: (a: PayoutAccount) => void;
  onClose: () => void;
}) {
  const [kind, setKind] = useState<"bank" | "upi">("bank");
  const [label, setLabel] = useState("");
  const [holder, setHolder] = useState("");
  const [detail, setDetail] = useState("");
  const [ifsc, setIfsc] = useState("");

  const canSubmit = label.trim() && holder.trim() && detail.trim() && (kind === "upi" || ifsc.trim());

  function submit() {
    onAdd({
      id: `acc_${Math.random().toString(36).slice(2, 8)}`,
      kind,
      label: label.trim(),
      holder: holder.trim(),
      detail: kind === "bank" ? `XXXXXX${detail.trim().slice(-4)}` : detail.trim(),
      ifsc: kind === "bank" ? ifsc.trim().toUpperCase() : undefined,
      isDefault: false,
      verified: false,
    });
  }

  return (
    <Modal title="Attach payout account" open onClose={onClose}>
      <div className="space-y-4">
        <div className="flex rounded-full border border-line/60 p-0.5" style={{ background: "var(--bone)" }}>
          {(["bank", "upi"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className="flex-1 rounded-full px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] transition-all"
              style={{
                background: kind === k ? "var(--accent)" : "transparent",
                color: kind === k ? "var(--accent-ink)" : "var(--ink-soft)",
              }}
            >
              {k === "bank" ? "🏦 Bank account" : "📲 UPI"}
            </button>
          ))}
        </div>

        <label className="block">
          <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">Account nickname</span>
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. HDFC Current" className="input-field text-[13px]" />
        </label>
        <label className="block">
          <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">Account holder name</span>
          <input value={holder} onChange={(e) => setHolder(e.target.value)} placeholder="As registered with the bank" className="input-field text-[13px]" />
        </label>
        <label className="block">
          <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">
            {kind === "bank" ? "Account number" : "UPI ID"}
          </span>
          <input
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder={kind === "bank" ? "Account number" : "name@bank"}
            className="input-field font-mono text-[13px]"
          />
        </label>
        {kind === "bank" && (
          <label className="block">
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">IFSC code</span>
            <input value={ifsc} onChange={(e) => setIfsc(e.target.value)} placeholder="HDFC0001234" className="input-field font-mono text-[13px] uppercase" />
          </label>
        )}

        <div className="flex gap-3 border-t border-line/50 pt-4">
          <button
            type="button"
            disabled={!canSubmit}
            onClick={submit}
            className="flex-1 rounded-full bg-accent px-5 py-3 font-mono text-[12px] uppercase tracking-[0.14em] text-accent-ink hover:opacity-90 disabled:opacity-40"
          >
            Attach account
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
          New accounts require a penny-drop verification before withdrawals are allowed.
        </p>
      </div>
    </Modal>
  );
}

/* ── Main component ── */
export function WalletManager() {
  const [txns, setTxns] = useState<WalletTxn[]>(WALLET_TXNS);
  const [accounts, setAccounts] = useState<PayoutAccount[]>(PAYOUT_ACCOUNTS);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(WITHDRAWALS);
  const [withdrawing, setWithdrawing] = useState(false);
  const [addingAccount, setAddingAccount] = useState(false);
  const [typeFilter, setTypeFilter] = useState<"all" | TxnType>("all");

  const { available, pending, collected, withdrawn } = useMemo(() => {
    let available = 0, pending = 0, collected = 0, withdrawn = 0;
    for (const t of txns) {
      if (t.status === "failed") continue;
      if (t.status === "pending") { pending += t.amount; continue; }
      available += t.amount;
      if (t.type === "collection") collected += t.amount;
      if (t.type === "withdrawal") withdrawn += -t.amount;
    }
    return { available, pending, collected, withdrawn };
  }, [txns]);

  function confirmWithdraw(amount: number, account: PayoutAccount) {
    const seq = withdrawals.length + 90;
    const ref = `PAYOUT-${String(seq).padStart(4, "0")}`;
    const today = new Date().toISOString().slice(0, 10);
    setWithdrawals((ws) => [
      { id: `wd_${seq}`, amount, accountId: account.id, accountLabel: `${account.label} ${account.detail.slice(-4).padStart(8, "*")}`, status: "processing", requestedAt: today },
      ...ws,
    ]);
    setTxns((ts) => [
      { id: `txn_${1100 + ts.length}`, type: "withdrawal", status: "settled", amount: -amount, gateway: "—", gatewayLogo: "🏦", reference: ref, date: today, note: `To ${account.label}` },
      ...ts,
    ]);
    setWithdrawing(false);
  }

  function setDefault(id: string) {
    setAccounts((as) => as.map((a) => ({ ...a, isDefault: a.id === id })));
  }

  function removeAccount(id: string) {
    setAccounts((as) => as.filter((a) => a.id !== id));
  }

  const visibleTxns = txns.filter((t) => typeFilter === "all" || t.type === typeFilter);
  const { pageItems, page, pageCount, setPage, total, pageSize } = usePagination(visibleTxns);

  return (
    <div className="space-y-6">

      {/* Balance row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Available balance" value={inr(available)} sub="withdrawable now" accent />
        <StatCard label="Pending settlement" value={inr(pending)} sub="clearing from gateways" />
        <StatCard label="Total collected" value={inr(collected)} sub="all-time gross collections" />
        <StatCard label="Total withdrawn" value={inr(withdrawn)} sub="paid out to your accounts" />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-full border border-line/60 p-0.5" style={{ background: "var(--surface)" }}>
          {(["all", "collection", "refund", "gateway_fee", "withdrawal"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setTypeFilter(f)}
              className="rounded-full px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] transition-all"
              style={{
                background: typeFilter === f ? "var(--accent)" : "transparent",
                color: typeFilter === f ? "var(--accent-ink)" : "var(--ink-soft)",
              }}
            >
              {f === "all" ? "All" : TYPE_META[f].label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setWithdrawing(true)}
          disabled={available < MIN_WITHDRAWAL}
          className="ml-auto rounded-full bg-accent px-5 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-accent-ink hover:opacity-90 disabled:opacity-40"
        >
          ↑ Withdraw funds
        </button>
      </div>

      {/* Transactions table */}
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-line/70" style={{ background: "var(--surface)" }}>
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-line/70 bg-bone font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft">
              <th className="px-5 py-3 font-normal">Date</th>
              <th className="px-5 py-3 font-normal">Type</th>
              <th className="px-5 py-3 font-normal">Reference</th>
              <th className="px-5 py-3 font-normal">Gateway</th>
              <th className="px-5 py-3 font-normal">Status</th>
              <th className="px-5 py-3 text-right font-normal">Amount</th>
            </tr>
          </thead>
          <tbody>
            {visibleTxns.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center font-mono text-[12px] text-ink-soft">
                  No transactions match this filter.
                </td>
              </tr>
            ) : (
              pageItems.map((t) => (
                <tr key={t.id} className="border-b border-line/50 last:border-0 transition-colors hover:bg-bone/40">
                  <td className="px-5 py-3.5 font-mono text-[12px] text-ink-soft">{t.date}</td>
                  <td className="px-5 py-3.5"><TypeBadge type={t.type} /></td>
                  <td className="px-5 py-3.5">
                    <p className="font-mono text-[12px] text-ink">{t.reference}</p>
                    {t.note && <p className="font-mono text-[10px] text-ink-soft/70">{t.note}</p>}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[12px] text-ink-soft">
                    {t.gatewayLogo} {t.gateway}
                  </td>
                  <td className="px-5 py-3.5"><StatusPill status={t.status} /></td>
                  <td
                    className="px-5 py-3.5 text-right font-mono text-[13px] font-medium"
                    style={{ color: t.status === "failed" ? "var(--ink-soft)" : t.amount < 0 ? "#dc2626" : "var(--success)", textDecoration: t.status === "failed" ? "line-through" : undefined }}
                  >
                    {t.amount > 0 ? "+" : ""}{inr(t.amount)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Pagination page={page} pageCount={pageCount} total={total} pageSize={pageSize} onPage={setPage} label="transactions" />
      </div>

      {/* Payout accounts + withdrawal history */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Accounts */}
        <div className="rounded-[var(--radius-lg)] border border-line/70 p-5" style={{ background: "var(--surface)" }}>
          <div className="mb-4 flex items-center justify-between">
            <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">Payout accounts</p>
            <button
              type="button"
              onClick={() => setAddingAccount(true)}
              className="font-mono text-[11px] text-accent hover:underline"
            >
              + Attach account
            </button>
          </div>
          <div className="space-y-2">
            {accounts.length === 0 ? (
              <p className="py-6 text-center font-mono text-[12px] text-ink-soft">No payout account attached yet.</p>
            ) : (
              accounts.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-3 rounded-[var(--radius-md)] border border-line/50 px-4 py-3"
                  style={{ background: "var(--bone)" }}
                >
                  <span className="text-lg">{a.kind === "bank" ? "🏦" : "📲"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 text-[13px] font-medium text-ink">
                      {a.label}
                      {a.isDefault && (
                        <span className="rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.08em]" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
                          Default
                        </span>
                      )}
                    </p>
                    <p className="font-mono text-[10px] text-ink-soft">
                      {a.holder} · {a.detail}{a.ifsc ? ` · ${a.ifsc}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <StatusPill status={a.verified ? "verified" : "pending"} />
                    <div className="flex gap-2">
                      {!a.isDefault && a.verified && (
                        <button type="button" onClick={() => setDefault(a.id)} className="font-mono text-[10px] text-accent hover:underline">
                          Make default
                        </button>
                      )}
                      {!a.isDefault && (
                        <button type="button" onClick={() => removeAccount(a.id)} className="font-mono text-[10px] text-ink-soft hover:text-ink">
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Withdrawal history */}
        <div className="rounded-[var(--radius-lg)] border border-line/70 p-5" style={{ background: "var(--surface)" }}>
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">Withdrawal history</p>
          <div className="space-y-2">
            {withdrawals.map((w) => (
              <div
                key={w.id}
                className="flex items-center gap-3 rounded-[var(--radius-md)] border border-line/50 px-4 py-3"
                style={{ background: "var(--bone)" }}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[13px] font-medium text-ink">{inr(w.amount)}</p>
                  <p className="font-mono text-[10px] text-ink-soft">
                    {w.requestedAt} · {w.accountLabel}
                    {w.utr ? ` · ${w.utr}` : ""}
                  </p>
                </div>
                <StatusPill status={w.status} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {withdrawing && (
        <WithdrawModal
          balance={available}
          accounts={accounts}
          onConfirm={confirmWithdraw}
          onClose={() => setWithdrawing(false)}
        />
      )}
      {addingAccount && (
        <AddAccountModal
          onAdd={(a) => { setAccounts((as) => [...as, a]); setAddingAccount(false); }}
          onClose={() => setAddingAccount(false)}
        />
      )}
    </div>
  );
}
