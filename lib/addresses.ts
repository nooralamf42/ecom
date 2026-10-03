import { db, hasDatabase } from "./db";
import { getDbUser } from "./current-user";
import type { AddressInput } from "./validators";

export type SavedAddress = {
  id: string;
  name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
};

/** Saved addresses for the signed-in customer, most recent first. */
export async function getUserAddresses(): Promise<SavedAddress[]> {
  if (!hasDatabase) return [];
  const user = await getDbUser();
  if (!user) return [];
  const rows = await db.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
  return rows.map((a) => ({
    id: a.id,
    name: a.name,
    phone: a.phone,
    line1: a.line1,
    line2: a.line2,
    city: a.city,
    state: a.state,
    pincode: a.pincode,
    isDefault: a.isDefault,
  }));
}

/**
 * Save a shipping address for the signed-in customer. Reuses an existing
 * address if one already matches exactly, so repeat checkouts don't pile up
 * duplicates. The newest saved address becomes the default.
 */
export async function saveUserAddress(
  input: Omit<AddressInput, "email">,
): Promise<string | null> {
  if (!hasDatabase) return null;
  const user = await getDbUser();
  if (!user) return null;

  const existing = await db.address.findFirst({
    where: {
      userId: user.id,
      name: input.name,
      phone: input.phone,
      line1: input.line1,
      line2: input.line2 || null,
      city: input.city,
      state: input.state,
      pincode: input.pincode,
    },
  });

  await db.address.updateMany({
    where: { userId: user.id },
    data: { isDefault: false },
  });

  if (existing) {
    await db.address.update({ where: { id: existing.id }, data: { isDefault: true } });
    return existing.id;
  }

  const created = await db.address.create({
    data: {
      userId: user.id,
      name: input.name,
      phone: input.phone,
      line1: input.line1,
      line2: input.line2 || null,
      city: input.city,
      state: input.state,
      pincode: input.pincode,
      isDefault: true,
    },
  });
  return created.id;
}

export async function deleteUserAddress(addressId: string): Promise<boolean> {
  if (!hasDatabase) return false;
  const user = await getDbUser();
  if (!user) return false;
  const res = await db.address.deleteMany({
    where: { id: addressId, userId: user.id },
  });
  return res.count > 0;
}
