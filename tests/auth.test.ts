import { beforeAll, describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "../lib/auth/password";
import {
  signSessionToken,
  verifySessionToken,
} from "../lib/auth/session";
import { roleAtLeast } from "../lib/auth/guard-types";

describe("password hashing (scrypt)", () => {
  it("hashes and verifies a password", () => {
    const hash = hashPassword("correct horse battery staple");
    expect(hash.startsWith("scrypt$")).toBe(true);
    expect(verifyPassword("correct horse battery staple", hash)).toBe(true);
  });

  it("rejects the wrong password", () => {
    const hash = hashPassword("right");
    expect(verifyPassword("wrong", hash)).toBe(false);
  });

  it("produces unique salts per hash", () => {
    expect(hashPassword("same")).not.toBe(hashPassword("same"));
  });

  it("fails safely on malformed stored hashes", () => {
    expect(verifyPassword("x", "not-a-hash")).toBe(false);
    expect(verifyPassword("x", "sha256$abc$def")).toBe(false);
    expect(verifyPassword("x", "scrypt$nothex")).toBe(false);
  });
});

describe("session tokens (HMAC-signed)", () => {
  const user = { userId: "u_1", name: "Test", email: "t@x.com", role: "ADMIN" as const };

  beforeAll(() => {
    process.env.AUTH_SECRET = process.env.AUTH_SECRET ?? "test-secret-at-least-16-chars";
  });

  it("signs then verifies a round-trip token", () => {
    const token = signSessionToken(user);
    const decoded = verifySessionToken(token);
    expect(decoded).toEqual(user);
  });

  it("rejects a tampered payload", () => {
    const token = signSessionToken(user);
    const parts = token.split(".");
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
    payload.userId = "hacked";
    parts[1] = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const forged = parts.join(".");
    expect(verifySessionToken(forged)).toBeNull();
  });

  it("rejects garbage tokens", () => {
    expect(verifySessionToken("garbage")).toBeNull();
    expect(verifySessionToken("a.b")).toBeNull();
  });
});

describe("role hierarchy", () => {
  it("orders MEMBER < ADMIN < SUPER_ADMIN", () => {
    expect(roleAtLeast("MEMBER", "MEMBER")).toBe(true);
    expect(roleAtLeast("MEMBER", "ADMIN")).toBe(false);
    expect(roleAtLeast("ADMIN", "MEMBER")).toBe(true);
    expect(roleAtLeast("ADMIN", "ADMIN")).toBe(true);
    expect(roleAtLeast("ADMIN", "SUPER_ADMIN")).toBe(false);
    expect(roleAtLeast("SUPER_ADMIN", "ADMIN")).toBe(true);
    expect(roleAtLeast("SUPER_ADMIN", "SUPER_ADMIN")).toBe(true);
  });
});