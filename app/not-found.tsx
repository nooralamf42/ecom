import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="container-page grid min-h-[70vh] place-items-center py-16 text-center">
      <div>
        <p className="font-heading text-8xl font-bold text-primary">404</p>
        <h1 className="mt-4 font-heading text-3xl font-bold">
          This page fizzled out
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist — but there&apos;s
          plenty of joy back at the shop.
        </p>
        <Link href="/" className={cn(buttonVariants({ size: "lg" }), "mt-6 rounded-full")}>
          Back home
        </Link>
      </div>
    </div>
  );
}
