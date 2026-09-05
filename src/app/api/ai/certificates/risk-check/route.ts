import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@lib/db";
import { riskCheckQuerySchema } from "@lib/validators";
import { errorResponse, getClientIp } from "@lib/api";
import { requireAdmin } from "@lib/auth/require-admin";
import { scoreCertificate } from "@lib/ai/riskHeuristics";
import { rateLimit } from "@lib/ai/rateLimiter";
import { logApi } from "@lib/log/logger";

/**
 * Admin-only: recompute the risk score for a certificate on demand.
 * Does not alter verification status — it only refreshes the advisory risk score
 * that admins see in their review workflow.
 */
export async function POST(req: NextRequest) {
  const start = Date.now();
  const ip = getClientIp(req);

  const auth = await requireAdmin(req);
  if (!auth.authorized) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: auth.reason ?? "Forbidden" },
      { status: 403 },
    );
  }

  if (!rateLimit(`riskcheck:${ip}`, 10)) {
    return NextResponse.json(
      { error: "RATE_LIMITED", message: "Too many requests" },
      { status: 429 },
    );
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const parsed = riskCheckQuerySchema.safeParse({
    certificateId: body.certificateId,
  });
  if (!parsed.success) {
    return errorResponse(parsed.error);
  }

  const certificate = await prisma.certificate.findUnique({
    where: { certificateId: parsed.data.certificateId },
  });
  if (!certificate) {
    return NextResponse.json(
      { error: "NOT_FOUND", message: "Certificate not found" },
      { status: 404 },
    );
  }

  const risk = await scoreCertificate({
    certificateId: certificate.certificateId,
    studentName: certificate.studentName,
    eventName: certificate.eventName,
    issueDate: certificate.issueDate,
  });

  const updated = await prisma.certificate.update({
    where: { id: certificate.id },
    data: { riskScore: risk.riskScore },
  });

  logApi("risk-check", "recomputed", {
    latencyMs: Date.now() - start,
    status: 200,
    riskScore: risk.riskScore,
  });

  return NextResponse.json({
    certificateId: updated.certificateId,
    riskScore: updated.riskScore,
    riskFlags: risk.riskFlags,
  });
}
