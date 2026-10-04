import { after } from "next/server";
import { Resend } from "resend";
import { render } from "@react-email/components";
import { db, hasDatabase } from "@/lib/db";
import { getSettings, siteBaseUrl } from "@/lib/settings";
import { orderLinkToken } from "@/lib/order-access";
import { OrderEmail, type OrderEmailKind } from "./order-email";
import type { IdentitySettings } from "@/lib/settings/schema";

export type { OrderEmailKind } from "./order-email";

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

const SUBJECTS: Record<OrderEmailKind, (n: number, store: string) => string> = {
  confirmed: (n, s) => `Order #${n} confirmed — ${s}`,
  shipped: (n, s) => `Order #${n} has shipped — ${s}`,
  delivered: (n, s) => `Order #${n} delivered — ${s}`,
  refunded: (n, s) => `Refund for order #${n} — ${s}`,
};

type SendOptions = {
  /** Refund emails: amount refunded this time (paise) and the refund's id. */
  refundAmount?: number;
  refundId?: string;
  /** Sent by an admin on purpose: skip the duplicate guard. */
  manual?: boolean;
};

/**
 * Email the customer about their order and record the outcome on the order
 * (emailsSent / emailError, shown in the admin). Automatic sends carry an
 * idempotency key so Resend drops duplicates within 24 hours.
 */
export async function sendOrderEmail(
  orderId: string,
  kind: OrderEmailKind,
  opts: SendOptions = {},
): Promise<void> {
  if (!resend) throw new Error("Email isn't set up (RESEND_API_KEY is missing).");
  if (!hasDatabase) return;

  const [order, settings] = await Promise.all([
    db.order.findUnique({ where: { id: orderId }, include: { items: true } }),
    getSettings(),
  ]);
  if (!order) return;

  const { identity, theme, commerce } = settings;
  const siteUrl = siteBaseUrl(settings);
  const element = OrderEmail({
    kind,
    order,
    identity,
    theme,
    orderUrl: orderLink(siteUrl, order.number),
    siteUrl,
    deliveryEstimate: commerce.deliveryEstimate,
    returnWindowDays: commerce.returnWindowDays,
    refundAmount: opts.refundAmount ?? order.refundedAmount,
  });

  const baseKey = `order-${kind}/${order.id}${opts.refundId ? `/${opts.refundId}` : ""}`;
  const idempotencyKey = opts.manual ? `${baseKey}/manual-${Date.now()}` : baseKey;

  try {
    const [html, text] = await Promise.all([render(element), render(element, { plainText: true })]);
    const { error } = await resend.emails.send(
      {
        from: fromHeader(identity),
        to: order.email,
        ...(identity.contactEmail ? { replyTo: identity.contactEmail } : {}),
        subject: SUBJECTS[kind](order.number, identity.storeName),
        html,
        text,
      },
      { idempotencyKey },
    );
    if (error) throw new Error(error.message);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await db.order
      .update({ where: { id: order.id }, data: { emailError: `${kind}: ${message}`.slice(0, 300) } })
      .catch(() => {});
    throw err;
  }

  await db.order.update({
    where: { id: order.id },
    data: {
      emailError: null,
      ...(order.emailsSent.includes(kind) ? {} : { emailsSent: { push: kind } }),
    },
  });
}

/**
 * Send an order email after the current response finishes, so a slow email
 * service never delays the customer. Must run inside a request (Route
 * Handler, Server Action or Server Component). No-op without Resend.
 */
export function queueOrderEmail(orderId: string, kind: OrderEmailKind, opts: SendOptions = {}): void {
  if (!emailEnabled) return;
  after(() =>
    sendOrderEmail(orderId, kind, opts).catch((err) =>
      console.error(`Order ${orderId}: ${kind} email failed`, err),
    ),
  );
}
