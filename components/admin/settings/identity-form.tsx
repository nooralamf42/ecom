"use client";

import type { IdentitySettings } from "@/lib/settings/schema";
import { useSectionForm } from "./use-section-form";
import { ImageField, SaveBar, SettingsCard, TextAreaField, TextField } from "./fields";

export function IdentityForm({ initial }: { initial: IdentitySettings }) {
  const { value: v, patch, errors, saving, dirty, save, reset } = useSectionForm("identity", initial);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="space-y-5"
    >
      <SettingsCard title="Brand" description="Shown in the header, footer, browser tab and payment window.">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Store name"
            value={v.storeName}
            onChange={(storeName) => patch({ storeName })}
            error={errors.storeName}
            maxLength={60}
          />
          <TextField
            label="Tagline"
            value={v.tagline}
            onChange={(tagline) => patch({ tagline })}
            error={errors.tagline}
            maxLength={120}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ImageField
            label="Logo"
            hint="PNG or SVG with a transparent background works best. Leave empty to show the store name."
            value={v.logoUrl}
            onChange={(logoUrl) => patch({ logoUrl })}
            error={errors.logoUrl}
          />
          <ImageField
            label="Favicon"
            hint="Square image, at least 64×64px. Shown in the browser tab."
            value={v.faviconUrl}
            onChange={(faviconUrl) => patch({ faviconUrl })}
            error={errors.faviconUrl}
          />
        </div>
        <TextField
          label="Footer note"
          hint='Short line in the footer, e.g. "Made in India".'
          value={v.footerNote}
          onChange={(footerNote) => patch({ footerNote })}
          error={errors.footerNote}
          maxLength={80}
        />
      </SettingsCard>

      <SettingsCard title="Contact" description="Shown in the footer and on your policy pages.">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Email"
            type="email"
            value={v.contactEmail}
            onChange={(contactEmail) => patch({ contactEmail })}
            error={errors.contactEmail}
          />
          <TextField
            label="Phone"
            value={v.contactPhone}
            onChange={(contactPhone) => patch({ contactPhone })}
            error={errors.contactPhone}
          />
          <TextField
            label="WhatsApp number"
            hint="10-digit Indian number, or include the country code."
            value={v.whatsapp}
            onChange={(whatsapp) => patch({ whatsapp })}
            error={errors.whatsapp}
          />
        </div>
        <TextAreaField
          label="Address"
          value={v.address}
          onChange={(address) => patch({ address })}
          error={errors.address}
          maxLength={300}
          rows={2}
        />
      </SettingsCard>

      <SettingsCard title="Social links" description="Full profile links. Empty ones are hidden.">
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              ["instagram", "Instagram"],
              ["facebook", "Facebook"],
              ["youtube", "YouTube"],
              ["x", "X (Twitter)"],
            ] as const
          ).map(([key, label]) => (
            <TextField
              key={key}
              label={label}
              placeholder="https://"
              value={v.socials[key]}
              onChange={(url) => patch({ socials: { ...v.socials, [key]: url } })}
              error={errors[`socials.${key}`]}
            />
          ))}
        </div>
      </SettingsCard>

      <SettingsCard
        title="Search & sharing"
        description="How your store appears on Google and when links are shared on WhatsApp, Instagram, etc."
      >
        <TextField
          label="Website address"
          hint="Your live domain, e.g. https://mystore.com. Used for share links and the sitemap."
          placeholder="https://"
          value={v.siteUrl}
          onChange={(siteUrl) => patch({ siteUrl })}
          error={errors.siteUrl}
        />
        <TextField
          label="Homepage title"
          hint={`Up to 70 characters. Leave empty to use "${v.storeName}${v.tagline ? ` — ${v.tagline}` : ""}".`}
          value={v.seoTitle}
          onChange={(seoTitle) => patch({ seoTitle })}
          error={errors.seoTitle}
          maxLength={70}
        />
        <TextAreaField
          label="Description"
          hint={`${v.seoDescription.length}/170 — the snippet under your title in search results.`}
          value={v.seoDescription}
          onChange={(seoDescription) => patch({ seoDescription })}
          error={errors.seoDescription}
          maxLength={170}
          rows={2}
        />
        <ImageField
          label="Share image"
          hint="1200×630px works best. Shown when your link is shared."
          value={v.ogImageUrl}
          onChange={(ogImageUrl) => patch({ ogImageUrl })}
          error={errors.ogImageUrl}
        />
      </SettingsCard>

      <SettingsCard title="Shop page" description="Heading at the top of the All products page.">
        <TextField
          label="Heading"
          value={v.shopHeading}
          onChange={(shopHeading) => patch({ shopHeading })}
          error={errors.shopHeading}
          maxLength={80}
        />
        <TextAreaField
          label="Description"
          value={v.shopDescription}
          onChange={(shopDescription) => patch({ shopDescription })}
          error={errors.shopDescription}
          maxLength={200}
          rows={2}
        />
      </SettingsCard>

      <SaveBar dirty={dirty} saving={saving} onReset={reset} />
    </form>
  );
}
