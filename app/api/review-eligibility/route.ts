import { NextResponse } from "next/server";
import { getReviewEligibility } from "@/lib/reviews";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  if (!productId) {
    return NextResponse.json({
      signedIn: false,
      purchased: false,
      alreadyReviewed: false,
    });
  }
  const eligibility = await getReviewEligibility(productId);
  return NextResponse.json(eligibility);
}
