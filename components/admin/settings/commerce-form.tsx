"use client";

import type { CommerceSettings } from "@/lib/settings/schema";
import { computeTotals } from "@/lib/cart-totals";
import { formatPrice } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { useSectionForm } from "./use-section-form";
import { ListEditor } from "./list-editor";
import { Field, RupeeField, SaveBar, SettingsCard, TextField, Toggle } from "./fields";

export function CommerceForm({ initial }: { initial: CommerceSettings }) {
  const { value: v, patch, errors, saving, dirty, save, reset } = useSectionForm("commerce", initial);
  const tierError = (i: number) => errors[`tiers.${i}.minSubtotal`] ?? errors[`tiers.${i}.discount`];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="space-y-5"
    >
      <SettingsCard
        title="Shipping"
        description="Charged at checkout. Changes apply to new orders right away."
      >
        <RupeeField
          label="Shipping fee"
          hint="Set to 0 to always ship free."
          value={v.shippingFee}
          onChange={(shippingFee) => patch({ shippingFee })}
          error={errors.shippingFee}
        />
        <Toggle
          label="Free shipping above an order amount"
          checked={v.freeShippingEnabled}
          onChange={(freeShippingEnabled) => patch({ freeShippingEnabled })}
        />
        {v.freeShippingEnabled && (
          <RupeeField
            label="Free shipping from"
            value={v.freeShippingThreshold}
            onChange={(freeShippingThreshold) => patch({ freeShippingThreshold })}
            error={errors.freeShippingThreshold}
          />
        )}
      </SettingsCard>

      <SettingsCard
        title="Spend more, save more"
        description="Automatic discounts when the cart reaches an amount. Shown on the homepage and in the cart. Order from smallest to largest."
      >
        <ListEditor
          items={v.tiers}
          onChange={(tiers) => patch({ tiers })}
          max={5}
          addLabel="Add discount tier"
          emptyText="No discount tiers — customers pay the full price."
          newItem={() => {
            const last = v.tiers.at(-1);
            return { minSubtotal: (last?.minSubtotal ?? 99900) + 50000, discount: 10000, freeShipping: false };
          }}
          renderItem={(tier, update, i) => (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <RupeeField
                  label="When the cart reaches"
                  value={tier.minSubtotal}
                  onChange={(minSubtotal) => update({ ...tier, minSubtotal })}
                />
                <RupeeField
                  label="Take off"
                  value={tier.discount}
                  onChange={(discount) => update({ ...tier, discount })}
                />
              </div>
              <Toggle
                label="Also ship free"
                checked={tier.freeShipping}
                onChange={(freeShipping) => update({ ...tier, freeShipping })}
              />
              {tierError(i) && <p className="text-xs font-medium text-destructive">{tierError(i)}</p>}
            </div>
          )}
        />
        {errors.tiers && <p className="text-xs font-medium text-destructive">{errors.tiers}</p>}
      </SettingsCard>

      <SettingsCard title="What customers will pay" description="Examples using your current (unsaved) rules.">
        <RulesPreview rules={v} />
      </SettingsCard>

      <SettingsCard title="Delivery & returns" description="Shown on product pages and policy pages.">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Delivery time"
            hint='e.g. "3–6 business days"'
            value={v.deliveryEstimate}
            onChange={(deliveryEstimate) => patch({ deliveryEstimate })}
            error={errors.deliveryEstimate}
            maxLength={40}
          />
          <Field label="Return window (days)" error={errors.returnWindowDays}>
            <Input
              type="number"
              min={0}
              max={365}
              step={1}
              value={v.returnWindowDays}
              onChange={(e) => patch({ returnWindowDays: Math.round(Number(e.target.value) || 0) })}
            />
          </Field>
        </div>
      </SettingsCard>

      <SaveBar dirty={dirty} saving={saving} onReset={reset} />
    </form>
  );
}

/** Totals at a few cart amounts around each threshold, computed exactly like checkout. */
function RulesPreview({ rules }: { rules: CommerceSettings }) {
  const points = new Set<number>([49900]);
  if (rules.freeShippingEnabled) points.add(rules.freeShippingThreshold);
  for (const t of rules.tiers) points.add(t.minSubtotal);
  const amounts = [...points].filter((n) => n > 0).sort((a, b) => a - b).slice(0, 7);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-xs text-muted-foreground">
          <tr>
            <th className="py-2 pr-4 font-medium">Cart</th>
            <th className="py-2 pr-4 font-medium">Discount</th>
            <th className="py-2 pr-4 font-medium">Shipping</th>
            <th className="py-2 font-medium">Customer pays</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {amounts.map((amount) => {
            const t = computeTotals([{ price: amount, quantity: 1 }], rules);
            return (
              <tr key={amount}>
                <td className="py-2 pr-4 font-medium">{formatPrice(amount)}</td>
                <td className="py-2 pr-4">{t.discount ? `−${formatPrice(t.discount)}` : "—"}</td>
                <td className="py-2 pr-4">{t.shipping ? formatPrice(t.shipping) : "Free"}</td>
                <td className="py-2 font-bold">{formatPrice(t.total)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
