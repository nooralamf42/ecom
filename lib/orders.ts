import { db, hasDatabase } from "./db";
import { getDbUser, isAdmin } from "./current-user";
import { getGuestOrderNumbers, getVerifiedEmails } from "./order-access";
import {
  assignAwb,
  createShiprocketOrder,
  generateLabel,
  shiprocketEnabled,
  trackShipment,
  trackingUrlFor,
} from "./shiprocket";
import type { OrderStatus } from "@prisma/client";

/** Map Shiprocket's free-text courier status onto our own order lifecycle. */
function mapCourierStatus(currentStatus: string): OrderStatus | null {
  const s = currentStatus.toLowerCase();
  if (s.includes("deliver")) return "DELIVERED";
  if (s.includes("cancel") || s.includes("rto") || s.includes("undeliver")) return "CANCELLED";
  if (
    s.includes("transit") ||
    s.includes("picked up") ||
    s.includes("pickup complete") ||
    s.includes("out for delivery") ||
    s.includes("dispatch") ||
    s.includes("shipped")
  ) {
    return "SHIPPED";
  }
  return null; // still awaiting pickup — no change
}

const TERMINAL_STATUSES: OrderStatus[] = ["DELIVERED", "CANCELLED"];

/**
 * Check the courier's real tracking status for an order and update our own
 * status to match (e.g. move to SHIPPED once actually picked up, DELIVERED
 * once delivered). No-ops for orders without an AWB or already in a terminal
 * state. Safe to call often — failures are swallowed since this is a
 * best-effort background refresh, not a critical path.
 */
export async function syncOrderTracking(orderId: string): Promise<void> {
  if (!hasDatabase || !shiprocketEnabled) return;
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order?.awbCode || TERMINAL_STATUSES.includes(order.status)) return;

  try {
    const track = await trackShipment(order.awbCode);
    const mapped = mapCourierStatus(track.currentStatus);
    if (mapped && mapped !== order.status) {
      await db.order.update({ where: { id: orderId }, data: { status: mapped } });
    }
  } catch (err) {
    console.error("Shiprocket tracking sync failed", err);
  }
}

/** Conditions matching guest orders placed with one of these emails (any letter case). */
function guestOrdersForEmails(emails: string[]) {
  return emails.map((e) => ({ userId: null, email: { equals: e, mode: "insensitive" as const } }));
}

/**
 * Orders for "My orders".
 * - Signed in: the account's orders. Guest orders placed with one of their
 *   verified emails are attached first. Other guest orders remembered on this
 *   browser come back separately as `deviceOrders`, for the customer to add
 *   to their account themselves (on a shared computer they may not be theirs).
 * - Signed out: the guest orders remembered on this browser.
 */
export async function getMyOrders() {
  const empty = { orders: [], deviceOrders: [] };
  if (!hasDatabase) return empty;
  const [user, emails, guestNumbers] = await Promise.all([
    getDbUser(),
    getVerifiedEmails(),
    getGuestOrderNumbers(),
  ]);
  const include = { items: true } as const;
  const orderBy = { createdAt: "desc" } as const;

  if (!user) {
    if (guestNumbers.length === 0) return empty;
    const orders = await db.order.findMany({ where: { number: { in: guestNumbers } }, include, orderBy });
    return { orders, deviceOrders: [] };
  }

  if (emails.length > 0) {
    await db.order.updateMany({
      where: { OR: guestOrdersForEmails(emails) },
      data: { userId: user.id },
    });
  }
  const [orders, deviceOrders] = await Promise.all([
    db.order.findMany({ where: { userId: user.id }, include, orderBy }),
    guestNumbers.length > 0
      ? db.order.findMany({ where: { number: { in: guestNumbers }, userId: null }, include, orderBy })
      : [],
  ]);
  return { orders, deviceOrders };
}

/**
 * Attach guest orders remembered on this browser to the signed-in account.
 * Only numbers in this browser's signed cookie are accepted.
 */
export async function claimDeviceOrders(orderNumbers: number[]): Promise<number> {
  if (!hasDatabase) return 0;
  const [user, guestNumbers] = await Promise.all([getDbUser(), getGuestOrderNumbers()]);
  if (!user) return 0;
  const allowed = orderNumbers.filter((n) => guestNumbers.includes(n));
  if (allowed.length === 0) return 0;
  const { count } = await db.order.updateMany({
    where: { number: { in: allowed }, userId: null },
    data: { userId: user.id },
  });
  return count;
}

/** One order, or null if it doesn't exist or this visitor may not see it. */
export async function getOrderByNumber(number: number) {
  if (!hasDatabase || !Number.isInteger(number)) return null;
  const include = {
    items: { include: { product: { select: { slug: true } } } },
  } as const;

  let order = await db.order.findUnique({ where: { number }, include });
  if (!order) return null;

  // Check access before doing anything else with the order.
  const [user, admin, guestNumbers] = await Promise.all([
    getDbUser(),
    isAdmin(),
    getGuestOrderNumbers(),
  ]);
  const ownsIt = Boolean(user && order.userId === user.id);
  let emailMatch = false;
  if (!ownsIt && !order.userId && user) {
    emailMatch = (await getVerifiedEmails()).includes(order.email.toLowerCase());
    if (emailMatch) {
      await db.order.update({ where: { id: order.id }, data: { userId: user.id } });
    }
  }
  if (!admin && !ownsIt && !emailMatch && !guestNumbers.includes(number)) {
    return null;
  }

  if (order.awbCode && !TERMINAL_STATUSES.includes(order.status)) {
    await syncOrderTracking(order.id).catch(() => {});
    order = (await db.order.findUnique({ where: { number }, include })) ?? order;
  }
  return order;
}

export async function getAllOrders() {
  if (!hasDatabase) return [];
  const orders = await db.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const toSync = orders.filter(
    (o) => o.awbCode && !TERMINAL_STATUSES.includes(o.status),
  );
  if (toSync.length === 0) return orders;

  await Promise.allSettled(toSync.map((o) => syncOrderTracking(o.id)));
  return db.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}

/**
 * Create a Shiprocket shipment for an order, assign a courier + AWB, and
 * generate the printable shipping label. Safe to call again on an order that
 * already has some of these steps done — it only performs what's missing, so
 * a partial failure (e.g. label generation) can be retried without
 * re-creating the Shiprocket order.
 */
export async function fulfillOrder(orderId: string) {
  if (!hasDatabase) throw new Error("Database not configured");

  let order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) throw new Error("Order not found");

  if (!shiprocketEnabled) {
    // No Shiprocket keys — mark fulfilled locally so the flow still completes.
    await db.order.update({
      where: { id: orderId },
      data: { status: "FULFILLED" },
    });
    return { shiprocket: false, warning: undefined as string | undefined };
  }

  let warning: string | undefined;

  // Step 1 — create the Shiprocket order/shipment (skip if already done).
  if (!order.shiprocketShipmentId) {
    const result = await createShiprocketOrder({
      orderNumber: order.number,
      createdAt: order.createdAt,
      ship: {
        name: order.shipName,
        phone: order.shipPhone,
        line1: order.shipLine1,
        line2: order.shipLine2,
        city: order.shipCity,
        state: order.shipState,
        pincode: order.shipPincode,
        email: order.email,
      },
      items: order.items.map((i) => ({
        name: i.name,
        sku: i.productId ?? i.id,
        quantity: i.quantity,
        price: i.price,
      })),
      subtotalPaise: order.subtotal,
    });

    order = await db.order.update({
      where: { id: orderId },
      data: {
        status: "FULFILLED",
        shiprocketOrderId: result.shiprocketOrderId,
        shiprocketShipmentId: result.shipmentId,
      },
      include: { items: true },
    });
  }

  // Step 2 — assign a courier + AWB (skip if already assigned).
  if (order.shiprocketShipmentId && !order.awbCode) {
    try {
      const awb = await assignAwb(order.shiprocketShipmentId);
      order = await db.order.update({
        where: { id: orderId },
        data: {
          awbCode: awb.awbCode,
          courierName: awb.courierName,
          trackingUrl: awb.awbCode ? trackingUrlFor(awb.awbCode) : null,
        },
        include: { items: true },
      });
    } catch (err) {
      warning = err instanceof Error ? err.message : "Courier assignment failed";
    }
  }

  // Step 3 — generate the printable label (skip if already generated).
  if (order.shiprocketShipmentId && order.awbCode && !order.labelUrl) {
    try {
      const labelUrl = await generateLabel(order.shiprocketShipmentId);
      order = await db.order.update({
        where: { id: orderId },
        data: { labelUrl },
        include: { items: true },
      });
    } catch (err) {
      warning = err instanceof Error ? err.message : "Label generation failed";
    }
  }

  return {
    shiprocket: true,
    shiprocketOrderId: order.shiprocketOrderId,
    shipmentId: order.shiprocketShipmentId,
    awbCode: order.awbCode,
    labelUrl: order.labelUrl,
    warning,
  };
}
