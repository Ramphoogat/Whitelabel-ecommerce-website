import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminThemeScope } from "@/components/admin/admin-theme-scope";
import { AdminGuard } from "@/components/admin/admin-guard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <AdminThemeScope>
        <div className="flex min-h-full flex-1 bg-bone text-ink">
          <AdminSidebar />
          {/* min-w-0 stops wide children (tables, the theme-studio preview) from forcing page-level horizontal scroll */}
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </AdminThemeScope>
    </AdminGuard>
  );
}
