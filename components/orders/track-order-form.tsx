"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import { lookupOrderAction } from "@/app/track-order/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function TrackOrderForm({ defaultOrderNumber = "" }: { defaultOrderNumber?: string }) {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState(defaultOrderNumber);
  const [contact, setContact] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await lookupOrderAction({ orderNumber, contact });
    if (res.ok) {
      router.push(`/orders/${res.orderNumber}`);
      return; // keep the spinner while the order page loads
    }
    setLoading(false);
    setError(res.error);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="track-number" className="mb-1.5 block">
          Order number
        </Label>
        <Input
          id="track-number"
          inputMode="numeric"
          placeholder="e.g. 1024"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="track-contact" className="mb-1.5 block">
          Phone number or email used at checkout
        </Label>
        <Input
          id="track-contact"
          placeholder="98765 43210 or you@example.com"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          autoComplete="email"
          required
        />
      </div>
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full rounded-full" size="lg">
        {loading ? <Loader2 className="animate-spin" /> : <Search />}
        Find my order
      </Button>
    </form>
  );
}
