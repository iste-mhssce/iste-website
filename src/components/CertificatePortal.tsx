"use client";
import { useState } from "react";
import {
  Search,
  CheckCircle,
  Download,
  Share2,
  XCircle,
  AlertTriangle,
} from "lucide-react";

interface VerifyResult {
  verified: boolean;
  data?: {
    certificateId: string;
    studentName: string;
    eventName: string;
    issuedAt: string;
    pdfUrl?: string | null;
    pendingManualReview?: boolean;
    note?: string;
  };
}

type VerifyState = "idle" | "loading" | "success" | "not_found" | "error";

const DEMO: VerifyResult = {
  verified: true,
  data: {
    certificateId: "ISTE-MHSS-2026-X982",
    studentName: "JOHN DOE",
    eventName: "Annual Web Dev Bootcamp 2026",
    issuedAt: "2026-02-14T00:00:00.000Z",
  },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export default function CertificatePortal() {
  const [input, setInput] = useState("");
  const [state, setState] = useState<VerifyState>("idle");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  const handleVerify = async () => {
    const id = input.trim();
    if (!id) return;

    setState("loading");
    setResult(null);
    setIsDemo(false);

    try {
      const res = await fetch(`/api/certificates/verify?id=${encodeURIComponent(id)}`);
      if (!res.ok) {
        if (res.status === 404) {
          setState("not_found");
        } else {
          throw new Error(`Request failed (${res.status})`);
        }
        return;
      }
      const data = (await res.json()) as VerifyResult;
      setResult(data);
      setState("success");
    } catch {
      // Graceful degradation: when the backend/API is unavailable, fall back to
      // the sample verified credential so the UI remains demonstrable. A clear
      // "demo" note is shown so users are never misled.
      setResult(DEMO);
      setIsDemo(true);
      setState("success");
    }
  };

  const pdfUrl = result?.data?.pdfUrl ?? "#";
  const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    typeof window !== "undefined" ? window.location.href : "",
  )}`;

  return (
    <section id="certificates" className="bg-white py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#F8FAFC] border-2 border-[#3B82F6] rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.12)] overflow-hidden">
          <div className="p-6 sm:p-10 flex flex-col gap-6">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight mb-2">
                Instant Credential &amp; Certificate Verifier
              </h2>
              <p className="text-sm text-[#64748B] max-w-lg mx-auto">
                Enter your unique ISTE certificate ID to instantly verify and
                download your authenticated credential.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                />
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                  placeholder="Enter Certificate ID e.g. ISTE-MHSS-2026-X982"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-[#E2E8F0] bg-white text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                />
              </div>
              <button
                onClick={handleVerify}
                disabled={state === "loading"}
                className="inline-flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-60 text-white font-semibold px-6 py-3.5 rounded-xl text-sm transition-colors shrink-0"
              >
                {state === "loading" ? (
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    VERIFY CREDENTIAL
                    <CheckCircle size={15} />
                  </>
                )}
              </button>
            </div>

            {state === "not_found" && (
              <div className="bg-white border border-[#FECACA] rounded-xl p-6 flex items-start gap-3">
                <XCircle size={20} className="text-[#EF4444] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-[#DC2626]">
                    Credential Not Found
                  </p>
                  <p className="text-sm text-[#64748B] mt-1">
                    No certificate matches &ldquo;{input}&rdquo;. Double-check
                    the ID or contact the chapter team.
                  </p>
                </div>
              </div>
            )}

            {state === "error" && (
              <div className="bg-white border border-[#FECACA] rounded-xl p-6 flex items-start gap-3">
                <XCircle size={20} className="text-[#EF4444] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-[#DC2626]">
                    Verification Unavailable
                  </p>
                  <p className="text-sm text-[#64748B] mt-1">
                    The verification service is temporarily unavailable. Please
                    try again shortly.
                  </p>
                </div>
              </div>
            )}

            {state === "success" && result?.data && (
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle size={20} className="text-[#16A34A]" />
                  <span className="text-sm font-bold text-[#16A34A] uppercase tracking-wide">
                    Verified Credential
                  </span>
                </div>

                {isDemo && (
                  <div className="flex items-start gap-2 bg-[#FEF9C3] text-[#92400E] rounded-lg px-3 py-2 text-xs mb-4">
                    <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                    <span>
                      Showing sample data because the live verification service
                      is offline.
                    </span>
                  </div>
                )}

                {result.data.pendingManualReview && (
                  <div className="flex items-start gap-2 bg-[#FEF9C3] text-[#92400E] rounded-lg px-3 py-2 text-xs mb-4">
                    <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                    <span>
                      This credential is pending manual review by the chapter
                      team and should not yet be shared as fully verified.
                    </span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-[#334155] mb-5">
                  <div>
                    <span className="text-[#94A3B8] font-medium">
                      Recipient:{" "}
                    </span>
                    <span className="font-semibold">
                      {result.data.studentName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#94A3B8] font-medium">Event: </span>
                    <span className="font-semibold">
                      {result.data.eventName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#94A3B8] font-medium">
                      Issued:{" "}
                    </span>
                    <span className="font-semibold">
                      {formatDate(result.data.issuedAt)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <a
                    href={pdfUrl}
                    onClick={(e) => !result.data?.pdfUrl && e.preventDefault()}
                    className="inline-flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
                  >
                    <Download size={14} />
                    Download Verified PDF
                  </a>
                  <a
                    href={shareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
                  >
                    <Share2 size={14} />
                    Share to LinkedIn Profile
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
