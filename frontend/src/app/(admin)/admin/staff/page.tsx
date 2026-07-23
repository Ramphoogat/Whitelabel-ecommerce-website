import { AdminTopbar } from "@/components/admin/topbar";
import { StaffManager } from "@/components/admin/staff-manager";

export default function AdminStaffPage() {
  return (
    <>
      <AdminTopbar title="Staff" />
      <div className="px-6 py-8">
        <p className="mb-6 max-w-2xl text-[15px] leading-relaxed text-ink">
          Your store team. Add staff or admin accounts, change roles, and disable access —
          owners and admins manage everything here; the owner account itself can&apos;t be changed.
        </p>
        <StaffManager />
      </div>
    </>
  );
}
