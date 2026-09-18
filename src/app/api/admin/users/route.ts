import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@lib/db";
import { createUserSchema } from "@lib/validators";
import { errorResponse } from "@lib/api";
import { hashPassword } from "@lib/auth/password";
import { requireRole } from "@lib/auth/guards";
import { logApi } from "@lib/log/logger";

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

export async function GET(req: NextRequest) {
  const gate = await requireRole(req, "ADMIN");
  if (!("user" in gate)) return gate as Response;

  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: userSelect,
  });

  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  const gate = await requireRole(req, "ADMIN");
  if (!("user" in gate)) return gate as Response;
  const { user: actor } = gate;

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: "Invalid JSON body" },
      { status: 400 },
    );
  }
  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error);
  }
  const { name, email, password, role, team } = parsed.data;

  // Only a SUPER_ADMIN may create ADMIN accounts.
  if (role === "ADMIN" && actor.role !== "SUPER_ADMIN") {
    return NextResponse.json(
      {
        error: "FORBIDDEN",
        message: "Admins can only create member accounts.",
      },
      { status: 403 },
    );
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) {
    return NextResponse.json(
      { error: "CONFLICT", message: "A user with this email already exists." },
      { status: 409 },
    );
  }

  const created = await prisma.user.create({
    data: {
      name,
      email: normalizedEmail,
      passwordHash: hashPassword(password),
      role,
      team: team || null,
      createdBy: actor.userId,
    },
    select: userSelect,
  });

  logApi("admin", "create-user", { role, createdById: actor.userId });
  return NextResponse.json({ user: created }, { status: 201 });
}