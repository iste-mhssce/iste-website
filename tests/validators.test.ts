import { describe, it, expect } from "vitest";
import {
  certificateVerifyQuerySchema,
  eventRegisterSchema,
  intakeApplySchema,
  chatRequestSchema,
  eventListQuerySchema,
} from "../lib/validators";

describe("certificateVerifyQuerySchema", () => {
  it("accepts a valid certificate id", () => {
    const result = certificateVerifyQuerySchema.safeParse({
      id: "ISTE-MHSS-2026-X982",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty id", () => {
    const result = certificateVerifyQuerySchema.safeParse({ id: "ab" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid characters", () => {
    const result = certificateVerifyQuerySchema.safeParse({
      id: "ISTE MAHSS ESCAPES",
    });
    expect(result.success).toBe(false);
  });

  it("rejects ids that are too long", () => {
    const result = certificateVerifyQuerySchema.safeParse({
      id: "x".repeat(80),
    });
    expect(result.success).toBe(false);
  });
});

describe("eventListQuerySchema", () => {
  it("defaults page/limit when not provided", () => {
    const result = eventListQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(12);
    }
  });

  it("caps limit at 50", () => {
    const result = eventListQuerySchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid category", () => {
    const result = eventListQuerySchema.safeParse({ category: "TALKS" });
    expect(result.success).toBe(false);
  });
});

describe("eventRegisterSchema", () => {
  it("accepts a valid registration", () => {
    const result = eventRegisterSchema.safeParse({
      eventId: "clx00000000000000000000001",
      userName: "Jane Doe",
      email: "jane@example.com",
      phone: "+91 98765 43210",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = eventRegisterSchema.safeParse({
      eventId: "clx00000000000000000000001",
      userName: "Jane Doe",
      email: "not-an-email",
      phone: "+91 98765 43210",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing name", () => {
    const result = eventRegisterSchema.safeParse({
      eventId: "clx00000000000000000000001",
      userName: "A",
      email: "jane@example.com",
      phone: "+91 98765 43210",
    });
    expect(result.success).toBe(false);
  });
});

describe("intakeApplySchema", () => {
  it("accepts a valid application without portfolio", () => {
    const result = intakeApplySchema.safeParse({
      fullName: "Ravi Kumar",
      email: "ravi@example.com",
      department: "Computer Science",
      yearOfStudy: "Third Year",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid portfolio url", () => {
    const result = intakeApplySchema.safeParse({
      fullName: "Ravi Kumar",
      email: "ravi@example.com",
      department: "Computer Science",
      yearOfStudy: "Third Year",
      portfolioUrl: "https://github.com/ravi",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid portfolio url", () => {
    const result = intakeApplySchema.safeParse({
      fullName: "Ravi Kumar",
      email: "ravi@example.com",
      department: "Computer Science",
      yearOfStudy: "Third Year",
      portfolioUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
  });
});

describe("chatRequestSchema", () => {
  it("accepts a message and optional session", () => {
    const result = chatRequestSchema.safeParse({
      message: "When is the hackathon?",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty message", () => {
    const result = chatRequestSchema.safeParse({ message: "" });
    expect(result.success).toBe(false);
  });

  it("caps message length at 2000", () => {
    const result = chatRequestSchema.safeParse({
      message: "x".repeat(2001),
    });
    expect(result.success).toBe(false);
  });
});
