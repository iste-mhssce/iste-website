import { describe, it, expect } from "vitest";
import { SYSTEM_PROMPT, CONTEXT_INDEXER } from "../lib/ai/chat";

/**
 * Lightweight behavioral eval for the assistant contract.
 * Verifies the deterministic parts: that the system prompt enforces grounding
 * rules (no hallucination, no certificate validation) and that retrieved
 * context is rendered with source ids for auditability.
 */
describe("chat assistant grounding contract", () => {
  it("explicitly forbids inventing facts outside context", () => {
    expect(SYSTEM_PROMPT).toContain("NEVER invent");
    expect(SYSTEM_PROMPT.toLowerCase()).toMatch(/never invent (event dates|times|venues)/i);
  });

  it("explicitly refuses to certify certificates via chat", () => {
    expect(SYSTEM_PROMPT).toContain("Do NOT certify or validate any certificate");
    expect(SYSTEM_PROMPT).toContain("official verifier");
  });

  it("directs the assistant to answer only from CONTEXT", () => {
    expect(SYSTEM_PROMPT).toContain('Answer ONLY from the "CONTEXT"');
  });

  it("renders no-context fallback message", () => {
    expect(SYSTEM_PROMPT).toContain("no indexed material");
  });

  it("formats retrieved source ids for auditability", () => {
    const rendered = CONTEXT_INDEXER([
      { id: "ev_1", type: "event", content: "National Hackathon 2026" },
      { id: "pub_2", type: "publication", content: "Node.js APIs" },
    ]);
    expect(rendered).toContain("[event#ev_1]");
    expect(rendered).toContain("[publication#pub_2]");
    expect(rendered).toContain("National Hackathon 2026");
  });

  it("renders empty-context explicitly", () => {
    expect(CONTEXT_INDEXER([])).toBe("(no retrieved context)");
  });
});
