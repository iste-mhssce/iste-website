export type Role = "ADMIN" | "HEAD" | "MEMBER";

export const ROLE_RANK: Record<Role, number> = {
  MEMBER: 1,
  HEAD: 2,
  ADMIN: 3,
};

export const ROLES: Role[] = ["ADMIN", "HEAD", "MEMBER"];

export function roleAtLeast(role: Role, minRole: Role): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[minRole];
}