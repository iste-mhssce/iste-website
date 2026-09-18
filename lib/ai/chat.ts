import { logAi } from "@lib/log/logger";

export interface ChatMessageInput {
  role: "user" | "assistant";
  content: string;
}

interface ContextItem {
  id: string;
  type: string;
  content: string;
}

interface ChatCompletionResponse {
  content: string;
  tokens: number;
}

export const SYSTEM_PROMPT = `You are the ISTE-MHSSCE assistant for the MHSSCOE ISTE Student Chapter.

Your job is to help students and visitors with the ISTE-MHSSCE platform:
events, workshops, hackathons, seminars, certificate verification, the student
council, and committee recruitment.

Grounding rules (MUST follow):
- Answer ONLY from the "CONTEXT" provided below and general knowledge of how to
  navigate the ISTE-MHSSCE platform (find events, verify certificates, apply to
  committees).
- If the answer is not present in the CONTEXT, say you don't have that
  information and point them to the relevant part of the platform or ask the
  chapter team directly. NEVER invent event dates, times, venues, council member
  details, certificate validity, or pricing.
- Do NOT certify or validate any certificate. Certificate verification is done
  only through the official verifier using a certificate ID.
- Keep answers concise and helpful. Reply in the same language the user writes.

CONTEXT:
{context}

If CONTEXT is empty, state that you currently have no indexed material but can
still help navigate the platform.`;

export const CONTEXT_INDEXER = (items: ContextItem[]) =>
  items.length === 0
    ? "(no retrieved context)"
    : items.map((c) => `[${c.type}#${c.id}] ${c.content}`).join("\n");

/**
 * Run an LLM chat completion with retrieved context.
 * Presenter-agnostic: calls a standard OpenAI-compatible /chat/completions
 * endpoint. Server-only.
 */
export async function runChatCompletion(
  history: ChatMessageInput[],
  context: ContextItem[],
  userMessage: string,
): Promise<ChatCompletionResponse> {
  const apiKey = process.env.AI_PROVIDER_API_KEY;
  const model = process.env.AI_CHAT_MODEL ?? "gpt-4o-mini";
  const baseUrl = process.env.AI_CHAT_BASE_URL ?? "https://api.openai.com/v1";

  if (!apiKey) {
    throw new Error("AI_PROVIDER_API_KEY is not configured");
  }

  const contextBlock = CONTEXT_INDEXER(context);
  const systemContent = SYSTEM_PROMPT.replace("{context}", contextBlock);

  const messages = [
    { role: "system", content: systemContent },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: userMessage },
  ];

  const start = Date.now();
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.3,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Chat provider error ${response.status}: ${body.slice(0, 200)}`);
  }

  const data = (await response.json()) as {
    choices: { message: { content: string } }[];
    usage?: { total_tokens?: number };
  };

  const latencyMs = Date.now() - start;
  const tokens = data.usage?.total_tokens ?? 0;
  logAi("chat", "completion", { latencyMs, tokens, model });

  return {
    content: data.choices[0]?.message?.content ?? "",
    tokens,
  };
}
