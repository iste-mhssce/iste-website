import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@lib/auth/guards";
import { prisma } from "@lib/db";
import { writeAudit } from "@lib/admin/audit";
import { logApi } from "@lib/log/logger";

export const dynamic = "force-dynamic";

const ALLOWED_MIME = new Set(["image/png", "image/jpeg", "image/webp"]);
const MAX_BASE64_CHARS = 2_600_000; // ~1.9MB binary after decoding

function photoDataUrl(raw: unknown): { ok: true; value: string } | { ok: false; message: string } {
  if (typeof raw !== "string" || raw.length === 0) {
    return { ok: false, message: "Missing photo data." };
  }
  const match = /^data:(image\/(?:png|jpeg|webp));base64,/.exec(raw);
  if (!match || !ALLOWED_MIME.has(match[1])) {
    return {
      ok: false,
      message: "Photo must be a PNG, JPEG or WebP image.",
    };
  }
  if (raw.length > MAX_BASE64_CHARS) {
    return { ok: false, message: "Photo is too large (max ~2MB)." };
  }
  return { ok: true, value: raw };
}

/**
 * Super-admin only: set a council member's profile photo by storing the
 * image as a data URL in the `photoUrl` column. Kept separate from the shared
 * /admin CRUD so regular ADMIN accounts can never modify photos.
 */
export async function POST(req: NextRequest) {
  const start = Date.now();
  const gate = await requireRole(req, "SUPER_ADMIN");
  if (!("user" in gate)) return gate as Response;
  const { user: actor } = gate;

  const body = await req.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : "";
  if (!id) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: "Invalid request payload" },
      { status: 400 },
    );
  }

  const photo = photoDataUrl(body?.photo);
  if (!photo.ok) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: photo.message },
      { status: 400 },
    );
  }

  const member = await prisma.councilMember.findUnique({ where: { id } });
  if (!member) {
    return NextResponse.json(
      { error: "NOT_FOUND", message: "Council member not found." },
      { status: 404 },
    );
  }

  try {
    const updated = await prisma.councilMember.update({
      where: { id },
      data: { photoUrl: photo.value },
    });

    await writeAudit({
      actorName: actor.name,
      actorRole: actor.role,
      action: "update",
      entity: "council-photo",
      entityId: id,
      details: JSON.stringify({ name: member.name, updatedFields: ["photoUrl"] }),
    });

    logApi("super-admin", "upload-council-photo", {
      latencyMs: Date.now() - start,
      status: 200,
      actorId: actor.userId,
      memberId: id,
    });

    return NextResponse.json({ item: updated });
  } catch {
    return NextResponse.json(
      { error: "INTERNAL", message: "Failed to update the photo." },
      { status: 500 },
    );
  }
}

/** Super-admin only: remove a council member's photo. */
export async function DELETE(req: NextRequest) {
  const start = Date.now();
  const gate = await requireRole(req, "SUPER_ADMIN");
  if (!("user" in gate)) return gate as Response;
  const { user: actor } = gate;

  const body = await req.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : "";
  if (!id) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: "Invalid request payload" },
      { status: 400 },
    );
  }

  const member = await prisma.councilMember.findUnique({ where: { id } });
  if (!member) {
    return NextResponse.json(
      { error: "NOT_FOUND", message: "Council member not found." },
      { status: 404 },
    );
  }

  try {
    const updated = await prisma.councilMember.update({
      where: { id },
      data: { photoUrl: null },
    });

    await writeAudit({
      actorName: actor.name,
      actorRole: actor.role,
      action: "update",
      entity: "council-photo",
      entityId: id,
      details: JSON.stringify({ name: member.name, updatedFields: ["photoUrl"] }),
    });

    logApi("super-admin", "remove-council-photo", {
      latencyMs: Date.now() - start,
      status: 200,
      actorId: actor.userId,
      memberId: id,
    });

    return NextResponse.json({ item: updated });
  } catch {
    return NextResponse.json(
      { error: "INTERNAL", message: "Failed to remove the photo." },
      { status: 500 },
    );
  }
}