"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ExternalLink, Loader2 } from "lucide-react";
import { savePage, deletePage } from "@/app/admin/pages/actions";
import { slugify, type PageInput } from "@/lib/page-schema";
import { PAGE_TOKENS, fillPageTokens } from "@/lib/page-tokens";
import { useSiteSettings } from "@/components/providers/site-settings-provider";
import { Markdown } from "@/components/content/markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Field, SettingsCard, TextAreaField, TextField, Toggle } from "./settings/fields";

export type EditablePage = PageInput & { id: string };

export function PageForm({ page }: { page?: EditablePage }) {
  const router = useRouter();
  const settings = useSiteSettings();
  const storeName = settings.identity.storeName;
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [view, setView] = useState<"write" | "preview">("write");
  // Auto-fill the URL from the title until the admin edits it themselves.
  const [slugTouched, setSlugTouched] = useState(Boolean(page));
  const [form, setForm] = useState<PageInput>({
    title: page?.title ?? "",
    slug: page?.slug ?? "",
    content: page?.content ?? "",
    seoTitle: page?.seoTitle ?? "",
    seoDescription: page?.seoDescription ?? "",
    isPublished: page?.isPublished ?? true,
    showInFooter: page?.showInFooter ?? true,
    sortOrder: page?.sortOrder ?? 0,
  });

  function set<K extends keyof PageInput>(key: K, value: PageInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await savePage({ ...form, id: page?.id });
    setSaving(false);
    if (!res.ok) {
      setErrors(res.fieldErrors ?? {});
      toast.error(res.error ?? "Couldn't save");
      return;
    }
    setErrors({});
    toast.success(page ? "Page saved" : "Page created");
    if (page) router.refresh();
    else router.push(`/admin/pages/${res.id}/edit`);
  }

  async function onDelete() {
    if (!page || !confirm(`Delete "${page.title}"? This cannot be undone.`)) return;
    const res = await deletePage(page.id);
    if (!res.ok) {
      toast.error(res.error ?? "Couldn't delete");
      return;
    }
    toast.success("Page deleted");
    router.push("/admin/pages");
  }

  const previewText = fillPageTokens(form.content, settings);

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-5">
      <SettingsCard title="Page">
        <TextField
          label="Title"
          value={form.title}
          onChange={(title) => {
            set("title", title);
            if (!slugTouched) set("slug", slugify(title));
          }}
          error={errors.title}
          maxLength={120}
        />
        <Field
          label="URL"
          error={errors.slug}
          hint="Lowercase letters, numbers and dashes. Changing it breaks links people saved."
        >
          <div className="flex items-center rounded-md border focus-within:ring-2 focus-within:ring-ring/50">
            <span className="pl-3 text-sm text-muted-foreground">/</span>
            <input
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"));
              }}
              maxLength={80}
              className="h-9 w-full bg-transparent pr-3 text-sm outline-none"
              aria-invalid={errors.slug ? true : undefined}
            />
          </div>
        </Field>

        <Field label="Content" error={errors.content}>
          <div className="mb-2 flex gap-1">
            {(["write", "preview"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold capitalize",
                  view === v ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                )}
              >
                {v}
              </button>
            ))}
          </div>
          {view === "write" ? (
            <Textarea
              value={form.content}
              onChange={(e) => set("content", e.target.value)}
              rows={18}
              className="font-mono text-sm"
              placeholder={"## Heading\n\nWrite your page here. **Bold**, *italic*, - lists and [links](/products) work."}
            />
          ) : (
            <div className="min-h-64 rounded-md border bg-background p-5">
              {form.content.trim() ? (
                <Markdown>{previewText}</Markdown>
              ) : (
                <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>
              )}
            </div>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            Formatting: <code>## Heading</code>, <code>**bold**</code>, <code>- list item</code>,{" "}
            <code>[link text](/products)</code>. Placeholders filled from your settings:{" "}
            {PAGE_TOKENS.map((t, i) => (
              <span key={t.token}>
                <code title={t.label}>{`{{${t.token}}}`}</code>
                {i < PAGE_TOKENS.length - 1 ? ", " : ""}
              </span>
            ))}
          </p>
        </Field>
      </SettingsCard>

      <SettingsCard title="Search engines" description="Optional. Defaults to the page title.">
        <TextField
          label="SEO title"
          value={form.seoTitle}
          onChange={(v) => set("seoTitle", v)}
          error={errors.seoTitle}
          maxLength={70}
          hint={`${form.seoTitle.length}/70`}
        />
        <TextAreaField
          label="SEO description"
          value={form.seoDescription}
          onChange={(v) => set("seoDescription", v)}
          error={errors.seoDescription}
          maxLength={170}
          rows={2}
          hint={`${form.seoDescription.length}/170`}
        />
        <div className="rounded-xl border bg-background p-4">
          <p className="text-xs text-muted-foreground">Google preview</p>
          <p className="mt-1 truncate text-lg text-[#1a0dab]">
            {(form.seoTitle || form.title || "Page title") + ` · ${storeName}`}
          </p>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {form.seoDescription || "Add a description so people know what this page is about."}
          </p>
        </div>
      </SettingsCard>

      <SettingsCard title="Visibility">
        <Toggle
          label="Published"
          hint="Unpublished pages return “not found” to visitors."
          checked={form.isPublished}
          onChange={(v) => set("isPublished", v)}
        />
        <Toggle
          label="Show in footer"
          hint="Listed under Information in the site footer."
          checked={form.showInFooter}
          onChange={(v) => set("showInFooter", v)}
        />
        <Field label="Footer order" hint="Lower numbers come first." error={errors.sortOrder}>
          <Input
            type="number"
            min={0}
            max={999}
            value={form.sortOrder}
            onChange={(e) => set("sortOrder", Math.round(Number(e.target.value) || 0))}
            className="w-28"
          />
        </Field>
      </SettingsCard>

      <div className="flex flex-wrap items-center gap-3 border-t pt-5">
        <Button type="submit" disabled={saving} className="rounded-full">
          {saving && <Loader2 className="size-4 animate-spin" />}
          {page ? "Save page" : "Create page"}
        </Button>
        {page?.isPublished && (
          <Link
            href={`/${page.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            View page <ExternalLink className="size-3.5" />
          </Link>
        )}
        {page && (
          <Button type="button" variant="destructive" onClick={onDelete} className="ml-auto rounded-full">
            Delete
          </Button>
        )}
      </div>
    </form>
  );
}
