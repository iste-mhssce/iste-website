import { describe, it, expect, vi } from "vitest";
import { rateLimit } from "../lib/ai/rateLimiter";

describe("rateLimit (token bucket)", () => {
  it("allows up to the configured limit, then blocks", () => {
    const scope = `test-${Date.now()}-${Math.random()}`;
    // First N calls are allowed
    for (let i = 0; i < 5; i++) {
      expect(rateLimit(scope, 5)).toBe(true);
    }
    // Further calls block
    expect(rateLimit(scope, 5)).toBe(false);
  });

  it("uses distinct buckets for distinct scopes", () => {
    const a = `a-${Math.random()}`;
    const b = `b-${Math.random()}`;
    expect(rateLimit(a, 1)).toBe(true);
    expect(rateLimit(a, 1)).toBe(false);
    expect(rateLimit(b, 1)).toBe(true);
  });

  it("refills tokens over time", () => {
    vi.useFakeTimers();
    try {
      const scope = `refill-${Math.random()}`;
      expect(rateLimit(scope, 1)).toBe(true);
      expect(rateLimit(scope, 1)).toBe(false);
      // Advance beyond one refill window (60s) to restore a token.
      vi.advanceTimersByTime(61_000);
      expect(rateLimit(scope, 1)).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });
});
