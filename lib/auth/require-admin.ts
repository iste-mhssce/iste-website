import type { NextRequest } from "next/server";
import { requireRole } from "./guards";

/**
 * Server-side guard for admin-only routes.
 *
 * Accepts either:
 *  1. A signed session cookie from a logged-in ADMIN account, or
 *  2. The legacy `Authorization: Bearer <ADMIN_API_KEY>` header.
 *
 * Returns `{ authorized }`; callers should short-circuit with 403 otherwise.
 */
export async function requireAdmin(
  req: NextRequest,
): Promise<{ authorized: boolean; reason?: string }> {
  const result = await requireRole(req, "ADMIN");
  if ("user" in result) {
    return { authorized: true };
  }
  const body = (await (result as Response).json()) as { message?: string };
  return {
    authorized: false,
    reason: body.message ?? "Forbidden: admin credentials required",
  };
}