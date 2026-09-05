import { prisma } from "@lib/db";

export interface IntakeRiskResult {
  riskScore: number; // 0..1
  riskFlags: string[];
  flagged: boolean;
}

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "tempmail.com",
  "10minutemail.com",
  "yopmail.com",
  "throwawaymail.com",
  "trashmail.com",
  "maildrop.cc",
  "dispostable.com",
]);

/** Pure: validate a certificate id against the expected ISTE pattern. */
export function isMalformedCertificateId(id: string): boolean {
  const pattern = /^ISTE-MHSS-20\d{2}-[A-Z0-9]{3,6}$/i;
  return !pattern.test(id);
}

/** Pure: detect a disposable-email domain. Exported for testing. */
export function isDisposableEmailDomain(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  return DISPOSABLE_EMAIL_DOMAINS.has(domain);
}

/**
 * Pure certificate risk scoring given pre-computed inputs.
 * Kept side-effect free so it is trivial to unit test. The DB-counting wrapper
 * (scoreCertificate) simply supplies these inputs.
 */
export function computeCertificateRiskScore(input: {
  certificateId: string;
  duplicateCount: number;
  issueDate: Date;
}): { riskScore: number; riskFlags: string[] } {
  const riskFlags: string[] = [];
  let riskScore = 0;

  if (input.duplicateCount > 1) {
    riskFlags.push("duplicate_issue");
    riskScore += 0.5;
  }

  if (isMalformedCertificateId(input.certificateId)) {
    riskFlags.push("malformed_certificate_id");
    riskScore += 0.25;
  }

  if (input.issueDate.getTime() > Date.now()) {
    riskFlags.push("future_issue_date");
    riskScore += 0.35;
  }

  return { riskScore: Math.min(1, riskScore), riskFlags };
}

/**
 * Heuristic risk scoring for intake applications.
 * Returns a 0..1 risk score plus discrete flags. This NEVER rejects on its own —
 * it only informs human review by setting status to FLAGGED.
 */
export async function scoreIntakeApplication(input: {
  fullName: string;
  email: string;
  portfolioUrl?: string;
}): Promise<IntakeRiskResult> {
  const riskFlags: string[] = [];
  let riskScore = 0;

  // 1. Same email reused across previous applications
  const existingByEmail = await prisma.intakeApplication.count({
    where: { email: input.email.toLowerCase() },
  });
  if (existingByEmail > 0) {
    riskFlags.push("duplicate_email");
    riskScore += 0.25;
  }

  // 2. Disposable email domain
  if (isDisposableEmailDomain(input.email)) {
    riskFlags.push("disposable_email_domain");
    riskScore += 0.3;
  }

  // 3. Portfolio URL present but unreachable/empty
  const portfolio = input.portfolioUrl?.trim();
  if (portfolio === "" || !portfolio) {
    riskFlags.push("missing_portfolio");
    riskScore += 0.15;
  } else {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(portfolio, {
        method: "GET",
        signal: controller.signal,
        redirect: "follow",
      });
      clearTimeout(timeout);
      if (!res.ok) {
        riskFlags.push("unreachable_portfolio");
        riskScore += 0.2;
      }
    } catch {
      riskFlags.push("unreachable_portfolio");
      riskScore += 0.2;
    }
  }

  return {
    riskScore: Math.min(1, riskScore),
    riskFlags,
    flagged: riskScore >= 0.4,
  };
}

export interface CertRiskResult {
  riskScore: number; // 0..1
  riskFlags: string[];
}

/**
 * Heuristic risk scoring for a certificate.
 * Flags potential fraud signals without auto-rejecting:
 *  - duplicate (studentName, eventName) issued within a short window
 *  - certificateId pattern mismatch
 *  - issueDate out of a plausible range
 */
export async function scoreCertificate(input: {
  certificateId: string;
  studentName: string;
  eventName: string;
  issueDate: Date;
}): Promise<CertRiskResult> {
  // 1. Duplicate name/event combos issued at nearly the same time
  const windowStart = new Date(input.issueDate.getTime() - 60 * 60 * 1000);
  const windowEnd = new Date(input.issueDate.getTime() + 60 * 60 * 1000);
  const duplicates = await prisma.certificate.count({
    where: {
      studentName: input.studentName,
      eventName: input.eventName,
      issueDate: { gte: windowStart, lte: windowEnd },
    },
  });

  return computeCertificateRiskScore({
    certificateId: input.certificateId,
    duplicateCount: duplicates,
    issueDate: input.issueDate,
  });
}
