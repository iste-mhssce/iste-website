import { randomUUID } from "crypto";

type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  requestId: string;
  message: string;
  latencyMs?: number;
  status?: number;
  ai?: {
    latencyMs?: number;
    tokens?: number;
    costUsd?: number;
    model?: string;
  };
  [key: string]: unknown;
}

const requestIds = new Map<string, string>();

function emit(entry: LogEntry) {
  const line = JSON.stringify(entry);
  if (entry.level === "error") {
    console.error(line);
  } else if (entry.level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

/** Get or create a request id for a given transport key (e.g. a fetch request). */
export function requestId(scope: string): string {
  const existing = requestIds.get(scope);
  if (existing) return existing;
  const id = `${scope}-${randomUUID().slice(0, 8)}`;
  requestIds.set(scope, id);
  return id;
}

/** Log an API route request/response with timing and optional extra fields. */
export function logApi(
  scope: string,
  message: string,
  opts: {
    latencyMs?: number;
    status?: number;
    rid?: string;
  } & Record<string, unknown> = {},
) {
  emit({
    level: "info",
    requestId: opts.rid ?? requestId(scope),
    message,
    ...opts,
  });
}

/** Log a warning. */
export function logWarn(scope: string, message: string, extra: unknown = {}) {
  emit({
    level: "warn",
    requestId: requestId(scope),
    message,
    ...(extra as Record<string, unknown>),
  });
}

/** Log an error. */
export function logError(
  scope: string,
  message: string,
  error?: unknown,
  extra: unknown = {},
) {
  emit({
    level: "error",
    requestId: requestId(scope),
    message,
    error: error instanceof Error ? error.message : String(error),
    ...(extra as Record<string, unknown>),
  });
}

/** Log AI-specific metrics separately so spend stays visible. */
export function logAi(
  scope: string,
  op: string,
  metrics: {
    latencyMs?: number;
    tokens?: number;
    costUsd?: number;
    model?: string;
  } = {},
) {
  emit({
    level: "info",
    requestId: requestId(scope),
    message: `ai:${op}`,
    ai: metrics,
  });
}
