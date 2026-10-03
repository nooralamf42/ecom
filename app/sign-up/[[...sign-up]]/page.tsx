import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { clerkEnabled } from "@/lib/auth-config";

export const metadata = { title: "Sign up" };

export default function SignUpPage() {
  return (
    <div className="container-page grid min-h-[70vh] place-items-center py-16">
      {clerkEnabled ? (
        <SignUp />
      ) : (
        <div className="max-w-md rounded-3xl border bg-card p-8 text-center">
          <h1 className="font-heading text-2xl font-bold">Auth not configured</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Add your Clerk keys to <code>.env</code> to enable sign up.
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
