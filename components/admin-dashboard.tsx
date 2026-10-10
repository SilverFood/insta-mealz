"use client";

import { Fragment, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageEntrance } from "@/components/motion/page-entrance";
import type { AppEnv } from "@/lib/env";
import type { AdminOrderSummary, OrderConfirmationDetails } from "@/lib/db/orders";
import type { Product } from "@/lib/products";
import { formatInr } from "@/lib/money";

type AdminDashboardProps = {
  orders: AdminOrderSummary[];
  products: Product[];
  appEnv: AppEnv;
};
type DashboardTab = "orders" | "inventory";

function formatOrderDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatPaise(paise: number) {
  return formatInr(paise / 100);
}

function MarketingOptInLabel({ optedIn }: { optedIn: boolean }) {
  if (!optedIn) {
    return <span className="text-[13px] text-[#83957c]">News & offers: No</span>;
  }
  return (
    <span className="inline-flex items-center rounded-full bg-[#e8f0e4] px-2.5 py-0.5 text-[12px] font-medium text-[#314e24]">
      News & offers
    </span>
  );
}

function StatusChip({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  if (normalized === "completed") {
    return (
      <span className="inline-flex shrink-0 rounded-full bg-[#314e24] px-3 py-1 text-[13px] font-medium text-white">
        Completed
      </span>
    );
  }
  if (normalized === "pending") {
    return (
      <span className="inline-flex shrink-0 rounded-full bg-[#ede4d4] px-3 py-1 text-[13px] font-medium text-[#5b350d]">
        Pending
      </span>
    );
  }
  if (normalized === "failed") {
    return (
      <span className="inline-flex shrink-0 rounded-full bg-[#f1e9dd] px-3 py-1 text-[13px] font-medium text-[#83957c]">
        Failed
      </span>
    );
  }
  return (
    <span className="inline-flex shrink-0 rounded-full bg-[#f1e9dd] px-3 py-1 text-[13px] font-medium capitalize text-[#1d2f16]">
      {status}
    </span>
  );
}

function StockChip({ inStock }: { inStock: boolean }) {
  if (inStock) {
    return (
      <span className="inline-flex shrink-0 rounded-full bg-[#e8f0e4] px-3 py-1 text-[13px] font-medium text-[#314e24]">
        In stock
      </span>
    );
  }
  return (
    <span className="inline-flex shrink-0 rounded-full bg-[#f4e3df] px-3 py-1 text-[13px] font-medium text-[#8f3a31]">
      Out of stock
    </span>
  );
}

function DashboardTabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`h-10 rounded-full px-5 text-[14px] font-medium transition-colors sm:text-[15px] ${
        active ? "bg-[#1d2f16] text-white" : "text-[#1d2f16] hover:bg-[#f1e9dd]"
      }`}
    >
      {label}
    </button>
  );
}

function StockToggle({
  checked,
  disabled,
  onToggle,
}: {
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={checked ? "In stock" : "Out of stock"}
      disabled={disabled}
      onClick={onToggle}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        checked ? "bg-[#314e24]" : "bg-[#c7bcae]"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function KpiCard({
  label,
  value,
  subtext,
}: {
  label: string;
  value: string;
  subtext?: string;
}) {
  return (
    <div className="min-w-0 overflow-hidden rounded-[20px] border border-[#ede4d4] bg-white px-4 py-4 sm:px-5">
      <p className="text-[12px] font-semibold uppercase tracking-wide text-[#83957c] sm:text-[13px]">{label}</p>
      <p className="mt-1 truncate text-2xl font-semibold tabular-nums sm:text-[28px]">{value}</p>
      {subtext ? <p className="mt-1 truncate text-[13px] text-[#83957c]">{subtext}</p> : null}
    </div>
  );
}

function OrderDetailPanel({ detail }: { detail: OrderConfirmationDetails }) {
  const addressLines = [
    `${detail.address.firstName} ${detail.address.lastName}`,
    detail.address.addressLine1,
    detail.address.addressLine2,
    `${detail.address.city}, ${detail.address.state} ${detail.address.postalCode}`,
    detail.address.country,
  ].filter(Boolean);

  return (
    <div className="mt-4 min-w-0 space-y-4 rounded-[20px] border border-[#ede4d4] bg-[#fbfaf6] p-4 text-left text-[15px] sm:p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-[#83957c]">Customer</p>
          <p className="mt-1 break-all">{detail.email}</p>
          <p className="mt-2">
            <MarketingOptInLabel optedIn={detail.marketingOptIn} />
          </p>
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-[#83957c]">Placed</p>
          <p className="mt-1">{formatOrderDate(detail.createdAt)}</p>
        </div>
      </div>
      <div className="min-w-0">
        <p className="text-[13px] font-semibold uppercase tracking-wide text-[#83957c]">Delivery</p>
        <p className="mt-1 break-words whitespace-pre-line leading-6">{addressLines.join("\n")}</p>
      </div>
      {detail.customerNote ? (
        <div className="min-w-0">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-[#83957c]">Order note</p>
          <p className="mt-1 break-words whitespace-pre-line leading-6">{detail.customerNote}</p>
        </div>
      ) : null}
      <div className="min-w-0">
        <p className="text-[13px] font-semibold uppercase tracking-wide text-[#83957c]">Items</p>
        <ul className="mt-2 divide-y divide-[#ede4d4]">
          {detail.items.map((item) => (
            <li key={`${item.name}-${item.variant}`} className="flex flex-wrap items-start justify-between gap-2 py-3">
              <div className="min-w-0">
                <p className="font-medium">{item.name}</p>
                <p className="text-[#83957c]">
                  {item.variant} · Qty {item.quantity}
                </p>
              </div>
              <p className="shrink-0 font-medium tabular-nums">{formatPaise(item.lineTotalPaise)}</p>
            </li>
          ))}
        </ul>
      </div>
      <div className="space-y-2 border-t border-[#ede4d4] pt-4">
        <div className="flex justify-between gap-2">
          <span className="text-[#83957c]">Subtotal</span>
          <span className="tabular-nums">{formatPaise(detail.subtotalPaise)}</span>
        </div>
        {detail.discountPaise > 0 ? (
          <div className="flex justify-between gap-2">
            <span className="text-[#83957c]">
              Discount{detail.discountCode ? ` (${detail.discountCode})` : ""}
            </span>
            <span className="tabular-nums">-{formatPaise(detail.discountPaise)}</span>
          </div>
        ) : null}
        <div className="flex justify-between gap-2">
          <span className="text-[#83957c]">Shipping</span>
          <span className="tabular-nums">{formatPaise(detail.shippingPaise)}</span>
        </div>
        <div className="flex justify-between gap-2 text-[17px] font-semibold">
          <span>Total</span>
          <span className="tabular-nums">{formatPaise(detail.totalPaise)}</span>
        </div>
      </div>
    </div>
  );
}

function OrderExpandedContent({
  order,
  loadingId,
  detailError,
  expandedId,
  detailsById,
}: {
  order: AdminOrderSummary;
  loadingId: string | null;
  detailError: string | null;
  expandedId: string | null;
  detailsById: Record<string, OrderConfirmationDetails>;
}) {
  return (
    <div className="min-w-0 px-1 py-2">
      {order.razorpayOrderId ? (
        <p className="break-all text-[13px] text-[#83957c]">Razorpay order: {order.razorpayOrderId}</p>
      ) : null}
      {order.razorpayPaymentId ? (
        <p className="mt-1 break-all text-[13px] text-[#83957c]">Payment: {order.razorpayPaymentId}</p>
      ) : null}
      {loadingId === order.id ? <p className="mt-3 text-[#83957c]">Loading details…</p> : null}
      {detailError && expandedId === order.id ? <p className="mt-3 text-[#c4554a]">{detailError}</p> : null}
      {detailsById[order.id] ? <OrderDetailPanel detail={detailsById[order.id]} /> : null}
    </div>
  );
}

export function AdminDashboard({ orders, products, appEnv }: AdminDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<DashboardTab>("orders");
  const [inventory, setInventory] = useState(products);
  const [savingStockBySlug, setSavingStockBySlug] = useState<Record<string, boolean>>({});
  const [stockError, setStockError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailsById, setDetailsById] = useState<Record<string, OrderConfirmationDetails>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const inventoryByCategory = useMemo(() => {
    return [...inventory].sort((a, b) => {
      if (a.category !== b.category) return a.category.localeCompare(b.category);
      return a.name.localeCompare(b.name);
    });
  }, [inventory]);

  const stats = useMemo(() => {
    let revenueCollectedPaise = 0;
    let placedValuePaise = 0;
    let itemsSold = 0;
    let pendingValuePaise = 0;
    let failedValuePaise = 0;
    let marketingOptIns = 0;
    const counts = { pending: 0, completed: 0, failed: 0 };

    for (const order of orders) {
      if (order.marketingOptIn) marketingOptIns += 1;
      placedValuePaise += order.totalPaise;
      const status = order.status.toLowerCase();
      if (status === "completed") {
        counts.completed += 1;
        revenueCollectedPaise += order.totalPaise;
        itemsSold += order.itemCount;
      } else if (status === "pending") {
        counts.pending += 1;
        pendingValuePaise += order.totalPaise;
      } else if (status === "failed") {
        counts.failed += 1;
        failedValuePaise += order.totalPaise;
      }
    }

    const averageOrderValuePaise =
      counts.completed > 0 ? Math.round(revenueCollectedPaise / counts.completed) : null;

    return {
      counts,
      revenueCollectedPaise,
      placedValuePaise,
      itemsSold,
      pendingValuePaise,
      failedValuePaise,
      averageOrderValuePaise,
      marketingOptIns,
    };
  }, [orders]);

  async function toggleOrder(orderId: string) {
    if (expandedId === orderId) {
      setExpandedId(null);
      setDetailError(null);
      return;
    }

    setExpandedId(orderId);
    setDetailError(null);

    if (detailsById[orderId]) return;

    setLoadingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}`);
      const data = (await res.json()) as { order?: OrderConfirmationDetails; error?: string };
      if (!res.ok || !data.order) {
        setDetailError(data.error || "Could not load order details");
        return;
      }
      setDetailsById((prev) => ({ ...prev, [orderId]: data.order! }));
    } catch {
      setDetailError("Could not load order details");
    } finally {
      setLoadingId(null);
    }
  }

  async function onLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  async function setProductStock(slug: string, inStock: boolean) {
    const current = inventory.find((item) => item.slug === slug);
    if (!current || current.inStock === inStock) return;

    setStockError(null);
    setSavingStockBySlug((prev) => ({ ...prev, [slug]: true }));
    const previousInStock = current.inStock;
    setInventory((prev) =>
      prev.map((item) => (item.slug === slug ? { ...item, inStock } : item)),
    );

    try {
      const res = await fetch(`/api/admin/products/${encodeURIComponent(slug)}/stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inStock }),
      });
      const data = (await res.json().catch(() => ({}))) as { product?: Product; error?: string };
      if (!res.ok || !data.product) {
        throw new Error(data.error || "Could not update stock");
      }
      setInventory((prev) =>
        prev.map((item) => (item.slug === slug ? data.product! : item)),
      );
    } catch (error) {
      setInventory((prev) =>
        prev.map((item) => (item.slug === slug ? { ...item, inStock: previousInStock } : item)),
      );
      setStockError(error instanceof Error ? error.message : "Could not update stock");
    } finally {
      setSavingStockBySlug((prev) => {
        const next = { ...prev };
        delete next[slug];
        return next;
      });
    }
  }

  const revenueLabel = formatPaise(stats.revenueCollectedPaise);

  return (
    <div className="px-4 py-10 text-[#1d2f16] sm:px-6 sm:py-12">
      <PageEntrance>
        <div className="mx-auto max-w-[1200px] min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="font-sans text-[28px] font-semibold sm:text-[36px]">Dashboard</h1>
              <p className="mt-2 text-[15px] text-[#83957c] sm:text-[18px]">
                {orders.length} order{orders.length === 1 ? "" : "s"} · {revenueLabel} collected
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[#f1e9dd] px-4 py-1.5 text-[13px] font-medium uppercase tracking-wide text-[#314e24]">
                {appEnv === "prod" ? "Production" : "Sandbox"}
              </span>
              <button
                type="button"
                onClick={onLogout}
                disabled={loggingOut}
                className="btn-outline inline-flex h-11 items-center px-6 disabled:opacity-60"
              >
                {loggingOut ? "Signing out…" : "Log out"}
              </button>
            </div>
          </div>

          <div className="mt-8 inline-flex flex-wrap rounded-full border border-[#d9d0c3] bg-white p-1">
            <DashboardTabButton
              active={activeTab === "orders"}
              label="Orders"
              onClick={() => setActiveTab("orders")}
            />
            <DashboardTabButton
              active={activeTab === "inventory"}
              label="Inventory"
              onClick={() => setActiveTab("inventory")}
            />
          </div>

          {activeTab === "orders" ? (
            <>
              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
                <KpiCard label="Total orders" value={String(orders.length)} />
                <KpiCard label="Revenue collected" value={formatPaise(stats.revenueCollectedPaise)} subtext="Completed payments" />
                <KpiCard
                  label="Order value placed"
                  value={formatPaise(stats.placedValuePaise)}
                  subtext="All statuses"
                />
                <KpiCard label="Items sold" value={String(stats.itemsSold)} subtext="From completed orders" />
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 sm:mt-4 sm:grid-cols-3 sm:gap-4">
                <div className="min-w-0 overflow-hidden rounded-[20px] bg-[#f1e9dd] px-4 py-4 sm:px-5">
                  <p className="text-[12px] font-semibold uppercase tracking-wide text-[#83957c] sm:text-[13px]">Pending</p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums sm:text-[28px]">{stats.counts.pending}</p>
                  {stats.pendingValuePaise > 0 ? (
                    <p className="mt-1 truncate text-[13px] text-[#5b350d] tabular-nums">{formatPaise(stats.pendingValuePaise)}</p>
                  ) : null}
                </div>
                <div className="min-w-0 overflow-hidden rounded-[20px] bg-[#f1e9dd] px-4 py-4 sm:px-5">
                  <p className="text-[12px] font-semibold uppercase tracking-wide text-[#83957c] sm:text-[13px]">Completed</p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums sm:text-[28px]">{stats.counts.completed}</p>
                  {stats.revenueCollectedPaise > 0 ? (
                    <p className="mt-1 truncate text-[13px] text-[#314e24] tabular-nums">{formatPaise(stats.revenueCollectedPaise)}</p>
                  ) : null}
                </div>
                <div className="min-w-0 overflow-hidden rounded-[20px] bg-[#f1e9dd] px-4 py-4 sm:px-5">
                  <p className="text-[12px] font-semibold uppercase tracking-wide text-[#83957c] sm:text-[13px]">Failed</p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums sm:text-[28px]">{stats.counts.failed}</p>
                  {stats.failedValuePaise > 0 ? (
                    <p className="mt-1 truncate text-[13px] text-[#83957c] tabular-nums">{formatPaise(stats.failedValuePaise)}</p>
                  ) : null}
                </div>
              </div>

              {stats.averageOrderValuePaise != null ? (
                <p className="mt-4 text-[14px] text-[#83957c] sm:text-[15px]">
                  Average order value (completed):{" "}
                  <span className="font-medium text-[#1d2f16] tabular-nums">{formatPaise(stats.averageOrderValuePaise)}</span>
                </p>
              ) : null}

              <h2 className="mt-10 font-sans text-[22px] font-semibold sm:text-[26px]">Recent orders</h2>

              {orders.length === 0 ? (
                <p className="mt-8 text-center text-[16px] text-[#83957c] sm:text-[18px]">No orders yet.</p>
              ) : (
                <>
                  <div className="mt-6 hidden max-w-full overflow-hidden rounded-[20px] border border-[#ede4d4] bg-white lg:block">
                    <table className="w-full table-fixed text-left text-[14px] sm:text-[15px]">
                      <thead className="bg-[#fbfaf6] text-[12px] uppercase tracking-wide text-[#83957c] sm:text-[13px]">
                        <tr>
                          <th className="w-[18%] px-3 py-3 font-semibold sm:px-4 sm:py-4 lg:px-5">Order</th>
                          <th className="w-[16%] whitespace-nowrap px-3 py-3 font-semibold sm:px-4 sm:py-4 lg:px-5">Date</th>
                          <th className="w-[28%] px-3 py-3 font-semibold sm:px-4 sm:py-4 lg:px-5">Customer</th>
                          <th className="w-[14%] whitespace-nowrap px-3 py-3 font-semibold sm:px-4 sm:py-4 lg:px-5">Status</th>
                          <th className="hidden w-[8%] whitespace-nowrap px-3 py-3 font-semibold lg:table-cell lg:px-5 lg:py-4">Items</th>
                          <th className="w-[10%] whitespace-nowrap px-3 py-3 text-right font-semibold sm:px-4 sm:py-4 lg:px-5">Total</th>
                          <th className="w-[6%] whitespace-nowrap px-3 py-3 text-right font-semibold sm:px-4 sm:py-4 lg:px-5" />
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => {
                          const expanded = expandedId === order.id;
                          return (
                            <Fragment key={order.id}>
                              <tr className="border-t border-[#ede4d4] align-top">
                                <td className="min-w-0 px-3 py-3 font-medium sm:px-4 sm:py-4 lg:px-5">
                                  <span className="block truncate" title={order.id}>{order.id}</span>
                                </td>
                                <td className="min-w-0 px-3 py-3 sm:px-4 sm:py-4 lg:px-5">
                                  <span className="block truncate text-[13px] sm:text-[inherit]" title={formatOrderDate(order.createdAt)}>
                                    {formatOrderDate(order.createdAt)}
                                  </span>
                                </td>
                                <td className="min-w-0 px-3 py-3 sm:px-4 sm:py-4 lg:px-5">
                                  <span className="block truncate" title={order.email}>{order.email}</span>
                                  {order.customerNote ? (
                                    <span className="mt-1 block truncate text-[13px] text-[#83957c]" title={order.customerNote}>
                                      Note: {order.customerNote}
                                    </span>
                                  ) : null}
                                  <span className="mt-1 block">
                                    <MarketingOptInLabel optedIn={order.marketingOptIn} />
                                  </span>
                                </td>
                                <td className="px-3 py-3 sm:px-4 sm:py-4 lg:px-5">
                                  <StatusChip status={order.status} />
                                </td>
                                <td className="hidden px-3 py-3 lg:table-cell lg:px-5 lg:py-4 tabular-nums">{order.itemCount}</td>
                                <td className="px-3 py-3 text-right font-medium tabular-nums sm:px-4 sm:py-4 lg:px-5">
                                  {formatPaise(order.totalPaise)}
                                </td>
                                <td className="px-3 py-3 text-right sm:px-4 sm:py-4 lg:px-5">
                                  <button
                                    type="button"
                                    onClick={() => toggleOrder(order.id)}
                                    className="text-[#314e24] underline-offset-2 hover:underline"
                                  >
                                    {expanded ? "Hide" : "Details"}
                                  </button>
                                </td>
                              </tr>
                              {expanded ? (
                                <tr className="border-t border-[#ede4d4] bg-[#fbfaf6]">
                                  <td colSpan={7} className="min-w-0 px-3 py-4 sm:px-5">
                                    <OrderExpandedContent
                                      order={order}
                                      loadingId={loadingId}
                                      detailError={detailError}
                                      expandedId={expandedId}
                                      detailsById={detailsById}
                                    />
                                  </td>
                                </tr>
                              ) : null}
                            </Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6 space-y-4 lg:hidden">
                    {orders.map((order) => {
                      const expanded = expandedId === order.id;
                      return (
                        <article key={order.id} className="min-w-0 rounded-[20px] border border-[#ede4d4] bg-white p-4">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-semibold" title={order.id}>{order.id}</p>
                              <p className="mt-1 text-[14px] text-[#83957c]">{formatOrderDate(order.createdAt)}</p>
                            </div>
                            <StatusChip status={order.status} />
                          </div>
                          <p className="mt-3 truncate text-[15px]" title={order.email}>{order.email}</p>
                          {order.customerNote ? (
                            <p className="mt-2 line-clamp-2 text-[14px] text-[#83957c]" title={order.customerNote}>
                              Note: {order.customerNote}
                            </p>
                          ) : null}
                          <p className="mt-2">
                            <MarketingOptInLabel optedIn={order.marketingOptIn} />
                          </p>
                          <div className="mt-3 flex justify-between gap-2 text-[15px]">
                            <span className="text-[#83957c]">
                              {order.itemCount} item{order.itemCount === 1 ? "" : "s"}
                            </span>
                            <span className="shrink-0 font-semibold tabular-nums">{formatPaise(order.totalPaise)}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleOrder(order.id)}
                            className="mt-4 text-[#314e24] underline-offset-2 hover:underline"
                          >
                            {expanded ? "Hide details" : "View details"}
                          </button>
                          {expanded ? (
                            <OrderExpandedContent
                              order={order}
                              loadingId={loadingId}
                              detailError={detailError}
                              expandedId={expandedId}
                              detailsById={detailsById}
                            />
                          ) : null}
                        </article>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          ) : null}

          {activeTab === "inventory" ? (
            <>
              <h2 className="mt-10 font-sans text-[22px] font-semibold sm:text-[26px]">Inventory</h2>
              <p className="mt-2 text-[15px] text-[#83957c] sm:text-[16px]">
                Set products out of stock to block new purchases immediately.
              </p>
              {stockError ? (
                <p className="mt-3 rounded-xl border border-[#f0d4d1] bg-[#fdf5f4] px-4 py-3 text-[14px] text-[#c4554a]">
                  {stockError}
                </p>
              ) : null}
              <div className="mt-6 hidden max-w-full overflow-hidden rounded-[20px] border border-[#ede4d4] bg-white lg:block">
                <table className="w-full table-fixed text-left text-[14px] sm:text-[15px]">
                  <thead className="bg-[#fbfaf6] text-[12px] uppercase tracking-wide text-[#83957c] sm:text-[13px]">
                    <tr>
                      <th className="w-[36%] px-3 py-3 font-semibold sm:px-4 sm:py-4 lg:px-5">Product</th>
                      <th className="w-[24%] whitespace-nowrap px-3 py-3 font-semibold sm:px-4 sm:py-4 lg:px-5">Category</th>
                      <th className="w-[14%] whitespace-nowrap px-3 py-3 text-right font-semibold sm:px-4 sm:py-4 lg:px-5">Price</th>
                      <th className="w-[12%] whitespace-nowrap px-3 py-3 font-semibold sm:px-4 sm:py-4 lg:px-5">Status</th>
                      <th className="w-[14%] whitespace-nowrap px-3 py-3 text-right font-semibold sm:px-4 sm:py-4 lg:px-5">In stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryByCategory.map((product) => {
                      const saving = Boolean(savingStockBySlug[product.slug]);
                      return (
                        <tr key={product.slug} className="border-t border-[#ede4d4] align-top">
                          <td className="min-w-0 px-3 py-3 sm:px-4 sm:py-4 lg:px-5">
                            <p className="truncate font-medium" title={product.name}>
                              {product.name}
                            </p>
                            <p className="mt-1 truncate text-[13px] text-[#83957c]" title={product.slug}>
                              {product.slug}
                            </p>
                          </td>
                          <td className="px-3 py-3 sm:px-4 sm:py-4 lg:px-5">
                            <p className="truncate" title={product.category}>
                              {product.category}
                            </p>
                          </td>
                          <td className="px-3 py-3 text-right tabular-nums sm:px-4 sm:py-4 lg:px-5">
                            {formatInr(product.price)}
                          </td>
                          <td className="px-3 py-3 sm:px-4 sm:py-4 lg:px-5">
                            <StockChip inStock={product.inStock} />
                          </td>
                          <td className="px-3 py-3 text-right sm:px-4 sm:py-4 lg:px-5">
                            <div className="flex w-full items-center justify-end gap-2">
                              <StockToggle
                                checked={product.inStock}
                                disabled={saving}
                                onToggle={() => setProductStock(product.slug, !product.inStock)}
                              />
                              <span className="min-w-[70px] text-right text-[13px] text-[#83957c]">
                                {saving ? "Saving…" : product.inStock ? "On" : "Off"}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 space-y-4 lg:hidden">
                {inventoryByCategory.map((product) => {
                  const saving = Boolean(savingStockBySlug[product.slug]);
                  return (
                    <article key={product.slug} className="min-w-0 rounded-[20px] border border-[#ede4d4] bg-white p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold" title={product.name}>
                            {product.name}
                          </p>
                          <p className="mt-1 text-[14px] text-[#83957c]">
                            {product.category} · {formatInr(product.price)}
                          </p>
                        </div>
                        <StockChip inStock={product.inStock} />
                      </div>
                      <p className="mt-2 truncate text-[13px] text-[#83957c]" title={product.slug}>
                        {product.slug}
                      </p>
                      <div className="mt-4 inline-flex items-center gap-2">
                        <StockToggle
                          checked={product.inStock}
                          disabled={saving}
                          onToggle={() => setProductStock(product.slug, !product.inStock)}
                        />
                        <span className="text-[13px] text-[#83957c]">
                          {saving ? "Saving…" : product.inStock ? "In stock" : "Out of stock"}
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          ) : null}
        </div>
      </PageEntrance>
    </div>
  );
}
