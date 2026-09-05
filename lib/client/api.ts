export interface ApiError {
  error: string;
  message: string;
}

/**
 * Thin typed fetch wrapper used by client components.
 * Throws on non-2xx with a readable message, degrades cleanly.
 */
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    let body: ApiError | null = null;
    try {
      body = (await res.json()) as ApiError;
    } catch {
      body = null;
    }
    throw new Error(body?.message ?? `Request failed (${res.status})`);
  }

  return (await res.json()) as T;
}
