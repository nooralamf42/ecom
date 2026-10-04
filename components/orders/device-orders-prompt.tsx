"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Smartphone } from "lucide-react";
import { claimDeviceOrdersAction } from "@/app/orders/actions";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";

type DeviceOrder = { number: number; total: number; createdAt: string; itemCount: number };

const DISMISSED_KEY = "dismissed-device-orders";

function readDismissed(): number[] {
  try {
    const v = JSON.parse(localStorage.getItem(DISMISSED_KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((n) => typeof n === "number") : [];
  } catch {
    return [];
  }
}

/** Offers to add guest orders placed on this browser to the signed-in account. */
export function DeviceOrdersPrompt({ orders }: { orders: DeviceOrder[] }) {
  const router = useRouter();
  const [dismissed, setDismissed] = useState<number[] | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => setDismissed(readDismissed()), []);

  // Wait for localStorage so the banner doesn't flash for dismissed orders.
  if (dismissed === null) return null;
  const pending = orders.filter((o) => !dismissed.includes(o.number));
  if (pending.length === 0) return null;
  const numbers = pending.map((o) => o.number);

  async function addToAccount() {
    setBusy(true);
    const res = await claimDeviceOrdersAction(numbers);
    setBusy(false);
    if (!res.ok) {
      toast.error(res.error ?? "Couldn't add the orders");
      return;
    }
    toast.success(`${res.claimed} order${res.claimed === 1 ? "" : "s"} added to your account`);
    router.refresh();
  }

  function notMine() {
    const next = [...new Set([...readDismissed(), ...numbers])];
    try {
      localStorage.setItem(DISMISSED_KEY, JSON.stringify(next));
    } catch {
      /* storage blocked — just hide for now */
    }
    setDismissed(next);
  }

  return (
    <div className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
          <Smartphone className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-bold">
            We found {pending.length} order{pending.length === 1 ? "" : "s"} placed on this device
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            They were placed without signing in. Add them to your account to see them on any device.
          </p>
          <ul className="mt-3 space-y-1 text-sm">
            {pending.map((o) => (
              <li key={o.number} className="flex justify-between gap-3">
                <span>
                  Order #{o.number} ·{" "}
                  {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} ·{" "}
                  {o.itemCount} item{o.itemCount === 1 ? "" : "s"}
                </span>
                <span className="font-semibold">{formatPrice(o.total)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={addToAccount} disabled={busy} size="sm" className="rounded-full">
              {busy && <Loader2 className="animate-spin" />}
              Add to my account
            </Button>
            <Button onClick={notMine} disabled={busy} size="sm" variant="ghost" className="rounded-full">
              Not mine
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
