export type Role = "SUPER_ADMIN" | "ADMIN" | "MEMBER";

export const ROLE_RANK: Record<Role, number> = {
  MEMBER: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
};

export const ROLES: Role[] = ["SUPER_ADMIN", "ADMIN", "MEMBER"];

export function roleAtLeast(role: Role, minRole: Role): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[minRole];
}