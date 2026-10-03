"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { saveProduct, deleteProduct } from "@/app/admin/actions";
import { ImageUploader } from "./image-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toPaise } from "@/lib/format";
import type { AdminProduct } from "@/lib/admin-data";

const accents = [
  "brand-berry",
  "brand-cherry",
  "brand-tangerine",
  "brand-grape",
  "brand-mint",
  "brand-sky",
  "brand-lemon",
  "brand-lavender",
  "brand-peach",
];

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export function ProductForm({
  product,
  categories = [],
}: {
  product?: AdminProduct;
  categories?: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [form, setForm] = useState({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    tagline: product?.tagline ?? "",
    description: product?.description ?? "",
    type: product?.type ?? "DRINK",
    price: product ? String(product.price / 100) : "",
    compareAtPrice: product?.compareAtPrice ? String(product.compareAtPrice / 100) : "",
    flavor: product?.flavor ?? "",
    mood: product?.mood ?? "",
    accentColor: product?.accentColor ?? "brand-berry",
    sizes: (product?.sizes ?? []).join(", "),
    benefits: (product?.benefits ?? []).join("\n"),
    ingredients: product?.ingredients ?? "",
    stock: product ? String(product.stock) : "0",
    featured: product?.featured ?? false,
    isActive: product?.isActive ?? true,
    categoryId: product?.categoryId ?? "",
    newCategory: "",
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await saveProduct({
      id: product?.id,
      name: form.name,
      slug: form.slug || slugify(form.name),
      tagline: form.tagline,
      description: form.description,
      type: form.type as AdminProduct["type"],
      price: toPaise(Number(form.price) || 0),
      compareAtPrice: form.compareAtPrice ? toPaise(Number(form.compareAtPrice)) : null,
      images,
      accentColor: form.accentColor,
      flavor: form.flavor,
      mood: form.mood,
      sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      benefits: form.benefits.split("\n").map((s) => s.trim()).filter(Boolean),
      ingredients: form.ingredients,
      stock: Number(form.stock) || 0,
      featured: form.featured,
      isActive: form.isActive,
      categoryId: form.categoryId || null,
      newCategory: form.newCategory,
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Product saved");
      router.push("/admin/products");
      router.refresh();
    } else {
      toast.error(res.error ?? "Failed to save");
    }
  }

  async function onDelete() {
    if (!product) return;
    if (!confirm("Delete this product? This cannot be undone.")) return;
    const res = await deleteProduct(product.id);
    if (res.ok) {
      toast.success("Product deleted");
      router.push("/admin/products");
      router.refresh();
    } else {
      toast.error(res.error ?? "Failed to delete");
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-6">
      <Field label="Images">
        <ImageUploader value={images} onChange={setImages} />
        <p className="mt-1.5 text-xs text-muted-foreground">
          Leave empty to use the branded illustration fallback.
        </p>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name">
          <Input
            required
            value={form.name}
            onChange={(e) => {
              set("name", e.target.value);
              if (!product) set("slug", slugify(e.target.value));
            }}
          />
        </Field>
        <Field label="Slug">
          <Input required value={form.slug} onChange={(e) => set("slug", e.target.value)} />
        </Field>
      </div>

      <Field label="Tagline">
        <Input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} />
      </Field>

      <Field label="Description">
        <Textarea
          required
          rows={3}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Type">
          <select
            value={form.type}
            onChange={(e) => set("type", e.target.value as typeof form.type)}
            className="h-9 w-full rounded-md border bg-transparent px-3 text-sm"
          >
            <option value="DRINK">Drink</option>
            <option value="GUMMY">Gummy</option>
            <option value="BUNDLE">Bundle</option>
          </select>
        </Field>
        <Field label="Price (₹)">
          <Input
            required
            type="number"
            min="0"
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
          />
        </Field>
        <Field label="Compare at (₹)">
          <Input
            type="number"
            min="0"
            value={form.compareAtPrice}
            onChange={(e) => set("compareAtPrice", e.target.value)}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Category">
          <select
            value={form.categoryId}
            onChange={(e) => set("categoryId", e.target.value)}
            disabled={!!form.newCategory}
            className="h-9 w-full rounded-md border bg-transparent px-3 text-sm disabled:opacity-50"
          >
            <option value="">— none —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="…or create a new category">
          <Input
            placeholder="e.g. Bangles"
            value={form.newCategory}
            onChange={(e) => set("newCategory", e.target.value)}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Flavour">
          <Input value={form.flavor} onChange={(e) => set("flavor", e.target.value)} />
        </Field>
        <Field label="Mood (gummies)">
          <Input value={form.mood} onChange={(e) => set("mood", e.target.value)} />
        </Field>
        <Field label="Stock">
          <Input
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) => set("stock", e.target.value)}
          />
        </Field>
      </div>

      <Field label="Accent colour">
        <div className="flex flex-wrap gap-2">
          {accents.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => set("accentColor", a)}
              className={`size-8 rounded-full border-2 ${
                form.accentColor === a ? "border-foreground" : "border-transparent"
              }`}
              style={{ backgroundColor: `var(--${a})` }}
              aria-label={a}
            />
          ))}
        </div>
      </Field>

      <Field label="Sizes (comma-separated, e.g. 2.2, 2.4, 2.6, 2.8)">
        <Input
          placeholder="2.2, 2.4, 2.6, 2.8"
          value={form.sizes}
          onChange={(e) => set("sizes", e.target.value)}
        />
      </Field>

      <Field label="Benefits (one per line)">
        <Textarea
          rows={3}
          value={form.benefits}
          onChange={(e) => set("benefits", e.target.value)}
        />
      </Field>

      <Field label="Ingredients">
        <Textarea
          rows={2}
          value={form.ingredients}
          onChange={(e) => set("ingredients", e.target.value)}
        />
      </Field>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => set("featured", e.target.checked)}
            className="size-4"
          />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => set("isActive", e.target.checked)}
            className="size-4"
          />
          Active (visible in store)
        </label>
      </div>

      <div className="flex items-center gap-3 border-t pt-5">
        <Button type="submit" disabled={saving} className="rounded-full">
          {saving && <Loader2 className="size-4 animate-spin" />}
          {product ? "Save changes" : "Create product"}
        </Button>
        {product && (
          <Button
            type="button"
            variant="destructive"
            onClick={onDelete}
            className="rounded-full"
          >
            Delete
          </Button>
        )}
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}
