import { prisma } from "@lib/db";
import { logWarn } from "@lib/log/logger";

export interface RetrievedItem {
  id: string;
  type: "event" | "publication";
  content: string;
}

/**
 * Retrieval-augmented generation context lookup.
 *
 * Embeds the query and runs cosine-similarity against Event and Publication
 * semantic vectors when an AI provider key is configured AND the database has
 * a pgvector `vector` column (enabled by installing the pgvector extension).
 * Otherwise it degrades gracefully to an empty context so the assistant reverts
 * to its maintain-conversation / signposting behaviour instead of erroring.
 */
export async function retrieveContext(
  query: string,
  k = 4,
): Promise<RetrievedItem[]> {
  if (!process.env.AI_PROVIDER_API_KEY) {
    // No embedding provider configured -> no vector context available.
    return [];
  }

  let embedding: number[];
  try {
    const { generateEmbedding } = await import("./embeddings");
    embedding = await generateEmbedding(query);
  } catch (err) {
    logWarn("retrieval", "embedding unavailable", { error: String(err) });
    return [];
  }
  const vecLiteral = `[${embedding.join(",")}]`;

  const results: Array<RetrievedItem & { distance: number }> = [];

  try {
    const eventRows = await prisma.$queryRawUnsafe<{
      id: string;
      content: string;
      distance: number;
    }[]>(
      `
        SELECT
          id,
          title || ' | ' || COALESCE(location, '') || ' | ' || description AS content,
          embedding <=> '${vecLiteral}'::vector AS distance
        FROM "Event"
        WHERE embedding IS NOT NULL
        ORDER BY embedding <=> '${vecLiteral}'::vector
        LIMIT ${k}
      `,
    );
    for (const row of eventRows) {
      results.push({
        id: row.id,
        type: "event",
        content: row.content,
        distance: row.distance,
      });
    }
  } catch (err) {
    logWarn("retrieval", "event vector query failed", { error: String(err) });
  }

  try {
    const pubRows = await prisma.$queryRawUnsafe<{
      id: string;
      content: string;
      distance: number;
    }[]>(
      `
        SELECT
          id,
          title || ' by ' || COALESCE(author, '') AS content,
          embedding <=> '${vecLiteral}'::vector AS distance
        FROM "Publication"
        WHERE embedding IS NOT NULL
        ORDER BY embedding <=> '${vecLiteral}'::vector
        LIMIT ${k}
      `,
    );
    for (const row of pubRows) {
      results.push({
        id: row.id,
        type: "publication",
        content: row.content,
        distance: row.distance,
      });
    }
  } catch (err) {
    logWarn("retrieval", "publication vector query failed", {
      error: String(err),
    });
  }

  results.sort((a, b) => a.distance - b.distance);
  return results.slice(0, k).map(({ id, type, content }) => ({
    id,
    type,
    content,
  }));
}
