import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { db, hasDatabase } from "@/lib/db";
import { syncOrderTracking } from "@/lib/orders";

/*
 * Shiprocket tracking webhook (Shiprocket → Settings → API → Webhooks).
 * The path avoids "shiprocket", "sr" and "kr", which Shiprocket rejects in
 * webhook URLs. Set the same token there (as the x-api-key) and in
 * SHIPROCKET_WEBHOOK_TOKEN.
 *
 * The payload is only used to find the order: the status is re-checked with
 * Shiprocket's API (syncOrderTracking), so a forged call can't change it.
 * That also sends the shipped / delivered emails.
 */
export async function POST(req: Request) {
  const expected = process.env.SHIPROCKET_WEBHOOK_TOKEN;
  const given = req.headers.get("x-api-key") ?? "";
  if (
    !expected ||
    given.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(given), Buffer.from(expected))
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as { awb?: string | number; awb_code?: string | number } | null;
  const awb = String(body?.awb ?? body?.awb_code ?? "").trim();

  if (awb && hasDatabase) {
    const order = await db.order.findFirst({ where: { awbCode: awb }, select: { id: true } });
    if (order) await syncOrderTracking(order.id);
  }

  // Shiprocket expects a 200 for every delivered event.
  return NextResponse.json({ received: true });
}
