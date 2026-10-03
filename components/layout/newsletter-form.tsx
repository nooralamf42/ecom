"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function NewsletterForm() {
  const [email, setEmail] = useState("");

  return (
    <form
      className="mt-5 flex max-w-xs items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!email) return;
        toast.success("You're on the list! Watch your inbox for good vibes.");
        setEmail("");
      }}
    >
      <Input
        type="email"
        required
        placeholder="Email for 10% off"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded-full bg-white"
      />
      <Button type="submit" size="icon" className="shrink-0 rounded-full" aria-label="Subscribe">
        <ArrowRight className="size-4" />
      </Button>
    </form>
  );
}
