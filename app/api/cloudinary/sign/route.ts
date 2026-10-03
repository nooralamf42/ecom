import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { cloudinaryEnabled, signUpload } from "@/lib/cloudinary";
import { isAdmin } from "@/lib/current-user";
import { clerkEnabled } from "@/lib/auth-config";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const context = body?.context;
  const isReview = context === "review";

  // Uploads always need a signed-in user; without Clerk nobody can upload.
  if (!clerkEnabled) {
    return NextResponse.json({ error: "Sign-in is not configured" }, { status: 403 });
  }
  if (isReview) {
    // Any signed-in customer may upload review photos.
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Please sign in" }, { status: 403 });
    }
  } else if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (!cloudinaryEnabled) {
    return NextResponse.json({ error: "Cloudinary is not configured" }, { status: 400 });
  }

  const folder = isReview ? "store/reviews" : context === "branding" ? "store/branding" : "store/products";
  return NextResponse.json(signUpload(folder));
}
