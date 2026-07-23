import { AdminTopbar } from "@/components/admin/topbar";
import { WalletManager } from "@/components/admin/wallet-manager";
import { RatesTicker } from "@/components/admin/rates-ticker";

export default function AdminWalletPage() {
  return (
    <>
      <AdminTopbar title="Wallet" />
      <div className="px-6 py-8">
        <RatesTicker />
        <p className="mb-6 max-w-2xl text-[15px] leading-relaxed text-ink">
          Every rupee collected across your payment gateways lands here. Track collections,
          refunds, and gateway fees, then withdraw your available balance to any attached
          bank account or UPI ID.
        </p>
        <WalletManager />
      </div>
    </>
  );
}
