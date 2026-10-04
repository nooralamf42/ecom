import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import { formatPrice } from "@/lib/format";
import { textOn } from "@/lib/settings/color";
import type { IdentitySettings, ThemeSettings } from "@/lib/settings/schema";

export const ORDER_EMAIL_KINDS = ["confirmed", "shipped", "delivered", "refunded"] as const;
export type OrderEmailKind = (typeof ORDER_EMAIL_KINDS)[number];

export type OrderEmailData = {
  number: number;
  createdAt: Date;
  items: { name: string; size: string | null; quantity: number; price: number; image: string | null }[];
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  shipName: string;
  shipPhone: string;
  shipLine1: string;
  shipLine2: string | null;
  shipCity: string;
  shipState: string;
  shipPincode: string;
  courierName: string | null;
  awbCode: string | null;
  trackingUrl: string | null;
};

export type OrderEmailProps = {
  kind: OrderEmailKind;
  order: OrderEmailData;
  identity: IdentitySettings;
  theme: ThemeSettings;
  /** Absolute link that opens the order (works without an account). */
  orderUrl: string;
  siteUrl: string;
  deliveryEstimate: string;
  returnWindowDays: number;
  /** Refund emails: the amount refunded this time (paise). */
  refundAmount?: number;
};

function copyFor(p: OrderEmailProps, firstName: string) {
  const { order, deliveryEstimate, returnWindowDays, refundAmount = 0 } = p;
  switch (p.kind) {
    case "confirmed":
      return {
        eyebrow: "Order confirmed",
        heading: `Thank you, ${firstName}!`,
        intro: `We've received your payment and are getting your order ready.${
          deliveryEstimate ? ` It usually arrives in ${deliveryEstimate} after it ships.` : ""
        } We'll keep you posted on the way.`,
        preview: `Order #${order.number} confirmed · ${formatPrice(order.total)}`,
        totalLabel: "Total paid",
      };
    case "shipped":
      return {
        eyebrow: "On its way",
        heading: `Your order has shipped, ${firstName}!`,
        intro: `Good news — order #${order.number} has left us${
          order.courierName ? ` with ${order.courierName}` : ""
        }.${deliveryEstimate ? ` Most orders arrive within ${deliveryEstimate}.` : ""}`,
        preview: `Order #${order.number} is on its way`,
        totalLabel: "Total paid",
      };
    case "delivered":
      return {
        eyebrow: "Delivered",
        heading: "Your order has arrived!",
        intro: `Order #${order.number} has been delivered. We hope you love it.${
          returnWindowDays > 0
            ? ` If anything isn't right, let us know within ${returnWindowDays} days and we'll make it right.`
            : ""
        }`,
        preview: `Order #${order.number} has been delivered`,
        totalLabel: "Total paid",
      };
    case "refunded":
      return {
        eyebrow: "Refund issued",
        heading: `We've refunded ${formatPrice(refundAmount)}`,
        intro: `We've issued a refund of ${formatPrice(refundAmount)} for order #${order.number} to your original payment method. Banks usually take 5–7 business days to show it on your statement.`,
        preview: `Refund of ${formatPrice(refundAmount)} for order #${order.number}`,
        totalLabel: "Order total",
      };
  }
}

/*
 * Customer emails for an order: confirmation, shipped, delivered, refund.
 * Styles are inline (email clients ignore stylesheets) and colors come from
 * the store theme. Gmail and Outlook don't show SVG logos — use PNG/JPG.
 */
export function OrderEmail(props: OrderEmailProps) {
  const { kind, order, identity, theme, orderUrl, siteUrl } = props;
  const firstName = order.shipName.trim().split(/\s+/)[0] || "there";
  const copy = copyFor(props, firstName);
  const buttonText = textOn(theme.primary, "#ffffff", theme.foreground);
  const muted = "#6b6b76";
  const border = "#ececf0";
  const placed = order.createdAt.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const primaryButton =
    kind === "shipped" && order.trackingUrl
      ? { href: order.trackingUrl, label: "Track your package" }
      : kind === "delivered"
        ? { href: orderUrl, label: "Review your order" }
        : { href: orderUrl, label: "View your order" };

  return (
    <Html lang="en">
      <Head />
      <Preview>{`${copy.preview} · ${identity.storeName}`}</Preview>
      <Body style={{ margin: 0, backgroundColor: theme.background, fontFamily: "Helvetica, Arial, sans-serif", color: theme.foreground }}>
        <Container style={{ maxWidth: 560, margin: "0 auto", padding: "32px 16px" }}>
          {/* Brand */}
          <Section style={{ textAlign: "center", paddingBottom: 24 }}>
            <Link href={siteUrl} style={{ textDecoration: "none", color: theme.foreground }}>
              {identity.logoUrl ? (
                <Img src={identity.logoUrl} alt={identity.storeName} height={40} style={{ margin: "0 auto", maxWidth: 180 }} />
              ) : (
                <Text style={{ margin: 0, fontSize: 24, fontWeight: 700, color: theme.primary }}>{identity.storeName}</Text>
              )}
            </Link>
          </Section>

          <Section style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: "32px 28px", border: `1px solid ${border}` }}>
            <Text style={{ margin: 0, fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: theme.primary }}>
              {copy.eyebrow}
            </Text>
            <Heading as="h1" style={{ margin: "8px 0 0", fontSize: 26, lineHeight: "32px", color: theme.foreground }}>
              {copy.heading}
            </Heading>
            <Text style={{ margin: "12px 0 0", fontSize: 15, lineHeight: "24px", color: muted }}>{copy.intro}</Text>

            <Section style={{ margin: "24px 0 0", backgroundColor: theme.background, borderRadius: 12, padding: "14px 16px" }}>
              <Row>
                <Column>
                  <Text style={{ margin: 0, fontSize: 12, color: muted }}>Order number</Text>
                  <Text style={{ margin: "2px 0 0", fontSize: 16, fontWeight: 700 }}>#{order.number}</Text>
                </Column>
                <Column align="right">
                  {kind === "shipped" && order.awbCode ? (
                    <>
                      <Text style={{ margin: 0, fontSize: 12, color: muted }}>{order.courierName ?? "Tracking number"}</Text>
                      <Text style={{ margin: "2px 0 0", fontSize: 16, fontWeight: 700 }}>{order.awbCode}</Text>
                    </>
                  ) : (
                    <>
                      <Text style={{ margin: 0, fontSize: 12, color: muted }}>Placed on</Text>
                      <Text style={{ margin: "2px 0 0", fontSize: 16, fontWeight: 700 }}>{placed}</Text>
                    </>
                  )}
                </Column>
              </Row>
            </Section>

            <Section style={{ textAlign: "center", margin: "28px 0 4px" }}>
              <Button
                href={primaryButton.href}
                style={{
                  backgroundColor: theme.primary,
                  color: buttonText,
                  borderRadius: 999,
                  padding: "14px 28px",
                  fontSize: 15,
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                {primaryButton.label}
              </Button>
              {primaryButton.href !== orderUrl && (
                <Text style={{ margin: "12px 0 0", fontSize: 13 }}>
                  <Link href={orderUrl} style={{ color: muted, textDecoration: "underline" }}>
                    View your order
                  </Link>
                </Text>
              )}
            </Section>

            <Hr style={{ borderColor: border, margin: "28px 0 20px" }} />

            {/* Items */}
            <Text style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 700 }}>Items</Text>
            {order.items.map((item, i) => (
              <Row key={i} style={{ marginBottom: 12 }}>
                <Column style={{ width: 64, verticalAlign: "top" }}>
                  {item.image?.startsWith("https://") ? (
                    <Img src={item.image} alt="" width={56} height={56} style={{ borderRadius: 10, objectFit: "cover", border: `1px solid ${border}` }} />
                  ) : (
                    <div style={{ width: 56, height: 56, borderRadius: 10, backgroundColor: theme.background }} />
                  )}
                </Column>
                <Column style={{ verticalAlign: "top" }}>
                  <Text style={{ margin: 0, fontSize: 14, fontWeight: 600, lineHeight: "20px" }}>{item.name}</Text>
                  <Text style={{ margin: "2px 0 0", fontSize: 13, color: muted }}>
                    {item.size ? `Size ${item.size} · ` : ""}Qty {item.quantity}
                  </Text>
                </Column>
                <Column align="right" style={{ verticalAlign: "top", width: 90 }}>
                  <Text style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{formatPrice(item.price * item.quantity)}</Text>
                </Column>
              </Row>
            ))}

            <Hr style={{ borderColor: border, margin: "8px 0 16px" }} />

            {/* Totals */}
            <TotalRow label="Subtotal" value={formatPrice(order.subtotal)} muted={muted} />
            {order.discount > 0 && (
              <TotalRow label="Discount" value={`− ${formatPrice(order.discount)}`} muted={muted} accent={theme.primary} />
            )}
            <TotalRow
              label="Shipping"
              value={order.shippingCost === 0 ? "Free" : formatPrice(order.shippingCost)}
              muted={muted}
            />
            <Row style={{ marginTop: 8 }}>
              <Column>
                <Text style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>{copy.totalLabel}</Text>
              </Column>
              <Column align="right">
                <Text style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>{formatPrice(order.total)}</Text>
              </Column>
            </Row>
            {kind === "refunded" && (
              <Row style={{ marginTop: 6 }}>
                <Column>
                  <Text style={{ margin: 0, fontSize: 15, fontWeight: 700, color: theme.primary }}>Refunded</Text>
                </Column>
                <Column align="right">
                  <Text style={{ margin: 0, fontSize: 15, fontWeight: 700, color: theme.primary }}>
                    − {formatPrice(props.refundAmount ?? 0)}
                  </Text>
                </Column>
              </Row>
            )}

            {kind !== "refunded" && (
              <>
                <Hr style={{ borderColor: border, margin: "20px 0" }} />
                <Text style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 700 }}>
                  {kind === "delivered" ? "Delivered to" : "Shipping to"}
                </Text>
                <Text style={{ margin: 0, fontSize: 14, lineHeight: "22px", color: muted }}>
                  {order.shipName}
                  <br />
                  {order.shipLine1}
                  {order.shipLine2 ? `, ${order.shipLine2}` : ""}
                  <br />
                  {order.shipCity}, {order.shipState} {order.shipPincode}
                  <br />
                  {order.shipPhone}
                </Text>
              </>
            )}
          </Section>

          {/* Help + footer */}
          <Section style={{ textAlign: "center", padding: "24px 12px 0" }}>
            <Text style={{ margin: 0, fontSize: 13, lineHeight: "20px", color: muted }}>
              {/* Replies only reach the store when a contact email is set (it's the reply-to). */}
              {identity.contactEmail ? (
                <>
                  Questions about your order? Just reply to this email
                  {identity.contactPhone ? ` or call us on ${identity.contactPhone}` : ""}.
                </>
              ) : identity.contactPhone ? (
                <>Questions about your order? Call us on {identity.contactPhone}.</>
              ) : (
                <>
                  Questions about your order?{" "}
                  <Link href={`${siteUrl}/contact`} style={{ color: muted, textDecoration: "underline" }}>
                    Contact us
                  </Link>
                  .
                </>
              )}
            </Text>
            <Text style={{ margin: "16px 0 0", fontSize: 12, lineHeight: "18px", color: muted }}>
              <Link href={`${siteUrl}/shipping-policy`} style={{ color: muted, textDecoration: "underline" }}>
                Shipping policy
              </Link>
              {"  ·  "}
              <Link href={`${siteUrl}/refund-policy`} style={{ color: muted, textDecoration: "underline" }}>
                Returns &amp; refunds
              </Link>
              {"  ·  "}
              <Link href={siteUrl} style={{ color: muted, textDecoration: "underline" }}>
                Visit store
              </Link>
            </Text>
            <Text style={{ margin: "12px 0 0", fontSize: 12, color: muted }}>
              © {new Date().getFullYear()} {identity.storeName}
              {identity.address ? ` · ${identity.address}` : ""}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

function TotalRow({ label, value, muted, accent }: { label: string; value: string; muted: string; accent?: string }) {
  return (
    <Row style={{ marginBottom: 6 }}>
      <Column>
        <Text style={{ margin: 0, fontSize: 14, color: accent ?? muted }}>{label}</Text>
      </Column>
      <Column align="right">
        <Text style={{ margin: 0, fontSize: 14, color: accent }}>{value}</Text>
      </Column>
    </Row>
  );
}
