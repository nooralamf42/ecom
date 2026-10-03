import { SuccessCard } from "@/components/checkout/success-card";

export const metadata = { title: "Order confirmed" };

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; demo?: string }>;
}) {
  const { order, demo } = await searchParams;
  return <SuccessCard orderNumber={order} demo={demo === "1"} />;
}
