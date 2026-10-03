import { db, hasDatabase } from "./db";
import { getDbUser, isAdmin } from "./current-user";
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

export async function getUserOrders() {
  if (!hasDatabase) return [];
  const user = await getDbUser();
  if (!user) return [];
  return db.order.findMany({
    where: { userId: user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrderByNumber(number: number) {
  if (!hasDatabase || Number.isNaN(number)) return null;
  const include = {
    items: { include: { product: { select: { slug: true } } } },
  } as const;

  let order = await db.order.findUnique({ where: { number }, include });
  if (!order) return null;

  if (order.awbCode && !TERMINAL_STATUSES.includes(order.status)) {
    await syncOrderTracking(order.id).catch(() => {});
    order = (await db.order.findUnique({ where: { number }, include })) ?? order;
  }

  const user = await getDbUser();
  const admin = await isAdmin();
  if (!admin && order.userId && order.userId !== user?.id) {
    return null; // not authorised
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
