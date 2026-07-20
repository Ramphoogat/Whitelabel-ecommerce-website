import { AdminTopbar } from "@/components/admin/topbar";
import { MarketingManager } from "@/components/admin/marketing-manager";

export default function AdminMarketingPage() {
  return (
    <>
      <AdminTopbar title="Marketing" />
      <div className="px-6 py-8">
        <MarketingManager />
      </div>
    </>
  );
}
