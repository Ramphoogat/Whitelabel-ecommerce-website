"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminGateways } from "@/hooks/use-admin-data";
import { updatePaymentGateway } from "@/lib/api/admin.api";
import { toast } from "@/stores/toast-store";
import { GATEWAY_CONFIGS } from "@/lib/data/admin-payments";
import { SkeletonTable } from "@/components/ui/skeleton";

export function GatewayToggleList() {
  const qc = useQueryClient();
  const { data: apiGateways, isLoading, isSuccess } = useAdminGateways();

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updatePaymentGateway(id, { isActive }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-gateways"] });
      toast.success("Gateway updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Fall back to mock data (with local toggle) when API is unreachable
  if (!isSuccess && !isLoading) {
    return <MockGatewayToggleList />;
  }

  const gateways = isSuccess ? apiGateways! : [];

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-line/70 bg-surface">
      <table className="w-full text-left text-[13px]">
        <thead>
          <tr className="border-b border-line/70 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft">
            <th className="px-5 py-3 font-normal">Provider</th>
            <th className="px-5 py-3 font-normal">Supported Modes</th>
            <th className="px-5 py-3 font-normal">Priority</th>
            <th className="px-5 py-3 font-normal">Active</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <SkeletonTable rows={3} cols={4} />
          ) : (
            gateways.map((g) => (
              <tr key={g._id} className="border-b border-line/50 last:border-0 hover:bg-bone/60">
                <td className="px-5 py-3 text-ink">{g.provider}</td>
                <td className="px-5 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {(g.supportedModes ?? []).map((m) => (
                      <span
                        key={m}
                        className="rounded-full bg-line-soft px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-ink-soft"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-3 font-mono text-ink-soft">{g.priority ?? "—"}</td>
                <td className="px-5 py-3">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={g.isActive}
                    aria-label={`Toggle ${g.provider}`}
                    disabled={toggleMutation.isPending}
                    onClick={() => toggleMutation.mutate({ id: g._id, isActive: !g.isActive })}
                    className="relative h-5 w-9 rounded-full transition-colors disabled:opacity-60"
                    style={{ background: g.isActive ? "var(--success)" : "var(--line)" }}
                  >
                    <span
                      className="absolute top-0.5 size-4 rounded-full bg-white transition-all"
                      style={{ left: g.isActive ? "18px" : "2px" }}
                    />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function MockGatewayToggleList() {
  const [gateways, setGateways] = useState(GATEWAY_CONFIGS);
  function toggle(provider: string) {
    setGateways((gs) => gs.map((g) => (g.provider === provider ? { ...g, isActive: !g.isActive } : g)));
  }
  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-line/70 bg-surface">
      <div className="flex items-center gap-2 border-b border-line/70 px-5 py-2">
        <span className="rounded-full bg-line-soft px-2.5 py-1 font-mono text-[10px] text-ink-soft">
          Demo data
        </span>
      </div>
      <table className="w-full text-left text-[13px]">
        <thead>
          <tr className="border-b border-line/70 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft">
            <th className="px-5 py-3 font-normal">Gateway</th>
            <th className="px-5 py-3 font-normal">Supported Modes</th>
            <th className="px-5 py-3 font-normal">Priority</th>
            <th className="px-5 py-3 font-normal">Active</th>
          </tr>
        </thead>
        <tbody>
          {gateways.map((g) => (
            <tr key={g.provider} className="border-b border-line/50 last:border-0 hover:bg-bone/60">
              <td className="px-5 py-3 text-ink">{g.label}</td>
              <td className="px-5 py-3">
                <div className="flex flex-wrap gap-1.5">
                  {g.supportedModes.map((m) => (
                    <span key={m} className="rounded-full bg-line-soft px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-ink-soft">
                      {m}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-5 py-3 font-mono text-ink-soft">{g.priority}</td>
              <td className="px-5 py-3">
                <button
                  type="button"
                  role="switch"
                  aria-checked={g.isActive}
                  onClick={() => toggle(g.provider)}
                  className="relative h-5 w-9 rounded-full transition-colors"
                  style={{ background: g.isActive ? "var(--success)" : "var(--line)" }}
                >
                  <span className="absolute top-0.5 size-4 rounded-full bg-white transition-all" style={{ left: g.isActive ? "18px" : "2px" }} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
