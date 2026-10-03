import { auth } from "@clerk/nextjs/server";
import { db, hasDatabase } from "./db";
import { clerkEnabled } from "./auth-config";
import type { OrderStatus } from "@prisma/client";
import type { ReviewEligibility } from "./types";

// Statuses that count as a completed purchase.
const PURCHASED: OrderStatus[] = ["PAID", "FULFILLED", "SHIPPED", "DELIVERED"];

/** Has this DB user purchased this product (in a paid+ order)? */
export async function hasPurchased(userId: string, productId: string): Promise<boolean> {
  const count = await db.order.count({
    where: {
      userId,
      status: { in: PURCHASED },
      items: { some: { productId } },
    },
  });
  return count > 0;
}

/** Server-side eligibility for the current user to review a product. */
export async function getReviewEligibility(
  productId: string,
): Promise<ReviewEligibility> {
  const none = { signedIn: false, purchased: false, alreadyReviewed: false };
  if (!clerkEnabled || !hasDatabase) return none;

  const { userId } = await auth();
  if (!userId) return none;

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  });
  if (!user) return { signedIn: true, purchased: false, alreadyReviewed: false };

  const [purchased, existing] = await Promise.all([
    hasPurchased(user.id, productId),
    db.review.findFirst({
      where: { productId, userId: user.id },
      select: { id: true },
    }),
  ]);
  return { signedIn: true, purchased, alreadyReviewed: Boolean(existing) };
}
