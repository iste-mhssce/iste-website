import { logAi, logWarn } from "@lib/log/logger";

export interface EmbeddingProvider {
  embed(texts: string[]): Promise<number[][]>;
}

/**
 * Minimal OpenAI-compatible embeddings client.
 * Provider-agnostic abstraction so we can swap providers without touching callers.
 * Only ever invoked server-side.
 */
export class OpenAiEmbeddings implements EmbeddingProvider {
  private apiKey = process.env.AI_PROVIDER_API_KEY;
  private model = process.env.AI_EMBEDDING_MODEL ?? "text-embedding-3-small";
  private baseUrl = process.env.AI_EMBEDDING_BASE_URL ?? "https://api.openai.com/v1";

  async embed(texts: string[]): Promise<number[][]> {
    if (!this.apiKey) {
      throw new Error("AI_PROVIDER_API_KEY is not configured");
    }
    const start = Date.now();
    const response = await fetch(`${this.baseUrl}/embeddings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ model: this.model, input: texts }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      logWarn("embeddings", `Embedding provider error ${response.status}`, {
        body: body.slice(0, 200),
      });
      throw new Error(`Embedding provider error: ${response.status}`);
    }

    const data = (await response.json()) as {
      data: { embedding: number[] }[];
    };
    const latencyMs = Date.now() - start;
    logAi("embeddings", "embed", { latencyMs, model: this.model });
    return data.data.map((d) => d.embedding);
  }
}

let provider: EmbeddingProvider | null = null;

/**
 * Lazily-initialized singleton. Safe to call anywhere server-side.
 */
export function getEmbeddingProvider(): EmbeddingProvider {
  if (!provider) {
    provider = new OpenAiEmbeddings();
  }
  return provider;
}

/**
 * Generate an embedding vector for a single text.
 * Throws if the provider is unavailable; callers should catch and degrade.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const [vector] = await getEmbeddingProvider().embed([text]);
  return vector;
}
