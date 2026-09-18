import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@lib/db";
import { updateUserSchema } from "@lib/validators";
import { errorResponse } from "@lib/api";
import { hashPassword } from "@lib/auth/password";
import { requireRole, type AuthUser } from "@lib/auth/guards";
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
  if (actor.role === "SUPER_ADMIN") return true;
  if (actor.role === "ADMIN") return targetRole === "MEMBER";
  return false;
}

function canAssignRole(actor: AuthUser, nextRole: string): boolean {
  if (nextRole === "MEMBER") return true;
  return nextRole === "ADMIN" && actor.role === "SUPER_ADMIN";
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const gate = await requireRole(req, "ADMIN");
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

  const editingSelf = target.id === actor.userId;

  if (!editingSelf && !canManageTarget(actor, target.role)) {
    return NextResponse.json(
      { error: "FORBIDDEN", message: "You cannot manage this account." },
      { status: 403 },
    );
  }

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

  // Only SUPER_ADMIN may create/assign ADMIN roles, and only for accounts
  // they are allowed to manage.
  if (role !== undefined && !canAssignRole(actor, role)) {
    return NextResponse.json(
      {
        error: "FORBIDDEN",
        message: "Admins cannot assign elevated roles.",
      },
      { status: 403 },
    );
  }

  // Prevent an admin from disabling or changing their own role and locking
  // themselves out.
  if (editingSelf) {
    if (isActive === false) {
      return NextResponse.json(
        { error: "CONFLICT", message: "You cannot disable your own account." },
        { status: 409 },
      );
    }
    if (role !== undefined && role !== target.role) {
      return NextResponse.json(
        { error: "CONFLICT", message: "You cannot change your own role." },
        { status: 409 },
      );
    }
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(role !== undefined ? { role: nextRole } : {}),
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
  const gate = await requireRole(req, "ADMIN");
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

  // Admins may not delete SUPER_ADMIN accounts.
  if (target.role === "SUPER_ADMIN") {
    return NextResponse.json(
      { error: "FORBIDDEN", message: "SUPER_ADMIN accounts cannot be deleted." },
      { status: 403 },
    );
  }
  // Admin accounts may not be deleted by other admins (deactivate instead).
  if (target.role === "ADMIN" && actor.role !== "SUPER_ADMIN") {
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