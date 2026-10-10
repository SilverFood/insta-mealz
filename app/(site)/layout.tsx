import type { ReactNode } from "react";
import { CartProvider } from "@/components/cart-provider";
import { CartDrawer } from "@/components/shop-ui";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <SiteHeader />
      <main className="min-w-0 flex-1 overflow-x-clip">{children}</main>
      <SiteFooter />
      <CartDrawer />
    </CartProvider>
  );
}
