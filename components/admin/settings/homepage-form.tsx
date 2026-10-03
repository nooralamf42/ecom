"use client";

import { FEATURE_ICONS, type FeatureIcon, type HomepageSettings } from "@/lib/settings/schema";
import { FEATURE_ICON_COMPONENTS } from "@/components/feature-icons";
import { Input } from "@/components/ui/input";
import { useSectionForm } from "./use-section-form";
import { ListEditor } from "./list-editor";
import { Field, SaveBar, SettingsCard, TextAreaField, TextField, Toggle } from "./fields";

type Cta = HomepageSettings["hero"]["primaryCta"];

const SECTION_LABELS: Record<keyof HomepageSettings["sections"], string> = {
  hero: "Hero banner",
  marquee: "Scrolling announcement strip",
  products: "Featured products",
  features: "Why shop with us",
  testimonials: "Customer reviews",
  promo: "Spend more, save more",
  faq: "FAQ",
};

export function HomepageForm({ initial }: { initial: HomepageSettings }) {
  const { value: v, patch, errors, saving, dirty, save, reset } = useSectionForm("homepage", initial);

  /** Merge into one nested block, e.g. sub("hero", { headline }). */
  function sub<K extends Exclude<keyof HomepageSettings, "marquee">>(
    key: K,
    p: Partial<HomepageSettings[K]>,
  ) {
    patch({ [key]: { ...v[key], ...p } } as Partial<HomepageSettings>);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="space-y-5"
    >
      <SettingsCard title="Sections" description="Turn homepage sections on or off.">
        <div className="grid gap-3 sm:grid-cols-2">
          {(Object.keys(SECTION_LABELS) as (keyof typeof SECTION_LABELS)[]).map((key) => (
            <Toggle
              key={key}
              label={SECTION_LABELS[key]}
              checked={v.sections[key]}
              onChange={(on) => sub("sections", { [key]: on })}
            />
          ))}
        </div>
      </SettingsCard>

      <SettingsCard title="Hero banner" description="The first thing visitors see.">
        <TextField
          label="Badge"
          hint="Small pill above the headline. Leave empty to hide."
          value={v.hero.badge}
          onChange={(badge) => sub("hero", { badge })}
          error={errors["hero.badge"]}
          maxLength={60}
        />
        <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
          <TextField
            label="Headline"
            value={v.hero.headline}
            onChange={(headline) => sub("hero", { headline })}
            error={errors["hero.headline"]}
            maxLength={80}
          />
          <TextField
            label="Highlighted word"
            hint="Shown in your brand color after the headline."
            value={v.hero.highlight}
            onChange={(highlight) => sub("hero", { highlight })}
            error={errors["hero.highlight"]}
            maxLength={40}
          />
        </div>
        <TextAreaField
          label="Text under the headline"
          value={v.hero.subtext}
          onChange={(subtext) => sub("hero", { subtext })}
          error={errors["hero.subtext"]}
          maxLength={300}
          rows={2}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <CtaFields
            label="Main button"
            value={v.hero.primaryCta}
            onChange={(primaryCta) => sub("hero", { primaryCta })}
            error={errors["hero.primaryCta.href"]}
          />
          <CtaFields
            label="Second button"
            value={v.hero.secondaryCta}
            onChange={(secondaryCta) => sub("hero", { secondaryCta })}
            error={errors["hero.secondaryCta.href"]}
          />
        </div>
        <TextField
          label="Rating line"
          hint="Next to the five stars. Leave empty to hide."
          value={v.hero.ratingText}
          onChange={(ratingText) => sub("hero", { ratingText })}
          error={errors["hero.ratingText"]}
          maxLength={80}
        />
      </SettingsCard>

      <SettingsCard title="Announcement strip" description="Short messages scrolling under the hero.">
        <ListEditor
          items={v.marquee}
          onChange={(marquee) => patch({ marquee })}
          max={12}
          addLabel="Add message"
          newItem={() => ""}
          renderItem={(item, update, i) => (
            <Input
              value={item}
              onChange={(e) => update(e.target.value)}
              maxLength={60}
              placeholder="e.g. Free shipping over ₹999"
              aria-invalid={errors[`marquee.${i}`] ? true : undefined}
            />
          )}
        />
      </SettingsCard>

      <SettingsCard title="Featured products" description="Products marked Featured are shown here (newest if none).">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Small heading"
            value={v.products.eyebrow}
            onChange={(eyebrow) => sub("products", { eyebrow })}
            maxLength={40}
          />
          <TextField
            label="Title"
            value={v.products.title}
            onChange={(title) => sub("products", { title })}
            maxLength={80}
          />
        </div>
        <TextAreaField
          label="Description"
          value={v.products.description}
          onChange={(description) => sub("products", { description })}
          maxLength={200}
          rows={2}
        />
      </SettingsCard>

      <SettingsCard title="Why shop with us" description="Up to 8 reasons, each with an icon.">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Small heading"
            value={v.features.eyebrow}
            onChange={(eyebrow) => sub("features", { eyebrow })}
            maxLength={40}
          />
          <TextField
            label="Title"
            value={v.features.title}
            onChange={(title) => sub("features", { title })}
            maxLength={80}
          />
        </div>
        <ListEditor
          items={v.features.items}
          onChange={(items) => sub("features", { items })}
          max={8}
          addLabel="Add reason"
          newItem={() => ({ icon: "sparkles" as FeatureIcon, title: "", copy: "" })}
          renderItem={(item, update, i) => {
            const Icon = FEATURE_ICON_COMPONENTS[item.icon];
            return (
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-[10rem_1fr]">
                  <Field label="Icon">
                    <div className="flex items-center gap-2">
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted">
                        <Icon className="size-4" />
                      </span>
                      <select
                        value={item.icon}
                        onChange={(e) => update({ ...item, icon: e.target.value as FeatureIcon })}
                        className="h-9 w-full rounded-md border bg-transparent px-2 text-sm"
                      >
                        {FEATURE_ICONS.map((name) => (
                          <option key={name} value={name}>
                            {name.replace(/-/g, " ")}
                          </option>
                        ))}
                      </select>
                    </div>
                  </Field>
                  <TextField
                    label="Title"
                    value={item.title}
                    onChange={(title) => update({ ...item, title })}
                    error={errors[`features.items.${i}.title`]}
                    maxLength={60}
                  />
                </div>
                <TextField
                  label="Text"
                  value={item.copy}
                  onChange={(copy) => update({ ...item, copy })}
                  error={errors[`features.items.${i}.copy`]}
                  maxLength={160}
                />
              </div>
            );
          }}
        />
      </SettingsCard>

      <SettingsCard title="Customer reviews" description="Heading above the reviews section.">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Title"
            value={v.testimonials.title}
            onChange={(title) => sub("testimonials", { title })}
            maxLength={80}
          />
          <TextField
            label="Subtitle"
            value={v.testimonials.subtitle}
            onChange={(subtitle) => sub("testimonials", { subtitle })}
            maxLength={160}
          />
        </div>
      </SettingsCard>

      <SettingsCard
        title="Spend more, save more"
        description="The offer cards are built from your Shipping & Discounts rules. Hidden when there are no offers."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Title"
            value={v.promo.title}
            onChange={(title) => sub("promo", { title })}
            maxLength={80}
          />
          <TextField
            label="Subtitle"
            value={v.promo.subtitle}
            onChange={(subtitle) => sub("promo", { subtitle })}
            maxLength={200}
          />
        </div>
        <CtaFields
          label="Button"
          value={v.promo.cta}
          onChange={(cta) => sub("promo", { cta })}
          error={errors["promo.cta.href"]}
        />
      </SettingsCard>

      <SettingsCard title="FAQ" description="Common questions, shown at the bottom of the homepage.">
        <TextField
          label="Title"
          value={v.faq.title}
          onChange={(title) => sub("faq", { title })}
          maxLength={80}
        />
        <ListEditor
          items={v.faq.items}
          onChange={(items) => sub("faq", { items })}
          max={20}
          addLabel="Add question"
          newItem={() => ({ q: "", a: "" })}
          renderItem={(item, update, i) => (
            <div className="space-y-3">
              <TextField
                label="Question"
                value={item.q}
                onChange={(q) => update({ ...item, q })}
                error={errors[`faq.items.${i}.q`]}
                maxLength={160}
              />
              <TextAreaField
                label="Answer"
                value={item.a}
                onChange={(a) => update({ ...item, a })}
                error={errors[`faq.items.${i}.a`]}
                maxLength={1000}
              />
            </div>
          )}
        />
      </SettingsCard>

      <SaveBar dirty={dirty} saving={saving} onReset={reset} />
    </form>
  );
}

function CtaFields({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: Cta;
  onChange: (v: Cta) => void;
  error?: string;
}) {
  return (
    <Field label={label} hint="Leave the text empty to hide the button." error={error}>
      <div className="grid grid-cols-[1fr_1.2fr] gap-2">
        <Input
          value={value.label}
          onChange={(e) => onChange({ ...value, label: e.target.value })}
          placeholder="Button text"
          maxLength={40}
        />
        <Input
          value={value.href}
          onChange={(e) => onChange({ ...value, href: e.target.value })}
          placeholder="/products"
          aria-invalid={error ? true : undefined}
        />
      </div>
    </Field>
  );
}
