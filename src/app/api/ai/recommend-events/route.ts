import { NextResponse, type NextRequest } from "next/server";
import { recommendEventsSchema } from "@lib/validators";
import { errorResponse } from "@lib/api";
import { rateLimit } from "@lib/ai/rateLimiter";
import { scoreEvents } from "@lib/ai/recommend";
import { getClientIp } from "@lib/api";
import { logApi } from "@lib/log/logger";

export async function GET(req: NextRequest) {
  const start = Date.now();
  const ip = getClientIp(req);

  if (!rateLimit(`recommend:${ip}`, 30)) {
    return NextResponse.json(
      { error: "RATE_LIMITED", message: "Too many recommendation requests" },
      { status: 429 },
    );
  }

  const parsed = recommendEventsSchema.safeParse({
    email: req.nextUrl.searchParams.get("email") ?? undefined,
    interests: req.nextUrl.searchParams.get("interests") ?? undefined,
  });
  if (!parsed.success) {
    return errorResponse(parsed.error);
  }
  const { email, interests } = parsed.data;

  const hasSignal = Boolean(interests?.trim() || email);
  const events = await scoreEvents({ email, interests }, 6);

  logApi("recommend", "ranked", {
    latencyMs: Date.now() - start,
    status: 200,
    personalized: hasSignal,
  });

  return NextResponse.json({
    personalized: hasSignal,
    fallback: !hasSignal,
    events,
  });
}
