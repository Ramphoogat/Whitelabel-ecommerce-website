import { AdminSidebar } from "@/components/admin/sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 bg-bone">
      <AdminSidebar />
      <div className="flex-1">{children}</div>
    </div>
  );
}
