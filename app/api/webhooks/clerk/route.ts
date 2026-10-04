import { Webhook } from "svix";
import { headers } from "next/headers";
import { db, hasDatabase } from "@/lib/db";
import { syncClerkUser } from "@/lib/user-sync";

type ClerkUser = {
  id: string;
  primary_email_address_id?: string | null;
  email_addresses?: { id?: string; email_address: string; verification?: { status?: string } | null }[];
  first_name?: string | null;
  last_name?: string | null;
  image_url?: string | null;
};

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
  if (!secret) {
    return new Response("Webhook not configured", { status: 200 });
  }

  const h = await headers();
  const svixId = h.get("svix-id");
  const svixTimestamp = h.get("svix-timestamp");
  const svixSignature = h.get("svix-signature");
  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await req.text();
  let evt: { type: string; data: ClerkUser };
  try {
    const wh = new Webhook(secret);
    evt = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as { type: string; data: ClerkUser };
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (!hasDatabase) return new Response("ok", { status: 200 });

  const { type, data } = evt;

  if (type === "user.created" || type === "user.updated") {
    const primary =
      data.email_addresses?.find((e) => e.id && e.id === data.primary_email_address_id) ??
      data.email_addresses?.[0];
    await syncClerkUser({
      clerkId: data.id,
      email: primary?.email_address ?? null,
      emailVerified: primary?.verification?.status === "verified",
      name: [data.first_name, data.last_name].filter(Boolean).join(" ") || null,
      imageUrl: data.image_url ?? null,
    });
  }

  if (type === "user.deleted") {
    await db.user.deleteMany({ where: { clerkId: data.id } });
  }

  return new Response("ok", { status: 200 });
}
