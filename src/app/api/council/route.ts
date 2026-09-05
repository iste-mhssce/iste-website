import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@lib/db";
import { councilListQuerySchema } from "@lib/validators";
import { errorResponse } from "@lib/api";
import { logApi } from "@lib/log/logger";

export async function GET(req: NextRequest) {
  const start = Date.now();
  const parsed = councilListQuerySchema.safeParse({
    team: req.nextUrl.searchParams.get("team") ?? undefined,
  });
  if (!parsed.success) {
    return errorResponse(parsed.error);
  }

  const members = await prisma.councilMember.findMany({
    where: parsed.data.team
      ? { team: parsed.data.team }
      : undefined,
    orderBy: { order: "asc" },
  });

  logApi("council", "list", { latencyMs: Date.now() - start, status: 200 });

  return NextResponse.json({ members });
}
