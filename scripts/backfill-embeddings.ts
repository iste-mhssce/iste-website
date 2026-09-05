/**
 * One-off embedding backfill for seeded events and publications.
 *
 * Usage:
 *   npx tsx scripts/backfill-embeddings.ts
 *
 * Requires a reachable database with the pgvector extension installed and an
 * AI provider key configured in .env. Fails gracefully per-row.
 */
import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  const apiKey = process.env.AI_PROVIDER_API_KEY;
  if (!apiKey) {
    console.error("AI_PROVIDER_API_KEY not set. Skipping embedding backfill.");
    process.exit(0);
  }

  // The `vector` column only exists when the pgvector extension is installed.
  try {
    await prisma.$queryRaw`SELECT "embedding" FROM "Event" LIMIT 0`;
  } catch {
    console.warn(
      "Embedding vector column not found (pgvector not installed). Skipping backfill.",
    );
    process.exit(0);
  }

  const model = process.env.AI_EMBEDDING_MODEL ?? "text-embedding-3-small";
  const baseUrl = process.env.AI_EMBEDDING_BASE_URL ?? "https://api.openai.com/v1";

  async function embed(texts: string[]): Promise<number[][]> {
    const res = await fetch(`${baseUrl}/embeddings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, input: texts }),
    });
    if (!res.ok) {
      throw new Error(`Embedding failed: ${res.status}`);
    }
    const data = (await res.json()) as { data: { embedding: number[] }[] };
    return data.data.map((d) => d.embedding);
  }

  const [events, pubs] = await Promise.all([
    prisma.event.findMany(),
    prisma.publication.findMany(),
  ]);

  let indexed = 0;
  let errors = 0;

  for (const ev of events) {
    const text = `${ev.title}. ${ev.tag} ${ev.category}. ${ev.description}. ${ev.location}`;
    try {
      const [vec] = await embed([text]);
      await prisma.$executeRawUnsafe(
        `UPDATE "Event" SET "embedding" = '${JSON.stringify(vec)}'::vector WHERE id = '${ev.id}'`,
      );
      indexed++;
    } catch (e) {
      errors++;
      console.error(`Event ${ev.id} failed`, e);
    }
  }

  for (const pub of pubs) {
    const text = `${pub.title}. By ${pub.author}.`;
    try {
      const [vec] = await embed([text]);
      await prisma.$executeRawUnsafe(
        `UPDATE "Publication" SET "embedding" = '${JSON.stringify(vec)}'::vector WHERE id = '${pub.id}'`,
      );
      indexed++;
    } catch (e) {
      errors++;
      console.error(`Publication ${pub.id} failed`, e);
    }
  }

  console.log(`Backfill complete: indexed=${indexed}, errors=${errors}`);
}

main().finally(() => prisma.$disconnect());
