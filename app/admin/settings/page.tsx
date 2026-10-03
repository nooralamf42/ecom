import { db, hasDatabase } from "@/lib/db";
import { defaultSettings, settingsFromRows } from "@/lib/settings/parse";
import {
  SETTINGS_TABS,
  SettingsTabs,
  type SettingsTab,
} from "@/components/admin/settings/settings-tabs";

export const metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const initialTab = (SETTINGS_TABS.find((t) => t.value === tab)?.value ?? "store") as SettingsTab;

  // Read straight from the database (not the storefront cache) so admins
  // always edit the latest saved values. A DB error should surface here
  // rather than show defaults that would overwrite real settings on save.
  const settings = hasDatabase
    ? settingsFromRows(await db.siteSetting.findMany())
    : defaultSettings();

  return (
    <div>
      <h2 className="font-heading text-2xl font-bold">Settings</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Your store name, look, homepage and shipping rules. Changes go live as soon as you save.
      </p>
      {!hasDatabase && (
        <p className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Connect a database to save settings. You&apos;re seeing the defaults.
        </p>
      )}
      <div className="mt-6">
        <SettingsTabs settings={settings} initialTab={initialTab} />
      </div>
    </div>
  );
}
