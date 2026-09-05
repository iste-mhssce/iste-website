import { timingSafeEqual } from "crypto";
import { prisma } from "@lib/db";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken, type SessionUser } from "./session";
import type { Role } from "./guard-types";
import { roleAtLeast } from "./guard-types";

export interface AuthUser {
  userId: string;
  name: string;
  email: string;
  role: Role;
}

/**
 * Resolve the authenticated user for a request from either:
 *  - a signed session cookie issued at login, or
 *  - the legacy `Authorization: Bearer <ADMIN_API_KEY>` header (admin only).
 *
 * Always re-checks the DB row so disabled accounts are rejected even with an
 * otherwise-valid token. Returns null when unauthenticated.
 */
export async function getCurrentUser(
  req: NextRequest,
): Promise<AuthUser | null> {
  const header = req.headers.get("authorization");
  if (header?.startsWith("Bearer ")) {
    const token = header.slice("Bearer ".length);
    const adminKey = process.env.ADMIN_API_KEY;
    if (adminKey && timingSafeEqualStr(token, adminKey)) {
      return {
        userId: "api-key-admin",
        name: "Administrator",
        email: "admin@api",
        role: "ADMIN",
      };
    }
  }
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = verifySessionToken(token);
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });
  if (!user || !user.isActive) return null;

  return {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

/**
 * Role gate. Returns the resolved user when the request is authenticated AND
 * the user's role is at least `minRole`; otherwise returns a 401/403 response.
 */
export async function requireRole(
  req: NextRequest,
  minRole: Role,
): Promise<{ user: AuthUser } | Response> {
  const user = await getCurrentUser(req);
  if (!user) {
    return new Response(
      JSON.stringify({
        error: "UNAUTHORIZED",
        message: "Authentication required.",
      }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }
  if (!roleAtLeast(user.role, minRole)) {
    return new Response(
      JSON.stringify({
        error: "FORBIDDEN",
        message: `Requires ${minRole} role or above.`,
      }),
      { status: 403, headers: { "Content-Type": "application/json" } },
    );
  }
  return { user };
}

function timingSafeEqualStr(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

export type { SessionUser };