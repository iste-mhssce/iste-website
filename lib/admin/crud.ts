import { prisma } from "@lib/db";
import {
  type EntityDef,
  type FieldDef,
} from "./entities";

export type PrismaDelegate = {
  findMany: (args?: Record<string, unknown>) => Promise<Array<Record<string, unknown>>>;
  findUnique: (args: { where: Record<string, unknown> }) => Promise<Record<string, unknown> | null>;
  count: (args?: Record<string, unknown>) => Promise<number>;
  create: (args: { data: Record<string, unknown> }) => Promise<Record<string, unknown>>;
  update: (args: {
    where: { id: string };
    data: Record<string, unknown>;
  }) => Promise<Record<string, unknown>>;
  delete: (args: { where: { id: string } }) => Promise<Record<string, unknown>>;
};

export function delegateFor(def: EntityDef): PrismaDelegate {
  const model = def.key === "council" ? "councilMember" : def.key;
  const tableName = model === "social-links" ? "socialLink" : model;
  // Post→post, events→event, certificates→certificate, notifications→notification,
  // council→councilMember, social-links→socialLink.
  const singular: Record<string, string> = {
    posts: "post",
    events: "event",
    certificates: "certificate",
    council: "councilMember",
    "social-links": "socialLink",
    notifications: "notification",
  };
  const delegateName = singular[def.key];
  const delegate = (prisma as unknown as Record<string, PrismaDelegate>)[delegateName];
  if (!delegate) {
    throw new Error(`No Prisma delegate for entity key "${def.key}" (tableName "${tableName}")`);
  }
  return delegate;
}

export function toSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export function coerceField(
  field: FieldDef,
  raw: unknown,
  existing: Record<string, unknown> = {},
): { value: unknown | undefined; error?: string } {
  const current = existing[field.key];
  switch (field.type) {
    case "boolean": {
      const v = raw === true || raw === "true" || raw === 1 || raw === "1";
      return { value: v };
    }
    case "number": {
      const v = String(raw).trim();
      if (v === "") return { value: current ?? 0 };
      const n = Number(v);
      if (Number.isNaN(n)) return { value: undefined, error: `${field.label} must be a number.` };
      return { value: n };
    }
    case "datetime": {
      if (raw === undefined || raw === null || String(raw).trim() === "") return { value: undefined };
      const d = new Date(String(raw));
      if (Number.isNaN(d.getTime())) return { value: undefined, error: `${field.label} is not a valid date.` };
      return { value: d };
    }
    default: {
      if (raw === undefined || raw === null) return { value: undefined };
      const s = String(raw).trim();
      if (s === "") return { value: undefined };
      return { value: s };
    }
  }
}

export function fieldValueFor(
  field: FieldDef,
  data: Record<string, unknown>,
): unknown {
  switch (field.type) {
    case "boolean":
      return data[field.key] === true;
    case "number":
      return Number(data[field.key]);
    case "datetime":
      return data[field.key] ? new Date(data[field.key] as string) : undefined;
    default:
      return data[field.key];
  }
}

/**
 * Builds a validated `data` object for Prisma containing only the editable
 * fields supplied, coërced to their proper types.
 */
export async function buildUpdateData(
  def: EntityDef,
  body: Record<string, unknown>,
): Promise<{ data: Record<string, unknown>; errors: string[] }> {
  return buildData(def, body, true);
}

export async function buildData(
  def: EntityDef,
  body: Record<string, unknown>,
  partial = false,
): Promise<{ data: Record<string, unknown>; errors: string[] }> {
  const data: Record<string, unknown> = {};
  const errors: string[] = [];

  for (const field of def.fields) {
    const raw = body[field.key];
    if (raw === undefined) {
      if (field.required && !partial) {
        errors.push(`${field.label} is required.`);
      }
      continue;
    }
    const { value, error } = coerceField(field, raw);
    if (error) {
      errors.push(error);
      continue;
    }
    if (value !== undefined) data[field.key] = value;
  }

  // Auto-generate slugs for posts/events when not supplied.
  if (def.key === "posts" || def.key === "events") {
    if (!data.slug || String(data.slug).trim() === "") {
      const title = data.title ?? body.title;
      if (title) {
        const base = toSlug(String(title));
        let slug = base;
        const delegate = delegateFor(def);
        let n = 1;
        while (true) {
          const existing = (await delegate.findUnique({ where: { slug } })) ?? null;
          if (slug !== "" && !existing) break;
          slug = `${base}-${n++}`;
        }
        data.slug = slug;
      }
    }
  }

  // Default publishedAt to now when a post is being published without one.
  if (def.key === "posts" && data.published === true && !data.publishedAt) {
    data.publishedAt = new Date();
  }

  return { data, errors };
}

export function listWhere(def: EntityDef, params: URLSearchParams) {
  const filters: Record<string, unknown> = {};
  const search = params.get("search");
  if (search && def.searchFields && def.searchFields.length > 0) {
    filters.OR = def.searchFields.map((f) => ({
      [f]: { contains: search, mode: "insensitive" },
    }));
  }
  // Any primitive field in the query is treated as a filtered list request.
  for (const field of def.fields) {
    const val = params.get(field.key);
    if (val === null) continue;
    if (field.type === "boolean") {
      if (val === "true" || val === "false") filters[field.key] = val === "true";
    } else if (field.type === "number") {
      filters[field.key] = Number(val);
    } else {
      filters[field.key] = { equals: val };
    }
  }
  return filters;
}