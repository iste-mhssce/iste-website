import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@lib/auth/guards";
import { getEntityDef } from "@lib/admin/entities";
import { buildUpdateData, delegateFor } from "@lib/admin/crud";
import { writeAudit } from "@lib/admin/audit";
import { logApi } from "@lib/log/logger";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ entity: string; id: string }> },
) {
  const start = Date.now();
  const gate = await requireRole(req, "ADMIN");
  if (!("user" in gate)) return gate as Response;
  const { user: actor } = gate;

  const { entity, id } = await params;
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

  const { data, errors } = await buildUpdateData(def, body);
  if (errors.length > 0) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: errors.join(" ") },
      { status: 400 },
    );
  }

  try {
    const delegate = delegateFor(def);
    const existing = await delegate.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "NOT_FOUND", message: `${def.singular} not found.` },
        { status: 404 },
      );
    }

    const updated = await delegate.update({ where: { id }, data });
    await writeAudit({
      actorName: actor.name,
      actorRole: actor.role,
      action: "update",
      entity: def.key,
      entityId: id,
      details: JSON.stringify(Object.keys(data)),
    });

    logApi("admin-entity", `update:${def.key}`, {
      latencyMs: Date.now() - start,
      status: 200,
      actorId: actor.userId,
    });

    return NextResponse.json({ item: updated });
  } catch {
    return NextResponse.json(
      { error: "INTERNAL", message: `Failed to update ${def.singular}.` },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ entity: string; id: string }> },
) {
  const start = Date.now();
  const gate = await requireRole(req, "ADMIN");
  if (!("user" in gate)) return gate as Response;
  const { user: actor } = gate;

  const { entity, id } = await params;
  const def = getEntityDef(entity);
  if (!def) {
    return NextResponse.json(
      { error: "NOT_FOUND", message: `Unknown entity: ${entity}` },
      { status: 404 },
    );
  }

  try {
    const delegate = delegateFor(def);
    const existing = await delegate.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "NOT_FOUND", message: `${def.singular} not found.` },
        { status: 404 },
      );
    }

    await delegate.delete({ where: { id } });
    await writeAudit({
      actorName: actor.name,
      actorRole: actor.role,
      action: "delete",
      entity: def.key,
      entityId: id,
      details: JSON.stringify(existing),
    });

    logApi("admin-entity", `delete:${def.key}`, {
      latencyMs: Date.now() - start,
      status: 200,
      actorId: actor.userId,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "INTERNAL", message: `Failed to delete ${def.singular}.` },
      { status: 500 },
    );
  }
}