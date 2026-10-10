import { Resend } from "resend";
import { getOrderConfirmationDetails } from "@/lib/db/orders";
import { getResendConfig, isOrderEmailConfigured } from "@/lib/env";
import {
  orderConfirmationSubject,
  renderOrderConfirmationEmail,
  renderOrderConfirmationPlainText,
} from "@/lib/email/render-order-confirmation";

export type SendOrderConfirmationResult =
  | { status: "sent"; to: string; orderId: string }
  | { status: "skipped"; reason: "not_configured" }
  | { status: "failed"; orderId: string; error: string };

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
    const subject = orderConfirmationSubject(order.id);
    const html = renderOrderConfirmationEmail(order);
    const text = renderOrderConfirmationPlainText(order);

    const { error } = await resend.emails.send({
      from,
      to: order.email,
      subject,
      html,
      text,
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
