import { NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { DEFAULT_SITE_SETTINGS, SITE_SETTING_KEYS } from "@lib/site-settings";
import { logApi } from "@lib/log/logger";

export async function GET() {
  const start = Date.now();

  const defaults = { ...DEFAULT_SITE_SETTINGS };
  try {
    const rows = await prisma.siteSetting.findMany({
      where: { key: { in: [...SITE_SETTING_KEYS] } },
    });
    for (const row of rows) {
      defaults[row.key as keyof typeof defaults] = row.value;
    }
  } catch {
    // DB unreachable (e.g. migration not run) -> serve defaults.
  }

  logApi("settings", "list", { latencyMs: Date.now() - start, status: 200 });

  return NextResponse.json({ settings: defaults });
}