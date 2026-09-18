import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@lib/db";
import { requireAdmin } from "@lib/auth/require-admin";
import { generateEmbedding } from "@lib/ai/embeddings";
import { getClientIp } from "@lib/api";
import { rateLimit } from "@lib/ai/rateLimiter";
import { logApi, logWarn } from "@lib/log/logger";

/**
 * Admin-only: regenerate embeddings for all events and posts.
 * Should be run after content edits or when new rows are created.
 * Graceful: if any single row fails to embed, it is skipped and logged.
 */
export async function POST(req: NextRequest) {
  const start = Date.now();
  const ip = getClientIp(req);

  const auth = await requireAdmin(req);
  if (!auth.authorized) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: auth.reason ?? "Forbidden" },
      { status: 403 },
    );
  }

  if (!rateLimit(`reindex:${ip}`, 5)) {
    return NextResponse.json(
      { error: "RATE_LIMITED", message: "Too many requests" },
      { status: 429 },
    );
  }

  const [events, posts] = await Promise.all([
    prisma.event.findMany(),
    prisma.post.findMany(),
  ]);

  let indexed = 0;
  let errors = 0;

  // Events
  for (const ev of events) {
    const text = `${ev.title}. ${ev.tag} ${ev.category}. ${ev.description}. ${ev.location}`;
    try {
      const [vec] = await generateEmbedding(text);
      await prisma.$executeRaw`
        UPDATE "Event" SET "embedding" = ${JSON.stringify(vec)}::vector WHERE id = ${ev.id}
      `;
      indexed++;
    } catch (err) {
      errors++;
      logWarn("reindex", "event embed failed", { id: ev.id, error: String(err) });
    }
  }

  // Posts
  for (const post of posts) {
    const text = `${post.title}. ${post.excerpt}.`;
    try {
      const [vec] = await generateEmbedding(text);
      await prisma.$executeRaw`
        UPDATE "Post" SET "embedding" = ${JSON.stringify(vec)}::vector WHERE id = ${post.id}
      `;
      indexed++;
    } catch (err) {
      errors++;
      logWarn("reindex", "post embed failed", {
        id: post.id,
        error: String(err),
      });
    }
  }

  logApi("reindex", "done", {
    latencyMs: Date.now() - start,
    status: 200,
    indexed,
    errors,
  });

  return NextResponse.json({ indexed, errors });
}
