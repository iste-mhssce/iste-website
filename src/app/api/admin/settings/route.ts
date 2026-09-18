import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@lib/db";
import { requireAdmin } from "@lib/auth/require-admin";
import { siteSettingsSchema } from "@lib/validators";
import { errorResponse } from "@lib/api";
import { logApi } from "@lib/log/logger";

export async function PATCH(req: NextRequest) {
  const start = Date.now();

  const auth = await requireAdmin(req);
  if (!auth.authorized) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: auth.reason ?? "Forbidden" },
      { status: 403 },
    );
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const parsed = siteSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error);
  }

  const entries = Object.entries(parsed.data);
  for (const [key, value] of entries) {
    await prisma.siteSetting.upsert({
      where: { key },
      create: { key, value: value ?? "" },
      update: { value: value ?? "" },
    });
  }

  logApi("settings", "updated", {
    latencyMs: Date.now() - start,
    status: 200,
    keys: entries.map(([k]) => k),
  });

  return NextResponse.json({ success: true });
}