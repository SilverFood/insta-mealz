import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin-dashboard";
import { AdminLoginForm } from "@/components/admin-login-form";
import { hasAdminSessionFromCookies, isAdminAccessConfigured } from "@/lib/admin/auth";
import { listAdminOrders } from "@/lib/db/orders";
import { listProductsWithLiveStock } from "@/lib/db/product-stock";
import { getStoreSettings } from "@/lib/db/store-settings";
import { getAppEnv } from "@/lib/env";

export const metadata: Metadata = {
  title: "Admin · InstaMealz",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const configured = isAdminAccessConfigured();

  if (!configured) {
    return <AdminLoginForm configured={false} />;
  }

  const authed = await hasAdminSessionFromCookies();
  if (!authed) {
    return <AdminLoginForm configured />;
  }

  const orders = await listAdminOrders();
  const products = await listProductsWithLiveStock();
  const storeSettings = await getStoreSettings();
  const appEnv = getAppEnv();

  return (
    <AdminDashboard
      orders={orders}
      products={products}
      appEnv={appEnv}
      acceptingOrders={storeSettings.acceptingOrders}
    />
  );
}
