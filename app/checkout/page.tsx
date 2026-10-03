"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Loader2, Lock, Plus, Trash2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";

/**
 * Bridges Clerk's `useUser` into a plain callback. Only ever rendered when
 * `clerkEnabled` is true, so the hook is always called unconditionally within
 * this component's own lifetime — never rendered means never mounted, which
 * is the safe way to make a Clerk hook opt-in (calling it conditionally
 * inside the parent would break rules-of-hooks and throw when no
 * <ClerkProvider> is mounted).
 */
function ClerkAuthBridge({
  onChange,
}: {
  onChange: (v: { isSignedIn: boolean; email?: string }) => void;
}) {
  const { isSignedIn, user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  useEffect(() => {
    onChange({ isSignedIn: !!isSignedIn, email });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, email]);
  return null;
}
import { useCart, useHydrated } from "@/store/cart";
import { computeTotals } from "@/lib/cart-totals";
import { useCommerceRules, useRazorpayBranding } from "@/components/providers/site-settings-provider";
import { formatPrice } from "@/lib/format";
import { addressSchema, type AddressInput } from "@/lib/validators";
import { clerkEnabled } from "@/lib/auth-config";
import { listAddressesAction, deleteAddressAction } from "./actions";
import type { SavedAddress } from "@/lib/addresses";
import { StateSelect } from "@/components/checkout/state-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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

const emptyForm: AddressInput = {
  name: "",
  email: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, clear } = useCart();
  const hydrated = useHydrated();
  const totals = computeTotals(lines, useCommerceRules());
  const branding = useRazorpayBranding();
  const [form, setForm] = useState<AddressInput>(emptyForm);
  const [loading, setLoading] = useState(false);

  const [authState, setAuthState] = useState<{ isSignedIn: boolean; email?: string }>({
    isSignedIn: false,
  });
  const handleAuthChange = useCallback(
    (v: { isSignedIn: boolean; email?: string }) =>
      setAuthState((prev) =>
        prev.isSignedIn === v.isSignedIn && prev.email === v.email ? prev : v,
      ),
    [],
  );
  const isSignedIn = authState.isSignedIn;

  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(true);
  const [addressesLoaded, setAddressesLoaded] = useState(false);

  useEffect(() => {
    if (hydrated && lines.length === 0 && !loading) {
      router.replace("/products");
    }
  }, [hydrated, lines.length, loading, router]);

  // Prefill email for signed-in users so it's one less thing to type.
  useEffect(() => {
    if (authState.email) {
      setForm((f) => (f.email ? f : { ...f, email: authState.email! }));
    }
  }, [authState.email]);

  // Load saved addresses for signed-in customers.
  useEffect(() => {
    if (!clerkEnabled || !isSignedIn) {
      setAddressesLoaded(true);
      return;
    }
    listAddressesAction()
      .then((list) => {
        setAddresses(list);
        const def = list.find((a) => a.isDefault) ?? list[0];
        if (def) {
          selectAddress(def);
        } else {
          setShowForm(true);
        }
      })
      .finally(() => setAddressesLoaded(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn]);

  function selectAddress(a: SavedAddress) {
    setSelectedId(a.id);
    setShowForm(false);
    setForm((f) => ({
      ...f,
      name: a.name,
      phone: a.phone,
      line1: a.line1,
      line2: a.line2 ?? "",
      city: a.city,
      state: a.state,
      pincode: a.pincode,
    }));
  }

  function startNewAddress() {
    setSelectedId(null);
    setShowForm(true);
    setForm((f) => ({
      ...emptyForm,
      email: f.email,
    }));
  }

  async function removeAddress(id: string) {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    if (selectedId === id) startNewAddress();
    await deleteAddressAction(id).catch(() => {});
  }

  function update(field: keyof AddressInput, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = addressSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check your details");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((l) => ({
            productId: l.productId,
            quantity: l.quantity,
            size: l.size,
          })),
          address: parsed.data,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Checkout failed");
        setLoading(false);
        return;
      }

      // Demo mode: no Razorpay configured — confirm a draft order.
      if (data.demo || !data.razorpayOrderId || !data.keyId) {
        clear();
        const q = new URLSearchParams();
        if (data.orderNumber) q.set("order", String(data.orderNumber));
        q.set("demo", "1");
        router.push(`/checkout/success?${q.toString()}`);
        return;
      }

      const ok = await loadRazorpay();
      if (!ok) {
        toast.error("Couldn't load payment gateway");
        setLoading(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        order_id: data.razorpayOrderId,
        ...branding,
        description: "Order payment",
        prefill: {
          name: parsed.data.name,
          email: parsed.data.email,
          contact: parsed.data.phone,
        },
        handler: async (response: any) => {
          const verify = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          const vData = await verify.json();
          clear();
          const num = vData.orderNumber ?? data.orderNumber ?? "";
          router.push(`/checkout/success?order=${num}`);
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (!hydrated || lines.length === 0) {
    return <div className="container-page min-h-[50vh] py-16" />;
  }

  const fields: {
    id: keyof AddressInput;
    label: string;
    type?: string;
    half?: boolean;
    optional?: boolean;
    maxLength?: number;
    numeric?: boolean;
    placeholder?: string;
  }[] = [
    { id: "name", label: "Full name" },
    { id: "email", label: "Email", type: "email" },
    {
      id: "phone",
      label: "Phone",
      type: "tel",
      numeric: true,
      maxLength: 10,
      placeholder: "10-digit mobile number",
    },
    { id: "line1", label: "Address line 1" },
    { id: "line2", label: "Address line 2", optional: true },
    { id: "city", label: "City", half: true },
  ];

  return (
    <div className="container-page py-12 sm:py-16">
      {clerkEnabled && <ClerkAuthBridge onChange={handleAuthChange} />}

      <h1 className="font-heading text-4xl font-bold">Checkout</h1>

      <form
        onSubmit={handleSubmit}
        className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]"
      >
        {/* Address */}
        <div className="rounded-3xl border bg-card p-6">
          <h2 className="text-lg font-bold">Shipping details</h2>

          {/* Saved addresses */}
          {clerkEnabled && isSignedIn && addressesLoaded && addresses.length > 0 && (
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {addresses.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => selectAddress(a)}
                  className={cn(
                    "group relative rounded-2xl border p-3.5 text-left text-sm transition-colors",
                    selectedId === a.id
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50",
                  )}
                >
                  {selectedId === a.id && (
                    <span className="absolute right-3 top-3 grid size-5 place-items-center rounded-full bg-primary text-primary-foreground">
                      <Check className="size-3.5" />
                    </span>
                  )}
                  <p className="pr-6 font-bold">{a.name}</p>
                  <p className="mt-0.5 text-muted-foreground">
                    {a.line1}
                    {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.pincode}
                  </p>
                  <p className="mt-0.5 text-muted-foreground">{a.phone}</p>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeAddress(a.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation();
                        removeAddress(a.id);
                      }
                    }}
                    className="absolute bottom-3 right-3 text-muted-foreground opacity-0 hover:text-destructive group-hover:opacity-100"
                    aria-label="Delete address"
                  >
                    <Trash2 className="size-4" />
                  </span>
                </button>
              ))}

              <button
                type="button"
                onClick={startNewAddress}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed p-3.5 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary",
                  showForm && !selectedId && "border-primary text-primary",
                )}
              >
                <Plus className="size-4" /> Add new address
              </button>
            </div>
          )}

          {/* Address form */}
          {showForm && (
            <div className="mt-5 grid grid-cols-2 gap-4">
              {fields.map((f) => (
                <div key={f.id} className={f.half ? "col-span-1" : "col-span-2"}>
                  <Label htmlFor={f.id} className="mb-1.5">
                    {f.label}
                    {f.optional && (
                      <span className="text-muted-foreground"> (optional)</span>
                    )}
                  </Label>
                  <Input
                    id={f.id}
                    type={f.type ?? "text"}
                    inputMode={f.numeric ? "numeric" : undefined}
                    maxLength={f.maxLength}
                    placeholder={f.placeholder}
                    value={form[f.id]}
                    onChange={(e) => {
                      const raw = f.numeric
                        ? e.target.value.replace(/\D/g, "").slice(0, f.maxLength)
                        : e.target.value;
                      update(f.id, raw);
                    }}
                    className="rounded-xl"
                    required={!f.optional}
                  />
                </div>
              ))}

              <div className="col-span-1">
                <Label htmlFor="state" className="mb-1.5">
                  State
                </Label>
                <StateSelect
                  id="state"
                  value={form.state}
                  onChange={(v) => update("state", v)}
                />
              </div>

              <div className="col-span-1">
                <Label htmlFor="pincode" className="mb-1.5">
                  Pincode
                </Label>
                <Input
                  id="pincode"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="6-digit pincode"
                  value={form.pincode}
                  onChange={(e) => update("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="rounded-xl"
                  required
                />
              </div>
            </div>
          )}

          {!showForm && selectedId && (
            <p className="mt-4 text-xs text-muted-foreground">
              Shipping to the address above. Choose &quot;Add new address&quot; to use a
              different one.
            </p>
          )}
        </div>

        {/* Summary */}
        <div className="h-max rounded-3xl border bg-card p-6">
          <h2 className="text-lg font-bold">Your order</h2>
          <ul className="mt-4 space-y-3">
            {lines.map((l) => (
              <li
                key={`${l.productId}-${l.size ?? ""}`}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="flex-1">
                  {l.name}
                  {l.size && <span className="text-muted-foreground"> (Size {l.size})</span>}{" "}
                  <span className="text-muted-foreground">× {l.quantity}</span>
                </span>
                <span className="font-semibold">{formatPrice(l.price * l.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="my-4 border-t" />
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatPrice(totals.subtotal)}</dd>
            </div>
            {totals.discount > 0 && (
              <div className="flex justify-between text-primary">
                <dt>Discount</dt>
                <dd>- {formatPrice(totals.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd>{totals.shipping === 0 ? "Free" : formatPrice(totals.shipping)}</dd>
            </div>
            <div className="mt-2 flex justify-between border-t pt-2 text-base font-extrabold">
              <dt>Total</dt>
              <dd>{formatPrice(totals.total)}</dd>
            </div>
          </dl>

          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="mt-5 w-full rounded-full text-base font-bold"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Processing…
              </>
            ) : (
              <>
                <Lock className="size-4" /> Pay {formatPrice(totals.total)}
              </>
            )}
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Secured by Razorpay · UPI, cards &amp; more
          </p>
        </div>
      </form>
    </div>
  );
}
