import { prisma } from "@lib/db";
import { generateEmbedding } from "./embeddings";

export interface ScoredEvent {
  id: string;
  title: string;
  slug: string;
  category: string;
  tag: string;
  description: string;
  startDate: Date;
  location: string;
  score: number;
  vectorScore?: number;
  isFeatured: boolean;
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Hybrid event recommendation.
 *
 * Blends, for each upcoming event:
 *  - vector similarity between the user's stated interests and the event's
 *    embedding (retrieved via raw SQL because the vector column is Unsupported
 *    by the typed Prisma client), and
 *  - a small rules layer: category affinity from the user's past registrations,
 *    plus recency (closer events score up to +0.2), plus a featured boost.
 *
 * If there is no personalization signal (no interests and no email), it falls
 * back to upcoming featured events so the recommendation rail is never empty.
 */
export async function scoreEvents(
  signal: { email?: string; interests?: string },
  limit = 6,
): Promise<ScoredEvent[]> {
  const upcomingEvents = await prisma.event.findMany({
    where: { startDate: { gte: new Date() } },
    orderBy: { startDate: "asc" },
    take: 50,
  });

  if (upcomingEvents.length === 0) {
    return [];
  }

  const hasSignal = Boolean(
    (signal.interests && signal.interests.trim().length > 0) || signal.email,
  );

  // Vector similarity component. Fetches each event's embedding via raw SQL and
  // compares against the user's interest embedding.
  let vectorScores = new Map<string, number>();
  if (signal.interests?.trim()) {
    try {
      const interestEmbedding = await generateEmbedding(signal.interests);
      const eventIds = upcomingEvents.map((e) => e.id);

      const rows = await prisma.$queryRawUnsafe<
        { id: string; embedding: string }[]
      >(
        `SELECT id, embedding::text AS embedding
         FROM "Event"
         WHERE id IN (${eventIds.map((id) => `'${id}'`).join(",")}) AND embedding IS NOT NULL`,
      );

      const interestVec = interestEmbedding;
      for (const row of rows) {
        try {
          const vec: number[] = JSON.parse(row.embedding);
          vectorScores.set(row.id, cosineSimilarity(interestVec, vec));
        } catch {
          // skip unparseable
        }
      }
    } catch {
      // Embedding provider down -> vector component silently disabled.
      vectorScores = new Map();
    }
  }

  // Rules layer: category affinity from past registrations.
  const categoryAffinity = new Map<string, number>();
  if (signal.email) {
    try {
      const regs = await prisma.registration.findMany({
        where: { email: signal.email },
        select: { event: { select: { category: true } } },
      });
      for (const r of regs) {
        categoryAffinity.set(
          r.event.category,
          (categoryAffinity.get(r.event.category) ?? 0) + 1,
        );
      }
    } catch {
      // ignore
    }
  }

  const scored = upcomingEvents.map((ev): ScoredEvent => {
    let score = 0;
    const vectorScore = vectorScores.get(ev.id);

    // Vector similarity component
    if (vectorScore !== undefined) {
      score += vectorScore * 0.5;
    }

    // Category affinity (rules layer)
    const affinity = categoryAffinity.get(ev.category) ?? 0;
    score += Math.min(affinity, 3) * 0.15;

    // Recency: closer events score slightly higher.
    const daysAway = Math.max(
      0,
      Math.ceil((ev.startDate.getTime() - Date.now()) / 86_400_000),
    );
    score += Math.max(0, 1 - daysAway / 90) * 0.2;

    // Featured boost
    if (ev.isFeatured) score += 0.25;

    return {
      id: ev.id,
      title: ev.title,
      slug: ev.slug,
      category: ev.category,
      tag: ev.tag,
      description: ev.description,
      startDate: ev.startDate,
      location: ev.location,
      score: Math.round(score * 1000) / 1000,
      isFeatured: ev.isFeatured,
      vectorScore:
        vectorScore !== undefined ? Math.round(vectorScore * 1000) / 1000 : undefined,
    };
  });

  scored.sort((a, b) => b.score - a.score);

  // No personalization signal: prioritize upcoming featured, then date order.
  if (!hasSignal) {
    scored.sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) {
        return Number(b.isFeatured) - Number(a.isFeatured);
      }
      return a.startDate.getTime() - b.startDate.getTime();
    });
  }

  return scored.slice(0, limit);
}
