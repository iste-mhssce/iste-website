export type Role = "SUPER_ADMIN" | "ADMIN" | "MEMBER";

export type IntakeStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "ACCEPTED"
  | "REJECTED"
  | "FLAGGED";

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  team: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface IntakeApplication {
  id: string;
  fullName: string;
  email: string;
  department: string;
  yearOfStudy: string;
  portfolioUrl: string | null;
  status: IntakeStatus;
  riskFlags: string[];
  createdAt: string;
}

export interface Certificate {
  id: string;
  certificateId: string;
  studentName: string;
  eventName: string;
  issueDate: string;
  riskScore: number;
}

export const ROLE_STYLES: Record<Role, string> = {
  SUPER_ADMIN: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
  ADMIN: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  MEMBER: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
};

export const STATUS_STYLES: Record<IntakeStatus, string> = {
  PENDING: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  UNDER_REVIEW: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  ACCEPTED: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  REJECTED: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
  FLAGGED: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
};

export function genPassword(): string {
  const chars =
    "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
  return Array.from(
    { length: 12 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
}

export async function jsonOrThrow(res: Response) {
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(body?.message ?? `Request failed (${res.status})`);
  }
  return body;
}
