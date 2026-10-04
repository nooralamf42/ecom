import { redirect } from "next/navigation";
import { grantGuestOrderAccess, isValidOrderLinkToken } from "@/lib/order-access";

/** Link from the order email: remember the order on this browser, then show it. */
export async function GET(req: Request, { params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const orderNumber = Number(number);
  const token = new URL(req.url).searchParams.get("t") ?? "";

  if (Number.isInteger(orderNumber) && orderNumber > 0 && isValidOrderLinkToken(orderNumber, token)) {
    await grantGuestOrderAccess(orderNumber);
    redirect(`/orders/${orderNumber}`);
  }
  redirect(`/track-order?order=${encodeURIComponent(number)}`);
}
