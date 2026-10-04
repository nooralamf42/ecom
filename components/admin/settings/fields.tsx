"use client";

import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/admin/image-uploader";
import { cn } from "@/lib/utils";

export function SettingsCard({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl border bg-card p-4 sm:p-6", className)}>
      <h3 className="font-heading text-lg font-bold">{title}</h3>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-destructive">{error}</p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

export function TextField({
  label,
  hint,
  error,
  value,
  onChange,
  placeholder,
  maxLength,
  type = "text",
}: {
  label: string;
  hint?: string;
  error?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  type?: string;
}) {
  return (
    <Field label={label} hint={hint} error={error}>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
      />
    </Field>
  );
}

export function TextAreaField({
  label,
  hint,
  error,
  value,
  onChange,
  placeholder,
  maxLength,
  rows = 3,
}: {
  label: string;
  hint?: string;
  error?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  rows?: number;
}) {
  return (
    <Field label={label} hint={hint} error={error}>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        aria-invalid={error ? true : undefined}
      />
    </Field>
  );
}

/** Rupee input backed by a paise value. */
export function RupeeField({
  label,
  hint,
  error,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  error?: string;
  value: number;
  onChange: (paise: number) => void;
}) {
  return (
    <Field label={label} hint={hint} error={error}>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          ₹
        </span>
        <Input
          type="number"
          inputMode="decimal"
          min={0}
          step={1}
          value={Number.isFinite(value) ? value / 100 : ""}
          onChange={(e) =>
            onChange(e.target.value === "" ? 0 : Math.round(Number(e.target.value) * 100))
          }
          className="pl-7"
          aria-invalid={error ? true : undefined}
        />
      </div>
    </Field>
  );
}

export function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-4 accent-primary"
      />
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
      </span>
    </label>
  );
}

/** One image (logo, favicon, share image), uploaded to Cloudinary or pasted as a URL. */
export function ImageField({
  label,
  hint,
  error,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  error?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Field label={label} hint={hint} error={error}>
      <ImageUploader
        context="branding"
        value={value ? [value] : []}
        onChange={(v) => onChange(v.at(-1) ?? "")}
      />
    </Field>
  );
}

/** Sticky save/discard bar at the bottom of each settings form. */
export function SaveBar({
  dirty,
  saving,
  onReset,
}: {
  dirty: boolean;
  saving: boolean;
  onReset: () => void;
}) {
  return (
    <div className="sticky bottom-3 z-10 flex items-center justify-between gap-2 rounded-2xl border bg-background/95 p-2.5 shadow-lg backdrop-blur sm:bottom-4 sm:gap-3 sm:p-3">
      <p className="min-w-0 pl-1.5 text-xs text-muted-foreground sm:pl-2 sm:text-sm">
        {dirty ? "You have unsaved changes" : "All changes saved"}
      </p>
      <div className="flex shrink-0 gap-1 sm:gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onReset}
          disabled={!dirty || saving}
          className="rounded-full"
        >
          Discard
        </Button>
        <Button type="submit" disabled={!dirty || saving} className="rounded-full">
          {saving && <Loader2 className="size-4 animate-spin" />}
          Save changes
        </Button>
      </div>
    </div>
  );
}
