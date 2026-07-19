import { AdminTopbar } from "@/components/admin/topbar";
import { SettingsTabs } from "@/components/admin/settings-tabs";

export default function AdminSettingsPage() {
  return (
    <>
      <AdminTopbar title="Settings" />
      <div className="px-6 py-8">
        <SettingsTabs />
      </div>
    </>
  );
}
