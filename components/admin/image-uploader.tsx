"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Upload, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ImageUploader({
  value,
  onChange,
  context = "product",
  allowUrl = true,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  context?: "product" | "review";
  allowUrl?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const signRes = await fetch("/api/cloudinary/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context }),
      });
      const sign = await signRes.json();
      if (!signRes.ok) {
        toast.error(sign.error ?? "Uploads not configured — paste an image URL instead");
        return;
      }
      const fd = new FormData();
      fd.append("file", file);
      fd.append("api_key", sign.apiKey);
      fd.append("timestamp", String(sign.timestamp));
      fd.append("signature", sign.signature);
      fd.append("folder", sign.folder);
      const up = await fetch(
        `https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`,
        { method: "POST", body: fd },
      );
      const data = await up.json();
      if (data.secure_url) {
        onChange([...value, data.secure_url]);
        toast.success("Image uploaded");
      } else {
        toast.error("Upload failed");
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function addUrl() {
    const trimmed = url.trim();
    if (!trimmed) return;
    onChange([...value, trimmed]);
    setUrl("");
  }

  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {value.map((src, i) => (
          <div
            key={i}
            className="group relative size-24 overflow-hidden rounded-xl border bg-muted"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Remove image"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="grid size-24 place-items-center rounded-xl border-2 border-dashed text-muted-foreground hover:border-primary hover:text-primary"
        >
          {uploading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <Upload className="size-5" />
          )}
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />

      {allowUrl && (
        <div className="mt-3 flex gap-2">
          <Input
            placeholder="…or paste an image URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addUrl();
              }
            }}
            className="rounded-xl"
          />
          <Button type="button" variant="secondary" onClick={addUrl} className="rounded-xl">
            <Plus className="size-4" /> Add
          </Button>
        </div>
      )}
    </div>
  );
}
