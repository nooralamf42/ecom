"use client";

import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Add / remove / reorder rows of any shape (FAQ, features, tiers…). */
export function ListEditor<T>({
  items,
  onChange,
  renderItem,
  newItem,
  max,
  addLabel = "Add",
  emptyText = "Nothing here yet.",
}: {
  items: T[];
  onChange: (items: T[]) => void;
  renderItem: (item: T, update: (next: T) => void, index: number) => ReactNode;
  newItem: () => T;
  max?: number;
  addLabel?: string;
  emptyText?: string;
}) {
  function move(from: number, to: number) {
    const next = [...items];
    const [it] = next.splice(from, 1);
    next.splice(to, 0, it);
    onChange(next);
  }

  const full = max !== undefined && items.length >= max;

  return (
    <div className="space-y-3">
      {items.length === 0 && <p className="text-sm text-muted-foreground">{emptyText}</p>}
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 rounded-xl border bg-background p-3">
          <div className="min-w-0 flex-1">
            {renderItem(item, (next) => onChange(items.map((x, j) => (j === i ? next : x))), i)}
          </div>
          <div className="flex shrink-0 flex-col gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={i === 0}
              onClick={() => move(i, i - 1)}
              aria-label="Move up"
            >
              <ArrowUp />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={i === items.length - 1}
              onClick={() => move(i, i + 1)}
              aria-label="Move down"
            >
              <ArrowDown />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              aria-label="Remove"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 />
            </Button>
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={full}
        onClick={() => onChange([...items, newItem()])}
        className="rounded-full"
      >
        <Plus /> {addLabel}
        {max !== undefined && (
          <span className="text-muted-foreground">
            ({items.length}/{max})
          </span>
        )}
      </Button>
    </div>
  );
}
