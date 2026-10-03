"use server";

import { revalidatePath } from "next/cache";
import { db, hasDatabase } from "@/lib/db";
import { getDbUser } from "@/lib/current-user";
import { clerkEnabled } from "@/lib/auth-config";
import { reviewSchema, type ReviewInput } from "@/lib/validators";
import { hasPurchased } from "@/lib/reviews";

export async function submitReview(
  input: ReviewInput,
): Promise<{ ok: boolean; error?: string }> {
  if (!hasDatabase) {
    return { ok: false, error: "Reviews aren't available right now." };
  }

  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  // Require a signed-in customer so reviews are genuine.
  const user = clerkEnabled ? await getDbUser() : null;
  if (clerkEnabled && !user) {
    return { ok: false, error: "Please sign in to write a review." };
  }

  const d = parsed.data;
  try {
    // Only verified buyers may review — enforced server-side.
    if (user) {
      const purchased = await hasPurchased(user.id, d.productId);
      if (!purchased) {
        return {
          ok: false,
          error: "You can only review products you've purchased.",
        };
      }
    }

    const product = await db.product.findUnique({
      where: { id: d.productId },
      select: { slug: true },
    });

    // One review per customer per product — update if they already left one.
    const existing = user
      ? await db.review.findFirst({
          where: { productId: d.productId, userId: user.id },
          select: { id: true },
        })
      : null;

    if (existing) {
      await db.review.update({
        where: { id: existing.id },
        data: {
          author: d.author,
          rating: d.rating,
          comment: d.comment,
          images: d.images,
        },
      });
    } else {
      await db.review.create({
        data: {
          productId: d.productId,
          userId: user?.id ?? null,
          author: d.author,
          rating: d.rating,
          comment: d.comment,
          images: d.images,
        },
      });
    }

    if (product) revalidatePath(`/products/${product.slug}`);
    return { ok: true, error: undefined };
  } catch (err) {
    console.error("submitReview failed", err);
    return { ok: false, error: "Could not submit your review. Please try again." };
  }
}
