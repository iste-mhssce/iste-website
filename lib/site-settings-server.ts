import { prisma } from "./db";
import { DEFAULT_SITE_SETTINGS, SITE_SETTING_KEYS } from "./site-settings";

export async function loadSiteSettings(): Promise<Record<string, string>> {
  const settings = { ...DEFAULT_SITE_SETTINGS };
  try {
    const rows = await prisma.siteSetting.findMany({
      where: { key: { in: [...SITE_SETTING_KEYS] } },
    });
    for (const row of rows) {
      if (row.key in settings) settings[row.key as keyof typeof settings] = row.value;
    }
  } catch {
    // DB may be unreachable/migrated later — fall back to defaults.
  }
  return settings;
}