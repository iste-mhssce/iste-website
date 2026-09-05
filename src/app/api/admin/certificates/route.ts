import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@lib/db";
import { requireAdmin } from "@lib/auth/require-admin";
import { getClientIp } from "@lib/api";
import { rateLimit } from "@lib/ai/rateLimiter";
import { logApi } from "@lib/log/logger";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const start = Date.now();
  const ip = getClientIp(req);

  const auth = await requireAdmin(req);
  if (!auth.authorized) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: auth.reason ?? "Forbidden" },
      { status: 403 },
    );
  }

  if (!rateLimit(`admin-certs:${ip}`, 30)) {
    return NextResponse.json(
      { error: "RATE_LIMITED", message: "Too many requests" },
      { status: 429 },
    );
  }

  const highRiskOnly = req.nextUrl.searchParams.get("highRisk") === "true";
  const limit = Math.min(100, Math.max(1, Number(req.nextUrl.searchParams.get("limit") ?? 50)));
  const page = Math.max(1, Number(req.nextUrl.searchParams.get("page") ?? 1));

  const where = highRiskOnly ? { riskScore: { gte: 0.4 } } : {};

  const [certificates, total] = await Promise.all([
    prisma.certificate.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.certificate.count({ where }),
  ]);

  logApi("admin-certs", "list", { latencyMs: Date.now() - start, status: 200, count: certificates.length });

  return NextResponse.json({
    certificates,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
