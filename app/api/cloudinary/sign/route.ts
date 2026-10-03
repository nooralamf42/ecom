import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { cloudinaryEnabled, signUpload } from "@/lib/cloudinary";
import { isAdmin } from "@/lib/current-user";
import { clerkEnabled } from "@/lib/auth-config";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const isReview = body?.context === "review";

  if (clerkEnabled) {
    if (isReview) {
      // Any signed-in customer may upload review photos.
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json({ error: "Please sign in" }, { status: 403 });
      }
    } else if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
  }

  if (!cloudinaryEnabled) {
    return NextResponse.json({ error: "Cloudinary is not configured" }, { status: 400 });
  }

  const folder = isReview ? "bangleish/reviews" : "bangleish/products";
  return NextResponse.json(signUpload(folder));
}
