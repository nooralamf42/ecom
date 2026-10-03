"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveSettingsSection } from "@/app/admin/settings/actions";
import type { SettingsSection, SiteSettings } from "@/lib/settings/schema";

/** Local edit state for one settings section, saved as a whole. */
export function useSectionForm<K extends SettingsSection>(section: K, initial: SiteSettings[K]) {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const dirty = JSON.stringify(value) !== JSON.stringify(saved);

  function patch(p: Partial<SiteSettings[K]>) {
    setValue((v) => ({ ...v, ...p }));
  }

  async function save() {
    setSaving(true);
    const res = await saveSettingsSection(section, value);
    setSaving(false);
    if (!res.ok) {
      setErrors(res.fieldErrors ?? {});
      toast.error(res.error);
      return;
    }
    setErrors({});
    setValue(res.data);
    setSaved(res.data);
    toast.success("Saved — your store is updated");
    router.refresh();
  }

  function reset() {
    setValue(saved);
    setErrors({});
  }

  return { value, setValue, patch, errors, saving, dirty, save, reset };
}
