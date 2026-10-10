import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { Resend, type Attachment } from "resend";
import { getOrderConfirmationDetails, type OrderConfirmationDetails } from "@/lib/db/orders";
import { getResendConfig, isOrderEmailConfigured } from "@/lib/env";
import {
  orderConfirmationSubject,
  renderOrderConfirmationEmail,
  renderOrderConfirmationPlainText,
} from "@/lib/email/render-order-confirmation";

const PUBLIC_DIR = join(process.cwd(), "public");
const EMAIL_LOGO_PATH = "/images/logo.png";

export type SendOrderConfirmationResult =
  | { status: "sent"; to: string; orderId: string }
  | { status: "skipped"; reason: "not_configured" }
  | { status: "failed"; orderId: string; error: string };

function normalizeLocalAssetPath(imageUrl: string | null): string | null {
  const value = imageUrl?.trim();
  if (!value) return null;
  if (value.startsWith("http://") || value.startsWith("https://")) return null;
  const assetPath = value.startsWith("/") ? value : `/${value}`;
  if (assetPath.includes("..")) return null;
  return assetPath;
}

function contentTypeForPath(assetPath: string): string | undefined {
  const ext = extname(assetPath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  if (ext === ".svg") return "image/svg+xml";
  return undefined;
}

function contentIdForPath(assetPath: string): string {
  const slug = assetPath.replace(/^\/+/, "").replace(/[^a-zA-Z0-9._-]/g, "-");
  return `instamealz-${slug}`;
}

async function prepareInlineAssets(order: OrderConfirmationDetails): Promise<{
  attachments: Attachment[];
  resolveAssetSrc: (assetPath: string) => string | null;
}> {
  const assetPaths = new Set<string>([EMAIL_LOGO_PATH]);
  for (const item of order.items) {
    const assetPath = normalizeLocalAssetPath(item.imageUrl);
    if (assetPath) {
      assetPaths.add(assetPath);
    }
  }

  const attachments: Attachment[] = [];
  const inlineSrcByAssetPath = new Map<string, string>();

  for (const assetPath of assetPaths) {
    const relativePath = assetPath.replace(/^\/+/, "");
    const absolutePath = join(PUBLIC_DIR, relativePath);
    try {
      const content = await readFile(absolutePath);
      const contentId = contentIdForPath(assetPath);
      attachments.push({
        filename: relativePath.split("/").pop() || "asset",
        content,
        contentType: contentTypeForPath(assetPath),
        contentId,
      });
      inlineSrcByAssetPath.set(assetPath, `cid:${contentId}`);
    } catch {
      console.warn("[order-confirmation-email] inline asset missing", { assetPath });
    }
  }

  return {
    attachments,
    resolveAssetSrc: (assetPath: string) => inlineSrcByAssetPath.get(assetPath) ?? null,
  };
}

/**
 * Sends the branded confirmation email after payment is verified and the order is marked completed.
 */
export async function sendOrderConfirmationEmail(orderId: string): Promise<SendOrderConfirmationResult> {
  if (!isOrderEmailConfigured()) {
    console.warn(
      "[order-confirmation-email] skipped — add RESEND_API_KEY and EMAIL_FROM to your .env.*.local file",
    );
    return { status: "skipped", reason: "not_configured" };
  }

  const order = await getOrderConfirmationDetails(orderId);
  if (!order) {
    const error = `Order not found for confirmation email: ${orderId}`;
    return { status: "failed", orderId, error };
  }

  if (order.items.length === 0) {
    const error = `Order ${orderId} has no line items for confirmation email`;
    return { status: "failed", orderId, error };
  }

  try {
    const { apiKey, from } = getResendConfig();
    const resend = new Resend(apiKey);
    const { attachments, resolveAssetSrc } = await prepareInlineAssets(order);
    const subject = orderConfirmationSubject(order.id);
    const html = renderOrderConfirmationEmail(order, { resolveAssetSrc });
    const text = renderOrderConfirmationPlainText(order);

    const { error } = await resend.emails.send({
      from,
      to: order.email,
      subject,
      html,
      text,
      attachments: attachments.length ? attachments : undefined,
    });

    if (error) {
      return { status: "failed", orderId, error: error.message };
    }

    console.info("[order-confirmation-email] sent", { orderId: order.id, to: order.email });
    return { status: "sent", to: order.email, orderId: order.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown Resend error";
    return { status: "failed", orderId, error: message };
  }
}
