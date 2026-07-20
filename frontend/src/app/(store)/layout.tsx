import { StoreHeader } from "@/components/store/header";
import { StoreFooter } from "@/components/store/footer";
import { CartDrawer } from "@/components/store/cart-drawer";
import { StoreThemeScope } from "@/components/theme/store-theme-scope";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <StoreThemeScope>
      <StoreHeader />
      <main className="flex-1">{children}</main>
      <StoreFooter />
      <CartDrawer />
    </StoreThemeScope>
  );
}
