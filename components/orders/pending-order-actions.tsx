"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, CreditCard, X } from "lucide-react";
import { retryPaymentAction, cancelOrderAction } from "@/app/orders/actions";
import { Button } from "@/components/ui/button";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    Razorpay?: any;
  }
}

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

/**
 * Recovery actions for an order stuck awaiting payment — mirrors the
 * "Complete payment" / "Cancel order" options customers expect on Amazon
 * and other marketplaces.
 */
export function PendingOrderActions({
  orderNumber,
  customerName,
  email,
  phone,
  compact = false,
}: {
  orderNumber: number;
  customerName: string;
  email: string;
  phone: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [paying, setPaying] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  async function onPay() {
    setPaying(true);
    const res = await retryPaymentAction(orderNumber);

    if (!res.ok) {
      toast.error(res.error ?? "Could not start payment");
      setPaying(false);
      return;
    }

    if (res.demo || !res.razorpayOrderId || !res.keyId) {
      toast.success("Order confirmed");
      setPaying(false);
      router.refresh();
      return;
    }

    const loaded = await loadRazorpay();
    if (!loaded) {
      toast.error("Couldn't load payment gateway");
      setPaying(false);
      return;
    }

    const rzp = new window.Razorpay({
      key: res.keyId,
      amount: res.amount,
      currency: res.currency,
      order_id: res.razorpayOrderId,
      name: "Bangleish",
      description: `Order #${orderNumber}`,
      prefill: { name: customerName, email, contact: phone },
      theme: { color: "#e0218a" },
      handler: async (response: any) => {
        await fetch("/api/razorpay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(response),
        });
        toast.success("Payment successful");
        setPaying(false);
        router.refresh();
      },
      modal: { ondismiss: () => setPaying(false) },
    });
    rzp.open();
  }

  async function onCancel() {
    if (!confirm(`Cancel order #${orderNumber}? This can't be undone.`)) return;
    setCancelling(true);
    const res = await cancelOrderAction(orderNumber);
    setCancelling(false);
    if (res.ok) {
      toast.success("Order cancelled");
      router.refresh();
    } else {
      toast.error(res.error ?? "Could not cancel order");
    }
  }

  return (
    <div className={compact ? "flex gap-2" : "mt-4 flex flex-wrap gap-2"}>
      <Button
        size={compact ? "sm" : "default"}
        onClick={onPay}
        disabled={paying || cancelling}
        className="rounded-full"
      >
        {paying ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <CreditCard className="size-4" />
        )}
        Complete payment
      </Button>
      <Button
        size={compact ? "sm" : "default"}
        variant="ghost"
        onClick={onCancel}
        disabled={paying || cancelling}
        className="rounded-full"
      >
        {cancelling ? <Loader2 className="size-4 animate-spin" /> : <X className="size-4" />}
        Cancel order
      </Button>
    </div>
  );
}
