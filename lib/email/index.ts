import { Resend } from "resend";
import { render } from "@react-email/components";
import { db, hasDatabase } from "@/lib/db";
import { getSettings, siteBaseUrl } from "@/lib/settings";
import { orderLinkToken } from "@/lib/order-access";
import { OrderConfirmationEmail } from "./order-confirmation-email";
import type { IdentitySettings } from "@/lib/settings/schema";

export const emailEnabled = Boolean(process.env.RESEND_API_KEY);

const resend = emailEnabled ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * "Store Name <address>". The name is always the store name from Settings;
 * the address comes from Settings → Store & SEO → Order emails, then the
 * EMAIL_FROM env var, then Resend's test sender (which only delivers to the
 * Resend account owner's own email).
 */
export function fromHeader(identity: IdentitySettings): string {
  const envAddress = process.env.EMAIL_FROM?.match(/<([^>]+)>/)?.[1] ?? process.env.EMAIL_FROM;
  const address = identity.emailFromAddress || envAddress?.trim() || "onboarding@resend.dev";
  const name = identity.storeName.replace(/["<>\r\n]/g, "").trim() || "Store";
  return `"${name}" <${address}>`;
}

/** Link in emails that opens the order on any device (falls back to the order page). */
export function orderLink(siteUrl: string, orderNumber: number): string {
  const token = orderLinkToken(orderNumber);
  return token
    ? `${siteUrl}/orders/${orderNumber}/open?t=${token}`
    : `${siteUrl}/orders/${orderNumber}`;
}

/**
 * Email the customer their order confirmation. Called once, when the order
 * moves to PAID; the idempotency key also stops Resend from sending a
 * duplicate if it is ever called twice within 24 hours.
 */
export async function sendOrderConfirmation(orderId: string): Promise<void> {
  if (!resend || !hasDatabase) return;

  const [order, settings] = await Promise.all([
    db.order.findUnique({ where: { id: orderId }, include: { items: true } }),
    getSettings(),
  ]);
  if (!order) return;

  const { identity, theme, commerce } = settings;
  const siteUrl = siteBaseUrl(settings);
  const element = OrderConfirmationEmail({
    order,
    identity,
    theme,
    orderUrl: orderLink(siteUrl, order.number),
    siteUrl,
    deliveryEstimate: commerce.deliveryEstimate,
  });

  const [html, text] = await Promise.all([render(element), render(element, { plainText: true })]);

  const { error } = await resend.emails.send(
    {
      from: fromHeader(identity),
      to: order.email,
      ...(identity.contactEmail ? { replyTo: identity.contactEmail } : {}),
      subject: `Order #${order.number} confirmed — ${identity.storeName}`,
      html,
      text,
    },
    { idempotencyKey: `order-confirmation/${order.id}` },
  );
  if (error) throw new Error(`Resend: ${error.message}`);
}
