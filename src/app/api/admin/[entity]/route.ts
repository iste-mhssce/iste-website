import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@lib/auth/guards";
import { getEntityDef } from "@lib/admin/entities";
import { buildData, delegateFor, listWhere } from "@lib/admin/crud";
import { writeAudit } from "@lib/admin/audit";
import { logApi } from "@lib/log/logger";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ entity: string }> },
) {
  const start = Date.now();
  const gate = await requireRole(req, "ADMIN");
  if (!("user" in gate)) return gate as Response;

  const { entity } = await params;
  const def = getEntityDef(entity);
  if (!def) {
    return NextResponse.json(
      { error: "NOT_FOUND", message: `Unknown entity: ${entity}` },
      { status: 404 },
    );
  }

  try {
    const delegate = delegateFor(def);
    const limit = Math.min(200, Math.max(1, Number(req.nextUrl.searchParams.get("limit") ?? 50)));
    const items = await delegate.findMany({
      where: listWhere(def, req.nextUrl.searchParams),
      orderBy: def.defaultOrder,
      take: limit,
    });

    logApi("admin-entity", `list:${def.key}`, {
      latencyMs: Date.now() - start,
      status: 200,
      count: items.length,
    });

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json(
      { error: "INTERNAL", message: `Failed to load ${def.label}.` },
      { status: 500 },
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ entity: string }> },
) {
  const start = Date.now();
  const gate = await requireRole(req, "ADMIN");
  if (!("user" in gate)) return gate as Response;
  const { user: actor } = gate;

  const { entity } = await params;
  const def = getEntityDef(entity);
  if (!def) {
    return NextResponse.json(
      { error: "NOT_FOUND", message: `Unknown entity: ${entity}` },
      { status: 404 },
    );
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const { data, errors } = await buildData(def, body);
  if (errors.length > 0) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: errors.join(" ") },
      { status: 400 },
    );
  }

  try {
    const delegate = delegateFor(def);
    const created = await delegate.create({ data });
    await writeAudit({
      actorName: actor.name,
      actorRole: actor.role,
      action: "create",
      entity: def.key,
      entityId: String(created.id ?? ""),
      details: JSON.stringify({ title: data.title ?? data.name ?? data.platform ?? data.certificateId ?? data.platform }),
    });

    logApi("admin-entity", `create:${def.key}`, {
      latencyMs: Date.now() - start,
      status: 201,
      actorId: actor.userId,
    });

    return NextResponse.json({ item: created }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "INTERNAL", message: `Failed to create ${def.singular}.` },
      { status: 500 },
    );
  }
}