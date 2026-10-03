"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileDown, Loader2, RotateCw, Truck, X } from "lucide-react";
import { fulfillOrderAction, adminCancelOrderAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

type Props = {
  orderId: string;
  status: string;
  awbCode: string | null;
  courierName: string | null;
  labelUrl: string | null;
  trackingUrl: string | null;
};

export function OrderActions({
  orderId,
  status,
  awbCode,
  courierName,
  labelUrl,
  trackingUrl,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const needsWork = status === "PAID" || (status === "FULFILLED" && (!awbCode || !labelUrl));

  async function onCancel() {
    if (!confirm("Cancel this unpaid order? This can't be undone.")) return;
    setCancelling(true);
    const res = await adminCancelOrderAction(orderId);
    setCancelling(false);
    if (res.ok) {
      toast.success("Order cancelled");
      router.refresh();
    } else {
      toast.error(res.error ?? "Failed to cancel");
    }
  }

  async function onClick() {
    setLoading(true);
    const res = await fulfillOrderAction(orderId);
    setLoading(false);
    if (res.ok) {
      if (res.warning) {
        toast.warning(res.warning, {
          description: "You can retry to complete the remaining steps.",
        });
      } else if (res.labelUrl) {
        toast.success("Order fulfilled — label ready to download");
      } else {
        toast.success("Order fulfilled");
      }
      router.refresh();
    } else {
      toast.error(res.error ?? "Failed to fulfill");
    }
  }

  const isRetry = status === "FULFILLED";

  return (
    <div className="flex flex-col items-end gap-1.5">
      {status === "PENDING" && (
        <Button
          size="sm"
          variant="ghost"
          onClick={onCancel}
          disabled={cancelling}
          className="rounded-full"
        >
          {cancelling ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <X className="size-3.5" />
          )}
          Cancel
        </Button>
      )}

      {needsWork && (
        <Button size="sm" onClick={onClick} disabled={loading} className="rounded-full">
          {loading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : isRetry ? (
            <RotateCw className="size-3.5" />
          ) : (
            <Truck className="size-3.5" />
          )}
          {isRetry ? "Retry" : "Fulfill"}
        </Button>
      )}

      {labelUrl && (
        <a
          href={labelUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          <FileDown className="size-3.5" /> Download label
        </a>
      )}

      {awbCode && (
        <span className="text-xs text-muted-foreground">
          {courierName ? `${courierName} · ` : ""}AWB {awbCode}
        </span>
      )}

      {trackingUrl && (
        <a
          href={trackingUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-muted-foreground hover:text-primary hover:underline"
        >
          Track shipment
        </a>
      )}
    </div>
  );
}
