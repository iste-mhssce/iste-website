"use client";
import { useState } from "react";
import { X, CheckCircle, Loader2 } from "lucide-react";

export default function IntakeApplyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/intake/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          department,
          yearOfStudy,
          portfolioUrl: portfolioUrl.trim() || "",
        }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setError(
          body?.details?.[0]?.message ??
            body?.message ??
            "Application failed. Please try again.",
        );
        return;
      }
      setSuccess(true);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
    onClose();
    setSuccess(false);
    setError(null);
    setFullName("");
    setEmail("");
    setDepartment("");
    setYearOfStudy("");
    setPortfolioUrl("");
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={close}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="font-bold text-slate-900">Join the ISTE Committee</h2>
          <button
            onClick={close}
            className="p-2 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div className="px-6 py-10 text-center">
            <CheckCircle size={40} className="text-[#16A34A] mx-auto mb-3" />
            <h3 className="font-bold text-slate-900 mb-1">Application submitted!</h3>
            <p className="text-sm text-slate-500">
              Your application is now under review by our team. We&apos;ll reach
              out on the email you provided.
            </p>
            <button
              onClick={close}
              className="mt-5 glass-btn text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-opacity hover:opacity-90"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="px-6 py-5">
            <p className="text-sm text-slate-500 mb-5">
              Fill in your details below — applications are reviewed by the
              council before final admission.
            </p>
            <div className="space-y-3">
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full name"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
              />
              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Department (e.g. Computer)"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                />
                <select
                  value={yearOfStudy}
                  onChange={(e) => setYearOfStudy(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                >
                  <option value="">Year of study</option>
                  <option value="FY">FY — First Year</option>
                  <option value="SY">SY — Second Year</option>
                  <option value="TY">TY — Third Year</option>
                  <option value="BE">BE — Final Year</option>
                </select>
              </div>
              <input
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="Portfolio / GitHub URL (optional)"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
              />
            </div>

            {error && (
              <p className="text-xs text-[#B91C1C] mt-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              onClick={submit}
              disabled={loading || !fullName || !email || !department || !yearOfStudy}
              className="glass-btn mt-5 w-full disabled:opacity-50 text-white font-semibold text-sm py-3 rounded-xl transition-opacity hover:opacity-90 inline-flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              Submit Application
            </button>
          </div>
        )}
      </div>
    </div>
  );
}