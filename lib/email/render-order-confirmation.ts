import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { OrderConfirmationDetails } from "@/lib/db/orders";
import { emailTheme as t } from "@/lib/email/email-theme";
import { getSiteUrl } from "@/lib/env";
import { formatInr } from "@/lib/money";
import { packageSizeLabel } from "@/lib/products/package-sizes";

const TEMPLATE_PATH = join(process.cwd(), "emails", "order-confirmation.html");

type RenderOrderConfirmationOptions = {
  resolveAssetSrc?: (assetPath: string) => string | null;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function paiseToInr(paise: number): string {
  return formatInr(paise / 100);
}

function formatOrderDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

function formatDeliveryAddress(order: OrderConfirmationDetails): string {
  const { address: a } = order;
  const lines = [
    `${a.firstName} ${a.lastName}`,
    a.addressLine1,
    a.addressLine2,
    `${a.city}, ${a.state} ${a.postalCode}`,
    a.country,
  ].filter(Boolean) as string[];
  return lines.map(escapeHtml).join("<br />");
}

function publicAssetPathFromUrl(imageUrl: string): string {
  return imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
}

function productImageSrc(
  siteUrl: string,
  imageUrl: string | null,
  resolveAssetSrc?: (assetPath: string) => string | null,
): string | null {
  if (!imageUrl?.trim()) return null;
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) return imageUrl;
  const assetPath = publicAssetPathFromUrl(imageUrl);
  const resolved = resolveAssetSrc?.(assetPath);
  return resolved ?? `${siteUrl}${assetPath}`;
}

function renderItemRows(
  items: OrderConfirmationDetails["items"],
  siteUrl: string,
  resolveAssetSrc?: (assetPath: string) => string | null,
): string {
  return items
    .map((item) => {
      const name = escapeHtml(item.name);
      const variant = escapeHtml(packageSizeLabel(item.variant));
      const lineTotal = paiseToInr(item.lineTotalPaise);
      const qty = item.quantity;
      const imgSrc = productImageSrc(siteUrl, item.imageUrl, resolveAssetSrc);
      const imageCell = imgSrc
        ? `<img src="${escapeHtml(imgSrc)}" width="64" height="64" alt="" class="bg-pouch" style="width: 64px; height: 64px; background-color: ${t.pouchBg}; border-radius: 6px; object-fit: contain;" />`
        : `<div class="bg-pouch" style="width: 64px; height: 64px; background-color: ${t.pouchBg}; border-radius: 6px;"></div>`;

      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px; font-family: ${t.fontBody};">
                <tr>
                  <td width="72" valign="top" style="padding-right: 12px;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>${imageCell}</td>
                      </tr>
                      <tr>
                        <td align="center" style="padding-top: 6px;">
                          <span class="badge-qty" style="display: inline-block; min-width: 20px; height: 20px; line-height: 20px; padding: 0 4px; border-radius: 9999px; background-color: #6b6b6b; color: #ffffff; font-size: 12px; text-align: center;">${qty}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td valign="top" class="text-primary" style="color: ${t.forest};">
                    <p style="margin: 0 0 4px; font-size: 16px; font-weight: 500; color: ${t.forest};">${name}</p>
                    <p class="text-subtle" style="margin: 0; font-size: 13px; color: ${t.subtle};">${variant}</p>
                  </td>
                  <td valign="top" align="right" class="text-primary" style="white-space: nowrap; font-size: 15px; color: ${t.forest};">${lineTotal}</td>
                </tr>
              </table>`;
    })
    .join("\n                ");
}

function renderOrderNoteSection(order: OrderConfirmationDetails): string {
  const note = order.customerNote?.trim();
  if (!note) return "";
  const body = escapeHtml(note).replace(/\n/g, "<br />");
  return `<!-- Order note -->
            <tr>
              <td style="padding: 0 32px 8px;">
                <p class="text-primary" style="margin: 0; font-family: ${t.fontBody}; font-size: 13px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: ${t.forest};">
                  Order note
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 0 32px 32px;">
                <table role="presentation" class="bg-panel border-theme" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${t.checkoutBg}; border: 1px solid ${t.border}; border-radius: 6px;">
                  <tr>
                    <td class="text-primary" style="padding: 16px 18px; font-family: ${t.fontBody}; font-size: 15px; line-height: 1.6; color: ${t.forest};">
                      ${body}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>`;
}

function renderDiscountSection(order: OrderConfirmationDetails): string {
  if (order.discountPaise <= 0) return "";
  const label = order.discountCode ? escapeHtml(order.discountCode) : "Discount";
  const amount = `-${paiseToInr(order.discountPaise)}`;
  return `<tr>
                    <td class="text-primary" style="padding: 8px 0; color: ${t.forest};">${label}</td>
                    <td class="text-primary" align="right" style="padding: 8px 0; color: ${t.forest};">${amount}</td>
                  </tr>`;
}

export function renderOrderConfirmationEmail(
  order: OrderConfirmationDetails,
  options?: RenderOrderConfirmationOptions,
): string {
  const siteUrl = getSiteUrl();
  const logoSrc = options?.resolveAssetSrc?.("/images/logo.png") ?? `${siteUrl}/images/logo.png`;
  let html = loadTemplate();
  const itemCount = order.items.reduce((sum, line) => sum + line.quantity, 0);

  const replacements: Record<string, string> = {
    "{{SITE_URL}}": siteUrl,
    "{{LOGO_SRC}}": escapeHtml(logoSrc),
    "{{FIRST_NAME}}": escapeHtml(order.address.firstName),
    "{{ORDER_ID}}": escapeHtml(order.id),
    "{{ORDER_DATE}}": escapeHtml(formatOrderDate(order.createdAt)),
    "{{ITEM_ROWS}}": renderItemRows(order.items, siteUrl, options?.resolveAssetSrc),
    "{{ITEM_COUNT}}": String(itemCount),
    "{{SUBTOTAL}}": paiseToInr(order.subtotalPaise),
    "{{DISCOUNT_SECTION}}": renderDiscountSection(order),
    "{{SHIPPING}}": order.shippingPaise === 0 ? "Free" : paiseToInr(order.shippingPaise),
    "{{TOTAL}}": paiseToInr(order.totalPaise),
    "{{ORDER_NOTE_SECTION}}": renderOrderNoteSection(order),
    "{{DELIVERY_ADDRESS}}": formatDeliveryAddress(order),
  };

  for (const [token, value] of Object.entries(replacements)) {
    html = html.split(token).join(value);
  }

  return html;
}

export function orderConfirmationSubject(orderId: string): string {
  return `Your InstaMealz order is confirmed (${orderId})`;
}

function loadTemplate(): string {
  return readFileSync(TEMPLATE_PATH, "utf8");
}

export function renderOrderConfirmationPlainText(order: OrderConfirmationDetails): string {
  const itemCount = order.items.reduce((sum, line) => sum + line.quantity, 0);
  const lines = [
    `Hi ${order.address.firstName},`,
    "",
    "Thank you — your payment was successful. We will prepare your meals for delivery.",
    "",
    `Order ID: ${order.id}`,
    `Placed on: ${formatOrderDate(order.createdAt)}`,
    "",
    "Your order:",
    ...order.items.flatMap((item) => [
      `- ${item.name} (${item.variant}) × ${item.quantity} — ${paiseToInr(item.lineTotalPaise)}`,
    ]),
    "",
    `Subtotal · ${itemCount} items: ${paiseToInr(order.subtotalPaise)}`,
    ...(order.discountPaise > 0
      ? [`Discount${order.discountCode ? ` (${order.discountCode})` : ""}: -${paiseToInr(order.discountPaise)}`]
      : []),
    `Shipping: ${order.shippingPaise === 0 ? "Free" : paiseToInr(order.shippingPaise)}`,
    `Total (INR): ${paiseToInr(order.totalPaise)}`,
    ...(order.customerNote?.trim()
      ? ["", "Order note:", order.customerNote.trim()]
      : []),
    "",
    "Delivery address:",
    formatDeliveryAddress(order).replace(/<br \/>/g, "\n"),
    "",
    "Questions? Email info@instamealz.in",
    "",
    "— InstaMealz",
  ];
  return lines.join("\n");
}
