import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@lib/db";
import { eventListQuerySchema } from "@lib/validators";
import { errorResponse } from "@lib/api";
import { logApi } from "@lib/log/logger";

export async function GET(req: NextRequest) {
  const start = Date.now();
  const parsed = eventListQuerySchema.safeParse({
    category: req.nextUrl.searchParams.get("category") ?? undefined,
    page: req.nextUrl.searchParams.get("page") ?? 1,
    limit: req.nextUrl.searchParams.get("limit") ?? 12,
  });
  if (!parsed.success) {
    return errorResponse(parsed.error);
  }

  const { category, page, limit } = parsed.data;

  const where = category ? { category } : {};
  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { startDate: "asc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        tag: true,
        description: true,
        startDate: true,
        location: true,
        keynote: true,
        isFeatured: true,
      },
    }),
    prisma.event.count({ where }),
  ]);

  logApi("events", "list", { latencyMs: Date.now() - start, status: 200 });

  return NextResponse.json({
    events,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
