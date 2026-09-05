import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@lib/db";
import { changePasswordSchema } from "@lib/validators";
import { errorResponse } from "@lib/api";
import { hashPassword, verifyPassword } from "@lib/auth/password";
import { requireRole } from "@lib/auth/guards";
import { logApi } from "@lib/log/logger";

export async function POST(req: NextRequest) {
  const start = Date.now();
  const gate = await requireRole(req, "MEMBER");
  if ("user" in gate) {
    const { user } = gate;
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", message: "Invalid JSON body" },
        { status: 400 },
      );
    }
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error);
    }
    const { currentPassword, newPassword } = parsed.data;

    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
    });
    if (!dbUser || !verifyPassword(currentPassword, dbUser.passwordHash)) {
      return NextResponse.json(
        { error: "AUTH_FAILED", message: "Current password is incorrect." },
        { status: 401 },
      );
    }

    await prisma.user.update({
      where: { id: user.userId },
      data: { passwordHash: hashPassword(newPassword), updatedAt: new Date() },
    });

    logApi("auth", "change-password", {
      latencyMs: Date.now() - start,
      status: 200,
    });
    return NextResponse.json({ success: true });
  }
  return gate as Response;
}