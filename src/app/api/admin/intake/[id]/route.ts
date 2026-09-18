import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@lib/db";
import { requireRole } from "@lib/auth/guards";
import { getClientIp } from "@lib/api";
import { rateLimit } from "@lib/ai/rateLimiter";
import { logApi } from "@lib/log/logger";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const start = Date.now();
  const ip = getClientIp(req);
  const { id } = await params;

  const gate = await requireRole(req, "ADMIN");
  if (!("user" in gate)) return gate as Response;

  if (!rateLimit(`admin-intake:${ip}`, 20)) {
    return NextResponse.json(
      { error: "RATE_LIMITED", message: "Too many requests" },
      { status: 429 },
    );
  }

  const body = await req.json().catch(() => null);
  const status = body?.status;
  const valid = ["PENDING", "UNDER_REVIEW", "ACCEPTED", "REJECTED", "FLAGGED"];
  if (!valid.includes(status)) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: "Invalid status" },
      { status: 400 },
    );
  }

  const existing = await prisma.intakeApplication.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(
      { error: "NOT_FOUND", message: "Application not found" },
      { status: 404 },
    );
  }

  const updated = await prisma.intakeApplication.update({
    where: { id },
    data: { status },
  });

  logApi("admin-intake", "update", { latencyMs: Date.now() - start, status: 200, toStatus: status });

  return NextResponse.json({ application: updated });
}
