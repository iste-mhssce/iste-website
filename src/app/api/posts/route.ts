import { NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { logApi } from "@lib/log/logger";

export async function GET() {
  const start = Date.now();

  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    take: 6,
  });

  logApi("posts", "list", { latencyMs: Date.now() - start, status: 200 });

  return NextResponse.json({ posts });
}