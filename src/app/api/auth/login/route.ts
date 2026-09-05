import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@lib/db";
import { loginSchema } from "@lib/validators";
import { errorResponse, getClientIp } from "@lib/api";
import { rateLimit } from "@lib/ai/rateLimiter";
import { verifyPassword } from "@lib/auth/password";
import {
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  cookieSecure,
  signSessionToken,
} from "@lib/auth/session";
import { logApi } from "@lib/log/logger";

export async function POST(req: NextRequest) {
  const start = Date.now();
  const ip = getClientIp(req);

  if (!rateLimit(`login:${ip}`, 10)) {
    return NextResponse.json(
      { error: "RATE_LIMITED", message: "Too many login attempts" },
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

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error);
  }
  const { email, password } = parsed.data;

  const normalizedEmail = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  const bad = (message: string) =>
    NextResponse.json(
      { error: "AUTH_FAILED", message },
      { status: 401 },
    );

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return bad("Invalid email or password.");
  }
  if (!user.isActive) {
    return bad("This account has been disabled. Contact an administrator.");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const token = signSessionToken({
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  const res = NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      team: user.team,
    },
  });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: cookieSecure(req.headers.get("x-forwarded-proto") ?? req.url),
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });

  logApi("auth", "login", { latencyMs: Date.now() - start, status: 200 });

  return res;
}