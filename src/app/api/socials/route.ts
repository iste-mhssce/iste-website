import { NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { logApi } from "@lib/log/logger";

export async function GET() {
  const start = Date.now();

  const links = await prisma.socialLink.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });

  logApi("socials", "list", { latencyMs: Date.now() - start, status: 200 });

  return NextResponse.json({ links });
}