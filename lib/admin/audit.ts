import { prisma } from "@lib/db";
import type { Role } from "@lib/auth/guard-types";

export async function writeAudit(opts: {
  actorName: string;
  actorRole: Role | string;
  action: "create" | "update" | "delete" | "login" | "logout" | "settings";
  entity?: string;
  entityId?: string;
  details?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        action: opts.action,
        entity: opts.entity ?? null,
        entityId: opts.entityId ?? null,
        actorName: opts.actorName,
        actorRole: opts.actorRole,
        details: opts.details ?? null,
      },
    });
  } catch (err) {
    // Audit failures must never break the primary request.
    console.warn("audit write failed", String(err));
  }
}