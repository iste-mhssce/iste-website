import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@lib/db";
import { updateUserSchema } from "@lib/validators";
import { errorResponse } from "@lib/api";
import { hashPassword } from "@lib/auth/password";
import { requireRole, type AuthUser } from "@lib/auth/guards";
import { roleAtLeast } from "@lib/auth/guard-types";
import { logApi } from "@lib/log/logger";

export const dynamic = "force-dynamic";

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  team: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

function canManageTarget(actor: AuthUser, targetRole: string): boolean {
  if (actor.role === "ADMIN") return true;
  if (actor.role === "HEAD") return targetRole === "MEMBER";
  return false;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const gate = await requireRole(req, "HEAD");
  if (!("user" in gate)) return gate as Response;
  const { user: actor } = gate;

  const { id } = await params;
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json(
      { error: "NOT_FOUND", message: "User not found" },
      { status: 404 },
    );
  }

  if (!canManageTarget(actor, target.role)) {
    return NextResponse.json(
      { error: "FORBIDDEN", message: "You cannot manage this account." },
      { status: 403 },
    );
  }

  // An admin must be able to permanently act on their own account except for
  // protecting against self-lockout.
  const editingSelf = target.id === actor.userId;

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: "Invalid JSON body" },
      { status: 400 },
    );
  }
  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error);
  }
  const { name, role, team, isActive, resetPassword } = parsed.data;

  const nextRole = role ?? target.role;

  // Non-admins cannot elevate anyone toward HEAD/ADMIN, and cannot manage
  // accounts that are not MEMBER-level (target role checked above).
  if (actor.role !== "ADMIN" && nextRole !== "MEMBER") {
    return NextResponse.json(
      { error: "FORBIDDEN", message: "Heads cannot assign elevated roles." },
      { status: 403 },
    );
  }

  // Prevent an admin from disabling or self-demoting their own account and
  // locking themselves out.
  if (editingSelf) {
    if (isActive === false) {
      return NextResponse.json(
        { error: "CONFLICT", message: "You cannot disable your own account." },
        { status: 409 },
      );
    }
    if (role && !roleAtLeast(role, "ADMIN")) {
      return NextResponse.json(
        { error: "CONFLICT", message: "You cannot demote your own account." },
        { status: 409 },
      );
    }
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(role !== undefined ? { role } : {}),
      ...(team !== undefined ? { team } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
      ...(resetPassword !== undefined
        ? { passwordHash: hashPassword(resetPassword) }
        : {}),
      updatedAt: new Date(),
    },
    select: userSelect,
  });

  logApi("admin", "update-user", { targetId: id, actorId: actor.userId });
  return NextResponse.json({ user: updated });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const gate = await requireRole(req, "HEAD");
  if (!("user" in gate)) return gate as Response;
  const { user: actor } = gate;

  const { id } = await params;
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json(
      { error: "NOT_FOUND", message: "User not found" },
      { status: 404 },
    );
  }

  if (target.id === actor.userId) {
    return NextResponse.json(
      { error: "CONFLICT", message: "You cannot delete your own account." },
      { status: 409 },
    );
  }
  // Admins may not be deleted by other admins (they can only be deactivated).
  if (target.role === "ADMIN") {
    return NextResponse.json(
      {
        error: "FORBIDDEN",
        message: "Admin accounts cannot be deleted. Deactivate them instead.",
      },
      { status: 403 },
    );
  }
  if (!canManageTarget(actor, target.role)) {
    return NextResponse.json(
      { error: "FORBIDDEN", message: "You cannot manage this account." },
      { status: 403 },
    );
  }

  await prisma.user.delete({ where: { id } });
  logApi("admin", "delete-user", { targetId: id, actorId: actor.userId });
  return NextResponse.json({ success: true });
}