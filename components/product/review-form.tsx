"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ShoppingBag, Star } from "lucide-react";
import { SignInButton, useUser } from "@clerk/nextjs";
import { submitReview } from "@/app/products/actions";
import { ImageUploader } from "@/components/admin/image-uploader";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { clerkEnabled } from "@/lib/auth-config";

type Eligibility = { purchased: boolean; alreadyReviewed: boolean };

export function ReviewForm({ productId }: { productId: string }) {
  if (!clerkEnabled) return null;
  return <ReviewFormBody productId={productId} />;
}

function ReviewFormBody({ productId }: { productId: string }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const [elig, setElig] = useState<Eligibility | null>(null);

  useEffect(() => {
    if (!isSignedIn) {
      setElig(null);
      return;
    }
    let active = true;
    fetch(`/api/review-eligibility?productId=${productId}`)
      .then((r) => r.json())
      .then((d) => {
        if (active) setElig({ purchased: !!d.purchased, alreadyReviewed: !!d.alreadyReviewed });
      })
      .catch(() => {
        if (active) setElig({ purchased: false, alreadyReviewed: false });
      });
    return () => {
      active = false;
    };
  }, [isSignedIn, productId]);

  return (
    <div id="write-review" className="mt-10 rounded-3xl border bg-card p-6">
      <h3 className="text-lg font-bold">Write a review</h3>

      {!isLoaded ? (
        <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading…
        </p>
      ) : !isSignedIn ? (
        <>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to review products you&apos;ve purchased.
          </p>
          <SignInButton mode="modal">
            <Button className="mt-4 rounded-full">Sign in</Button>
          </SignInButton>
        </>
      ) : elig === null ? (
        <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Checking your orders…
        </p>
      ) : !elig.purchased ? (
        <div className="mt-2 flex items-start gap-3 rounded-2xl bg-brand-cream/70 p-4 text-sm">
          <ShoppingBag className="mt-0.5 size-5 shrink-0 text-primary" />
          <div>
            <p className="font-semibold text-foreground">
              Only verified buyers can review this product.
            </p>
            <p className="mt-0.5 text-muted-foreground">
              Once you&apos;ve purchased these bangles, you can share your photos
              and experience here.
            </p>
            <Link
              href="/products"
              className={cn(buttonVariants({ variant: "secondary" }), "mt-3 rounded-full")}
            >
              Shop bangles
            </Link>
          </div>
        </div>
      ) : (
        <ReviewFormInner
          productId={productId}
          alreadyReviewed={elig.alreadyReviewed}
          defaultName={user?.fullName ?? ""}
        />
      )}
    </div>
  );
}

function ReviewFormInner({
  productId,
  alreadyReviewed,
  defaultName,
}: {
  productId: string;
  alreadyReviewed: boolean;
  defaultName: string;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [author, setAuthor] = useState(defaultName);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1) {
      toast.error("Please pick a star rating");
      return;
    }
    setSaving(true);
    const res = await submitReview({ productId, author, rating, comment, images });
    setSaving(false);
    if (res.ok) {
      toast.success("Thanks for your review! 💛");
      setComment("");
      setImages([]);
      router.refresh();
    } else {
      toast.error(res.error ?? "Could not submit review");
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-4">
      {alreadyReviewed && (
        <p className="rounded-xl bg-brand-mint/30 px-3 py-2 text-sm font-medium">
          You&apos;ve reviewed this before — submitting will update your review.
        </p>
      )}

      <div>
        <Label className="mb-1.5 block">Your rating</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
            >
              <Star
                className={
                  "size-7 transition-colors " +
                  ((hover || rating) >= n
                    ? "fill-brand-tangerine text-brand-tangerine"
                    : "text-muted-foreground/30")
                }
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="rv-name" className="mb-1.5 block">
          Name
        </Label>
        <Input
          id="rv-name"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Your name"
          className="rounded-xl"
          required
        />
      </div>

      <div>
        <Label htmlFor="rv-comment" className="mb-1.5 block">
          Review
        </Label>
        <Textarea
          id="rv-comment"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="How did you like the bangles? How was the fit and quality?"
          className="rounded-xl"
          required
        />
      </div>

      <div>
        <Label className="mb-1.5 block">Add photos (optional)</Label>
        <ImageUploader
          value={images}
          onChange={setImages}
          context="review"
          allowUrl={false}
        />
      </div>

      <Button type="submit" disabled={saving} className="rounded-full">
        {saving && <Loader2 className="size-4 animate-spin" />}
        {alreadyReviewed ? "Update review" : "Submit review"}
      </Button>
    </form>
  );
}
