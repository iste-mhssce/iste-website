import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@lib/db";
import { requireRole } from "@lib/auth/guards";
import { logApi } from "@lib/log/logger";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const start = Date.now();
  const gate = await requireRole(req, "ADMIN");
  if (!("user" in gate)) return gate as Response;

  const [
    posts,
    publishedPosts,
    events,
    certificates,
    council,
    socialLinks,
    notifications,
    users,
    admins,
    pendingIntake,
    intake,
    auditLogs,
  ] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { published: true } }),
    prisma.event.count(),
    prisma.certificate.count(),
    prisma.councilMember.count(),
    prisma.socialLink.count(),
    prisma.notification.count({ where: { isActive: true } }),
    prisma.user.count(),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.intakeApplication.count({ where: { status: "PENDING" } }),
    prisma.intakeApplication.count(),
    prisma.auditLog.count(),
  ]);

  const recentLogs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  logApi("dashboard", "load", { latencyMs: Date.now() - start, status: 200 });

  return NextResponse.json({
    counts: {
      posts,
      publishedPosts,
      events,
      certificates,
      council,
      socialLinks,
      notifications,
      users,
      admins,
      pendingIntake,
      intake,
      auditLogs,
    },
    recentLogs,
  });
}