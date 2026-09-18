import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@lib/db";
import { requireRole } from "@lib/auth/guards";
import { getClientIp } from "@lib/api";
import { rateLimit } from "@lib/ai/rateLimiter";
import { logApi } from "@lib/log/logger";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const start = Date.now();
  const ip = getClientIp(req);

  const gate = await requireRole(req, "ADMIN");
  if (!("user" in gate)) return gate as Response;

  if (!rateLimit(`admin-intake:${ip}`, 30)) {
    return NextResponse.json(
      { error: "RATE_LIMITED", message: "Too many requests" },
      { status: 429 },
    );
  }

  const status = req.nextUrl.searchParams.get("status") ?? undefined;
  const page = Math.max(1, Number(req.nextUrl.searchParams.get("page") ?? 1));
  const limit = Math.min(50, Math.max(1, Number(req.nextUrl.searchParams.get("limit") ?? 20)));

  const where = status ? { status: status as "PENDING" | "UNDER_REVIEW" | "ACCEPTED" | "REJECTED" | "FLAGGED" } : {};

  const [applications, total] = await Promise.all([
    prisma.intakeApplication.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.intakeApplication.count({ where }),
  ]);

  // Small summary counts for the dashboard header.
  const counts = await prisma.intakeApplication.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  const summary: Record<string, number> = {};
  for (const c of counts) {
    summary[c.status] = c._count._all;
  }

  logApi("admin-intake", "list", { latencyMs: Date.now() - start, status: 200, count: applications.length });

  return NextResponse.json({
    applications,
    summary,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
