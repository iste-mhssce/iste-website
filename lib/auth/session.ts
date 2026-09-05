import { createHmac, timingSafeEqual } from "crypto";
import type { Role } from "./guard-types";

export const SESSION_COOKIE = "iste_session";
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

/**
 * Cookie should be marked Secure on HTTPS deployments. On plain-HTTP local
 * development (including `next start`) we keep it unmarked so the session
 * still works over http://localhost.
 */
export function cookieSecure(proto: string | undefined | null): boolean {
  if (proto === "https") return true;
  if (proto === "http") return false;
  return process.env.NODE_ENV === "production";
}

export interface SessionUser {
  userId: string;
  name: string;
  email: string;
  role: Role;
}

interface TokenPayload extends SessionUser {
  iat: number;
  exp: number;
}

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) {
    throw new Error("AUTH_SECRET must be set (>= 16 chars)");
  }
  return s;
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

/**
 * Sign a session token (header.payload.signature, HMAC-SHA256).
 * Payload embeds the current role so guards don't re-query the DB on every
 * call; the User row is still refreshed by the guard when needed.
 */
export function signSessionToken(user: SessionUser): string {
  const payload: TokenPayload = {
    ...user,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = b64url(JSON.stringify(payload));
  const sig = createHmac("sha256", secret())
    .update(`${header}.${body}`)
    .digest("base64url");
  return `${header}.${body}.${sig}`;
}

/**
 * Verify a session token. Returns the decoded user or null if invalid/expired.
 */
export function verifySessionToken(token: string): SessionUser | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, body, sig] = parts;
  const expected = createHmac("sha256", secret())
    .update(`${header}.${body}`)
    .digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as
      TokenPayload;
    if (typeof payload.exp !== "number" || payload.exp < Date.now() / 1000) {
      return null;
    }
    return {
      userId: payload.userId,
      name: payload.name,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    return null;
  }
}