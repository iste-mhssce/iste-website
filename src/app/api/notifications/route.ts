import { NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { logApi } from "@lib/log/logger";

export async function GET() {
  const start = Date.now();

  const notifications = await prisma.notification.findMany({
    where: { isActive: true },
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    take: 10,
  });

  logApi("notifications", "list", { latencyMs: Date.now() - start, status: 200 });

  return NextResponse.json({ notifications });
}