"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { refreshStoreCache } from "@/app/admin/settings/actions";
import type { SiteSettings } from "@/lib/settings/schema";
import { IdentityForm } from "./identity-form";
import { ThemeForm } from "./theme-form";
import { HomepageForm } from "./homepage-form";
import { CommerceForm } from "./commerce-form";
import { SETTINGS_TABS, type SettingsTab } from "./tabs";

export function SettingsTabs({
  settings,
  initialTab,
}: {
  settings: SiteSettings;
  initialTab: SettingsTab;
}) {
  return (
    <Tabs
      defaultValue={initialTab}
      onValueChange={(tab) => {
        // Keep the open tab in the URL so a refresh lands on it.
        const url = new URL(window.location.href);
        url.searchParams.set("tab", String(tab));
        window.history.replaceState(null, "", url);
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabsList className="h-auto flex-wrap">
          {SETTINGS_TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="px-3 py-1.5">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <RefreshCacheButton />
      </div>

      {/* Each form keeps its own unsaved edits while you switch tabs. */}
      <TabsContent value="store" keepMounted className="mt-4">
        <IdentityForm initial={settings.identity} />
      </TabsContent>
      <TabsContent value="theme" keepMounted className="mt-4">
        <ThemeForm initial={settings.theme} />
      </TabsContent>
      <TabsContent value="homepage" keepMounted className="mt-4">
        <HomepageForm initial={settings.homepage} />
      </TabsContent>
      <TabsContent value="shipping" keepMounted className="mt-4">
        <CommerceForm initial={settings.commerce} />
      </TabsContent>
    </Tabs>
  );
}

function RefreshCacheButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={busy}
      className="rounded-full"
      title="Use after importing products or editing the database directly"
      onClick={async () => {
        setBusy(true);
        const res = await refreshStoreCache();
        setBusy(false);
        if (res.ok) {
          toast.success("Store refreshed — visitors now see the latest data");
          router.refresh();
        } else {
          toast.error(res.error ?? "Couldn't refresh");
        }
      }}
    >
      {busy ? <Loader2 className="animate-spin" /> : <RefreshCw />}
      Refresh store data
    </Button>
  );
}
