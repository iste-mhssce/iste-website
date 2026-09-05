import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@lib/db";
import { certificateVerifyQuerySchema } from "@lib/validators";
import { errorResponse, getClientIp } from "@lib/api";
import { rateLimit } from "@lib/ai/rateLimiter";
import { logApi } from "@lib/log/logger";

export async function GET(req: NextRequest) {
  const start = Date.now();
  const ip = getClientIp(req);

  if (!rateLimit(`verify:${ip}`, 30)) {
    return NextResponse.json(
      { error: "RATE_LIMITED", message: "Too many verification attempts" },
      { status: 429 },
    );
  }

  const parsed = certificateVerifyQuerySchema.safeParse({
    id: req.nextUrl.searchParams.get("id"),
  });
  if (!parsed.success) {
    return errorResponse(parsed.error);
  }

  const certificate = await prisma.certificate.findUnique({
    where: { certificateId: parsed.data.id },
  });

  if (!certificate) {
    logApi("verify", "not found", {
      latencyMs: Date.now() - start,
      status: 404,
    });
    return NextResponse.json(
      { verified: false, message: "Certificate not found or not issued" },
      { status: 404 },
    );
  }

  logApi("verify", "verified", {
    latencyMs: Date.now() - start,
    status: 200,
  });

  const data: {
    certificateId: string;
    studentName: string;
    eventName: string;
    issuedAt: string;
    pdfUrl: string | null;
    pendingManualReview?: boolean;
    note?: string;
  } = {
    certificateId: certificate.certificateId,
    studentName: certificate.studentName,
    eventName: certificate.eventName,
    issuedAt: certificate.issueDate.toISOString(),
    pdfUrl: certificate.pdfUrl,
  };

  // If elevated risk, surface a subdued note rather than a hard block.
  if (certificate.riskScore >= 0.4) {
    data.pendingManualReview = true;
    data.note =
      "This credential is pending manual verification by the chapter team.";
  }

  return NextResponse.json({ verified: true, data });
}
