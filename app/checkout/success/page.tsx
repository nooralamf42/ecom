import { auth } from "@clerk/nextjs/server";
import { SuccessCard } from "@/components/checkout/success-card";
import { clerkEnabled } from "@/lib/auth-config";

export const metadata = { title: "Order confirmed" };

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; demo?: string }>;
}) {
  const { order, demo } = await searchParams;
  const signedIn = clerkEnabled ? Boolean((await auth()).userId) : false;
  const orderNumber = order && /^\d{1,10}$/.test(order) ? order : undefined;
  return <SuccessCard orderNumber={orderNumber} demo={demo === "1"} guest={!signedIn} />;
}
