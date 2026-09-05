import { z } from "zod";

export const certificateVerifyQuerySchema = z.object({
  id: z
    .string()
    .min(5, "Certificate ID must be at least 5 characters")
    .max(64, "Certificate ID is too long")
    .regex(
      /^[A-Za-z0-9-_]+$/,
      "Certificate ID contains invalid characters",
    ),
});

export const eventListQuerySchema = z.object({
  category: z.enum(["WORKSHOP", "HACKATHON", "SEMINAR", "SUMMIT"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export const eventRegisterSchema = z.object({
  eventId: z.string().cuid(),
  userName: z.string().min(2, "Name must be at least 2 characters").max(120),
  email: z.string().email("A valid email is required"),
  phone: z
    .string()
    .regex(/^\+?[\d\s()-]{7,20}$/, "A valid phone number is required"),
  teamName: z.string().max(120).optional(),
});

export const councilListQuerySchema = z.object({
  team: z.string().max(80).optional(),
});

export const intakeApplySchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email(),
  department: z.string().min(2).max(120),
  yearOfStudy: z.string().min(1).max(40),
  portfolioUrl: z
    .string()
    .url("A valid portfolio URL is required")
    .max(500)
    .optional()
    .or(z.literal("")),
});

export const chatRequestSchema = z.object({
  sessionId: z.string().cuid().optional(),
  message: z.string().min(1).max(2000),
});

export const recommendEventsSchema = z.object({
  email: z.string().email().optional(),
  interests: z.string().max(1000).optional(),
});

export const riskCheckQuerySchema = z.object({
  certificateId: z.string().min(5).max(64),
});

export const loginSchema = z.object({
  email: z.string().email("A valid email is required"),
  password: z.string().min(1, "Password is required").max(200),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required").max(200),
  newPassword: z
    .string()
    .min(6, "New password must be at least 6 characters")
    .max(200),
});

export const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(120),
  email: z.string().email("A valid email is required"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(200),
  role: z.enum(["ADMIN", "HEAD", "MEMBER"]),
  team: z.string().max(120).optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  role: z.enum(["ADMIN", "HEAD", "MEMBER"]).optional(),
  team: z.string().max(120).nullable().optional(),
  isActive: z.boolean().optional(),
  resetPassword: z.string().min(6).max(200).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type EventRegisterInput = z.infer<typeof eventRegisterSchema>;
export type IntakeApplyInput = z.infer<typeof intakeApplySchema>;
export type ChatRequestInput = z.infer<typeof chatRequestSchema>;
