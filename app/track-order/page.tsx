import Link from "next/link";
import { TrackOrderForm } from "@/components/orders/track-order-form";

export const metadata = {
  title: "Track your order",
  description: "Check the status of your order with your order number and phone or email.",
};

export default async function TrackOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  const prefill = order && /^\d{1,10}$/.test(order) ? order : "";

  return (
    <div className="container-page py-12 sm:py-16">
      <div className="mx-auto max-w-md">
        <h1 className="font-heading text-4xl font-bold">Track your order</h1>
        <p className="mt-2 text-muted-foreground">
          Enter your order number and the phone number or email you used at checkout.
        </p>
        <div className="mt-8 rounded-3xl border bg-card p-6">
          <TrackOrderForm defaultOrderNumber={prefill} />
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Have an account?{" "}
          <Link href="/orders" className="font-semibold text-primary hover:underline">
            See all your orders
          </Link>
          . Sign up with the email you ordered with and past orders appear automatically.
        </p>
      </div>
    </div>
  );
}
