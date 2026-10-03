"use server";

import { revalidatePath, updateTag } from "next/cache";
import { db, hasDatabase } from "@/lib/db";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { assertAdmin } from "@/lib/admin-guard";
import { productSchema, type ProductInput } from "@/lib/validators";
import { fulfillOrder } from "@/lib/orders";

type ActionResult = { ok: boolean; error?: string; id?: string };

export async function saveProduct(
  input: ProductInput & { id?: string },
): Promise<ActionResult> {
  try {
    await assertAdmin();
    if (!hasDatabase) {
      return { ok: false, error: "Connect a database to save products." };
    }
    const parsed = productSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
    }
    const d = parsed.data;

    // Resolve category: create a new one when a name is supplied, else use the id.
    let categoryId = d.categoryId ?? null;
    if (d.newCategory && d.newCategory.trim()) {
      const name = d.newCategory.trim();
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
      const cat = await db.category.upsert({
        where: { slug },
        update: { name },
        create: { name, slug },
      });
      categoryId = cat.id;
    }

    const data = {
      name: d.name,
      slug: d.slug,
      tagline: d.tagline || null,
      description: d.description,
      type: d.type,
      price: d.price,
      compareAtPrice: d.compareAtPrice ?? null,
      images: d.images,
      accentColor: d.accentColor,
      flavor: d.flavor || null,
      mood: d.mood || null,
      sizes: d.sizes,
      benefits: d.benefits,
      ingredients: d.ingredients || null,
      stock: d.stock,
      featured: d.featured,
      isActive: d.isActive,
      categoryId,
    };

    let id = input.id;
    if (id) {
      await db.product.update({ where: { id }, data });
    } else {
      const created = await db.product.create({ data });
      id = created.id;
    }

    // Expire cached catalog data (incl. the old slug if it changed), then the
    // pages; "layout" also refreshes nav categories rendered by the root layout.
    updateTag(CACHE_TAGS.catalog);
    revalidatePath("/admin/products");
    revalidatePath("/", "layout");
    return { ok: true, id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to save" };
  }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  try {
    await assertAdmin();
    if (!hasDatabase) return { ok: false, error: "Database not configured" };
    await db.product.delete({ where: { id } });
    updateTag(CACHE_TAGS.catalog);
    revalidatePath("/admin/products");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to delete" };
  }
}

/** Admin-side cancel for orders that never got paid. */
export async function adminCancelOrderAction(
  orderId: string,
): Promise<ActionResult> {
  try {
    await assertAdmin();
    if (!hasDatabase) return { ok: false, error: "Database not configured" };
    const order = await db.order.findUnique({ where: { id: orderId } });
    if (!order) return { ok: false, error: "Order not found" };
    if (order.status !== "PENDING") {
      return { ok: false, error: "Only unpaid orders can be cancelled here." };
    }
    await db.order.update({ where: { id: orderId }, data: { status: "CANCELLED" } });
    revalidatePath("/admin/orders");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to cancel" };
  }
}

export async function fulfillOrderAction(
  orderId: string,
): Promise<ActionResult & { warning?: string; labelUrl?: string | null }> {
  try {
    await assertAdmin();
    const result = await fulfillOrder(orderId);
    revalidatePath("/admin/orders");
    return {
      ok: true,
      warning: result.warning,
      labelUrl: "labelUrl" in result ? result.labelUrl : undefined,
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to fulfill" };
  }
}
