import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@lib/db";
import { chatRequestSchema } from "@lib/validators";
import { errorResponse, getClientIp } from "@lib/api";
import { rateLimit } from "@lib/ai/rateLimiter";
import { retrieveContext } from "@lib/ai/retrieval";
import { runChatCompletion } from "@lib/ai/chat";
import { logApi, logWarn } from "@lib/log/logger";

export async function POST(req: NextRequest) {
  const start = Date.now();
  const ip = getClientIp(req);

  if (!rateLimit(`chat:${ip}`, 20)) {
    return NextResponse.json(
      { error: "RATE_LIMITED", message: "Too many chat requests" },
      { status: 429 },
    );
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error);
  }
  const { sessionId, message } = parsed.data;

  // Resolve or create the chat session (anonymous user token).
  const userToken = req.headers.get("x-user-token") ?? ip;
  let session = sessionId
    ? await prisma.chatSession.findUnique({ where: { id: sessionId } })
    : null;

  if (!session) {
    session = await prisma.chatSession.create({ data: { userToken } });
  }

  // Load prior history.
  const historyRows = await prisma.chatMessage.findMany({
    where: { sessionId: session.id },
    orderBy: { createdAt: "asc" },
    take: 20,
  });
  const history = historyRows.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  // Persist the user message first so it can never be lost.
  await prisma.chatMessage.create({
    data: {
      sessionId: session.id,
      role: "user",
      content: message,
    },
  });

  // RAG retrieval. Gracefully degrades: if retrieval/embeddings fail, answer
  // using navigation-only context rather than erroring out.
  let context: Awaited<ReturnType<typeof retrieveContext>> = [];
  try {
    context = await retrieveContext(message, 4);
  } catch (err) {
    logWarn("chat", "retrieval failed, answering with empty context", {
      error: String(err),
    });
  }

  // Grounded chat completion. Gracefully degrades: if the LLM provider is
  // unreachable or unconfigured, reply with a helpful fallback rather than
  // erroring out.
  let reply: Awaited<ReturnType<typeof runChatCompletion>>;
  try {
    reply = await runChatCompletion(history, context, message);
  } catch (err) {
    logWarn("chat", "completion failed, replying with fallback", {
      error: String(err),
    });
    reply = {
      content:
        "The AI assistant service is temporarily unavailable, so I can't answer that right now. In the meantime: browse Events for workshops and hackathons, open Council to see the student council, go to Verify Certificate in the footer to check any certificate, and use the Join the Committee form to apply for recruitment. The rest of the platform is fully functional.",
      tokens: 0,
    };
  }

  // Persist assistant reply with the source ids used (auditability).
  const saved = await prisma.chatMessage.create({
    data: {
      sessionId: session.id,
      role: "assistant",
      content: reply.content,
      retrievedIds: context.map((c) => c.id),
    },
  });

  logApi("chat", "reply", { latencyMs: Date.now() - start, status: 200 });

  return NextResponse.json({
    sessionId: session.id,
    messageId: saved.id,
    reply: reply.content,
    sources: context.map((c) => ({ id: c.id, type: c.type })),
  });
}
