import { AdminTopbar } from "@/components/admin/topbar";
import { CmsManager } from "@/components/admin/cms-manager";

export default function AdminCmsPage() {
  return (
    <>
      <AdminTopbar title="CMS" />
      <div className="px-6 py-8">
        <CmsManager />
      </div>
    </>
  );
}
