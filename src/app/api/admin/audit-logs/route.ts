import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@lib/db";
import { requireRole } from "@lib/auth/guards";
import { logApi } from "@lib/log/logger";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const start = Date.now();
  const gate = await requireRole(req, "ADMIN");
  if (!("user" in gate)) return gate as Response;

  const action = req.nextUrl.searchParams.get("action") ?? undefined;
  const entity = req.nextUrl.searchParams.get("entity") ?? undefined;
  const limit = Math.min(200, Math.max(1, Number(req.nextUrl.searchParams.get("limit") ?? 100)));

  const where = {
    ...(action ? { action } : {}),
    ...(entity ? { entity } : {}),
  };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  logApi("audit-logs", "list", { latencyMs: Date.now() - start, status: 200, count: logs.length });

  return NextResponse.json({ logs, total });
}