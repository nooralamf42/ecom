import { Webhook } from "svix";
import { headers } from "next/headers";
import { db, hasDatabase } from "@/lib/db";

const adminList = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

type ClerkUser = {
  id: string;
  email_addresses?: { email_address: string }[];
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
    const email = data.email_addresses?.[0]?.email_address ?? `${data.id}@clerk.local`;
    const name = [data.first_name, data.last_name].filter(Boolean).join(" ") || null;
    const isAdmin =
      adminList.includes(data.id.toLowerCase()) ||
      adminList.includes(email.toLowerCase());
    await db.user.upsert({
      where: { clerkId: data.id },
      update: { email, name, imageUrl: data.image_url ?? null },
      create: {
        clerkId: data.id,
        email,
        name,
        imageUrl: data.image_url ?? null,
        role: isAdmin ? "ADMIN" : "CUSTOMER",
      },
    });
  }

  if (type === "user.deleted") {
    await db.user.deleteMany({ where: { clerkId: data.id } });
  }

  return new Response("ok", { status: 200 });
}
