import { describe, it, expect } from "vitest";
import {
  isMalformedCertificateId,
  isDisposableEmailDomain,
  computeCertificateRiskScore,
} from "../lib/ai/riskHeuristics";

describe("isMalformedCertificateId", () => {
  it("accepts a valid ISTE certificate id", () => {
    expect(isMalformedCertificateId("ISTE-MHSS-2026-X982")).toBe(false);
  });

  it("rejects an id with wrong prefix", () => {
    expect(isMalformedCertificateId("MHSS-2026-X982")).toBe(true);
  });

  it("rejects an id with an invalid year", () => {
    expect(isMalformedCertificateId("ISTE-MHSS-20X6-X982")).toBe(true);
  });

  it("rejects an id that is too short", () => {
    expect(isMalformedCertificateId("ISTE-MHSS-2026-A")).toBe(true);
  });

  it("rejects an id with invalid characters in the code", () => {
    expect(isMalformedCertificateId("ISTE-MHSS-2026-X-98")).toBe(true);
  });
});

describe("isDisposableEmailDomain", () => {
  it("flags a known disposable domain", () => {
    expect(isDisposableEmailDomain("user@mailinator.com")).toBe(true);
  });

  it("does not flag a normal domain", () => {
    expect(isDisposableEmailDomain("user@gmail.com")).toBe(false);
  });

  it("handles uppercase domains case-insensitively", () => {
    expect(isDisposableEmailDomain("user@TEMPMail.com")).toBe(true);
  });
});

describe("computeCertificateRiskScore", () => {
  const now = new Date();

  it("returns zero risk for an entirely clean certificate", () => {
    const { riskScore, riskFlags } = computeCertificateRiskScore({
      certificateId: "ISTE-MHSS-2026-X982",
      duplicateCount: 1,
      issueDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    });
    expect(riskScore).toBe(0);
    expect(riskFlags).toEqual([]);
  });

  it("flags duplicate issue", () => {
    const { riskScore, riskFlags } = computeCertificateRiskScore({
      certificateId: "ISTE-MHSS-2026-X982",
      duplicateCount: 5,
      issueDate: now,
    });
    expect(riskFlags).toContain("duplicate_issue");
    expect(riskScore).toBeGreaterThan(0);
  });

  it("flags a malformed id", () => {
    const { riskScore, riskFlags } = computeCertificateRiskScore({
      certificateId: "bad",
      duplicateCount: 1,
      issueDate: now,
    });
    expect(riskFlags).toContain("malformed_certificate_id");
    expect(riskScore).toBe(0.25);
  });

  it("flags a future issue date", () => {
    const { riskScore, riskFlags } = computeCertificateRiskScore({
      certificateId: "ISTE-MHSS-2026-X982",
      duplicateCount: 1,
      issueDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
    });
    expect(riskFlags).toContain("future_issue_date");
    expect(riskScore).toBe(0.35);
  });

  it("caps risk score at 1", () => {
    const { riskScore } = computeCertificateRiskScore({
      certificateId: "bad",
      duplicateCount: 20,
      issueDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
    });
    expect(riskScore).toBeLessThanOrEqual(1);
  });
});
