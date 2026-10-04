"use client";

import type { CSSProperties } from "react";
import { Check, Star } from "lucide-react";
import { THEME_PRESETS, type ThemePresetKey, type ThemeSettings } from "@/lib/settings/schema";
import { themeVars } from "@/lib/settings/theme-css";
import { contrastRatio } from "@/lib/settings/color";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useSectionForm } from "./use-section-form";
import { Field, SaveBar, SettingsCard } from "./fields";

const COLOR_FIELDS = [
  { key: "primary", label: "Brand color", hint: "Buttons, links and highlights." },
  { key: "secondary", label: "Secondary color", hint: "Secondary buttons and soft accents." },
  { key: "background", label: "Background", hint: "Page background." },
  { key: "foreground", label: "Text", hint: "Headings and body text." },
] as const;

const HEX = /^#[0-9a-fA-F]{6}$/;

export function ThemeForm({ initial }: { initial: ThemeSettings }) {
  const { value: v, patch, errors, saving, dirty, save, reset } = useSectionForm("theme", initial);

  const valid = COLOR_FIELDS.every((f) => HEX.test(v[f.key]));
  const contrast = valid ? contrastRatio(v.foreground, v.background) : 0;

  function applyPreset(key: ThemePresetKey) {
    const { primary, secondary, background, foreground } = THEME_PRESETS[key];
    patch({ preset: key, primary, secondary, background, foreground });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="space-y-5"
    >
      <SettingsCard title="Color palette" description="Start from a preset, then fine-tune any color.">
        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
          {(Object.keys(THEME_PRESETS) as ThemePresetKey[]).map((key) => {
            const p = THEME_PRESETS[key];
            const active = v.preset === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => applyPreset(key)}
                className={cn(
                  "relative rounded-xl border-2 p-3 text-left transition-colors",
                  active ? "border-primary" : "border-transparent bg-muted hover:border-border",
                )}
                aria-pressed={active}
              >
                <div className="flex gap-1">
                  {[p.primary, p.secondary, p.background, p.foreground].map((c) => (
                    <span key={c} className="size-6 rounded-full border" style={{ backgroundColor: c }} />
                  ))}
                </div>
                <p className="mt-2 text-sm font-semibold">{p.label}</p>
                {active && <Check className="absolute right-2 top-2 size-4 text-primary" />}
              </button>
            );
          })}
        </div>
        {v.preset === "custom" && <p className="text-sm text-muted-foreground">Using custom colors.</p>}

        <div className="grid gap-4 sm:grid-cols-2">
          {COLOR_FIELDS.map((f) => (
            <Field key={f.key} label={f.label} hint={f.hint} error={errors[f.key]}>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={HEX.test(v[f.key]) ? v[f.key] : "#000000"}
                  onChange={(e) => patch({ [f.key]: e.target.value, preset: "custom" })}
                  className="h-9 w-12 shrink-0 cursor-pointer rounded-md border bg-transparent p-1"
                  aria-label={`${f.label} picker`}
                />
                <Input
                  value={v[f.key]}
                  onChange={(e) => patch({ [f.key]: e.target.value.trim(), preset: "custom" })}
                  maxLength={7}
                  className="font-mono"
                  aria-invalid={!HEX.test(v[f.key]) || undefined}
                />
              </div>
            </Field>
          ))}
        </div>

        {valid && contrast < 4.5 && (
          <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
            Text is hard to read on this background (contrast {contrast.toFixed(1)}:1, needs 4.5:1).
            Pick a darker text color or a lighter background.
          </p>
        )}
      </SettingsCard>

      <SettingsCard title="Preview" description="How your colors look on the storefront.">
        {valid ? <ThemePreview theme={v} /> : <p className="text-sm text-muted-foreground">Enter valid colors to see a preview.</p>}
      </SettingsCard>

      <SaveBar dirty={dirty} saving={saving} onReset={reset} />
    </form>
  );
}

function ThemePreview({ theme }: { theme: ThemeSettings }) {
  return (
    <div
      style={themeVars(theme) as CSSProperties}
      className="rounded-2xl border bg-background p-5 text-foreground"
    >
      <p className="text-xs font-bold uppercase tracking-widest text-primary">Bestsellers</p>
      <h4 className="mt-1 font-heading text-2xl font-bold">Products you&apos;ll love</h4>
      <p className="mt-1 text-sm text-muted-foreground">Muted text looks like this.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="rounded-xl border bg-card p-4 text-card-foreground">
          <div className="flex items-center justify-between">
            <p className="font-semibold">Sample product</p>
            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
              New
            </span>
          </div>
          <div className="mt-1 flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="size-3.5 fill-primary text-primary" />
            ))}
          </div>
          <p className="mt-2 text-lg font-extrabold">₹499</p>
        </div>
        <div className="flex flex-col gap-2 sm:w-44">
          <span className="rounded-full bg-primary px-4 py-2 text-center text-sm font-bold text-primary-foreground">
            Add to cart
          </span>
          <span className="rounded-full bg-secondary px-4 py-2 text-center text-sm font-bold text-secondary-foreground">
            View details
          </span>
          <span className="rounded-full border px-4 py-2 text-center text-sm font-semibold">Outline</span>
        </div>
      </div>
    </div>
  );
}
