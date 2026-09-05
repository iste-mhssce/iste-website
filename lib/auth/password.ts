import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

/**
 * Hash a plaintext password with scrypt (no external deps).
 *
 * Stored format: `scrypt$<salt hex>$<hash hex>`
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_LENGTH);
  const hash = scryptSync(password, salt, KEY_LENGTH);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

/**
 * Verify a plaintext password against a stored scrypt hash.
 * Always validates the format before comparing to avoid exceptions on
 * malformed stored values.
 */
export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const salt = Buffer.from(parts[1], "hex");
  const expected = Buffer.from(parts[2], "hex");
  const actual = scryptSync(password, salt, KEY_LENGTH);
  return (
    actual.length === expected.length && timingSafeEqual(actual, expected)
  );
}