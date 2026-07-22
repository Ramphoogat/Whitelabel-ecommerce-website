import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminThemeScope } from "@/components/admin/admin-theme-scope";
import { AdminGuard } from "@/components/admin/admin-guard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <AdminThemeScope>
        <div className="flex h-screen overflow-hidden bg-bone text-[15px] text-ink [&_th]:text-[11px] [&_.font-mono]:tracking-[0.04em]">
          <AdminSidebar />
          {/* min-w-0 stops wide children from forcing horizontal scroll; overflow-y-auto makes only this column scroll */}
          <div className="min-w-0 flex-1 overflow-y-auto">{children}</div>
        </div>
      </AdminThemeScope>
    </AdminGuard>
  );
}
