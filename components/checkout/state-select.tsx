"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { INDIAN_STATES } from "@/lib/india-states";
import { cn } from "@/lib/utils";

export function StateSelect({
  value,
  onChange,
  id,
}: {
  value: string;
  onChange: (state: string) => void;
  id?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      // Focus the search box once the panel mounts.
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [open]);

  const filtered = INDIAN_STATES.filter((s) =>
    s.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div ref={rootRef} className="relative">
      <button
        id={id}
        type="button"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-xl border bg-transparent px-3 text-sm",
          !value && "text-muted-foreground",
        )}
      >
        <span className="truncate">{value || "Select state"}</span>
        <ChevronDown className="size-4 shrink-0 opacity-60" />
      </button>

      {open && (
        <div className="absolute z-30 mt-1.5 w-full overflow-hidden rounded-xl border bg-popover shadow-lg">
          <div className="flex items-center gap-2 border-b px-3 py-2">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setOpen(false);
                if (e.key === "Enter" && filtered.length > 0) {
                  onChange(filtered[0]);
                  setOpen(false);
                }
              }}
              placeholder="Search state…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <ul className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted-foreground">No states found</li>
            ) : (
              filtered.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(s);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted",
                      s === value && "font-semibold text-primary",
                    )}
                  >
                    {s}
                    {s === value && <Check className="size-4" />}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
