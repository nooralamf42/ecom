"use server";

import { getUserAddresses, deleteUserAddress, type SavedAddress } from "@/lib/addresses";

export async function listAddressesAction(): Promise<SavedAddress[]> {
  return getUserAddresses();
}

export async function deleteAddressAction(
  addressId: string,
): Promise<{ ok: boolean }> {
  const ok = await deleteUserAddress(addressId);
  return { ok };
}
