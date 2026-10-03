import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { clerkEnabled } from "@/lib/auth-config";

export const metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <div className="container-page grid min-h-[70vh] place-items-center py-16">
      {clerkEnabled ? (
        <SignIn />
      ) : (
        <div className="max-w-md rounded-3xl border bg-card p-8 text-center">
          <h1 className="font-heading text-2xl font-bold">Auth not configured</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Add your Clerk keys to <code>.env</code> to enable sign in. You can
            keep browsing and building your cart in the meantime.
          </p>
          <Link
            href="/products"
            className="mt-5 inline-block font-semibold text-primary hover:underline"
          >
            Back to shopping →
          </Link>
        </div>
      )}
    </div>
  );
}
