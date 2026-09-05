import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@lib/db";
import { intakeApplySchema } from "@lib/validators";
import { errorResponse, getClientIp } from "@lib/api";
import { rateLimit } from "@lib/ai/rateLimiter";
import { scoreIntakeApplication } from "@lib/ai/riskHeuristics";
import { logApi } from "@lib/log/logger";

export async function POST(req: NextRequest) {
  const start = Date.now();
  const ip = getClientIp(req);

  if (!rateLimit(`intake:${ip}`, 10)) {
    return NextResponse.json(
      { error: "RATE_LIMITED", message: "Too many application attempts" },
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

  const parsed = intakeApplySchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error);
  }
  const data = parsed.data;

  // Run risk heuristic BEFORE insert. The application is always saved; if the
  // heuristic flags it, status becomes FLAGGED for human review — never auto-rejected.
  const risk = await scoreIntakeApplication({
    fullName: data.fullName,
    email: data.email,
    portfolioUrl: data.portfolioUrl || undefined,
  });

  const application = await prisma.intakeApplication.create({
    data: {
      fullName: data.fullName,
      email: data.email.toLowerCase(),
      department: data.department,
      yearOfStudy: data.yearOfStudy,
      portfolioUrl: data.portfolioUrl || null,
      status: risk.flagged ? "FLAGGED" : "PENDING",
      riskFlags: risk.riskFlags,
    },
  });

  logApi("intake", "apply", {
    latencyMs: Date.now() - start,
    status: 201,
    flagged: risk.flagged,
  });

  return NextResponse.json(
    {
      success: true,
      id: application.id,
      status: application.status,
      underReview: true,
    },
    { status: 201 },
  );
}
