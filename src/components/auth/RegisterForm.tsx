"use client";
import { useState } from "react";
import { Loader2, CheckCircle } from "lucide-react";

export default function RegisterForm() {
  const [form, setForm] = useState({ fullName: "", email: "", department: "", yearOfStudy: "", portfolioUrl: "" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/intake/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          portfolioUrl: form.portfolioUrl.trim() || "",
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

  if (success) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 text-center">
        <CheckCircle size={44} className="text-[#16A34A] mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-1">Application submitted!</h2>
        <p className="text-sm text-slate-500">
          Your application is now under review by the ISTE MHSSCOE council. We&apos;ll
          reach out on the email you provided.
        </p>
        <a href="/login" className="inline-block mt-6 text-sm font-semibold text-[#2563EB] hover:underline">
          Continue to sign in
        </a>
      </div>
    );
  }

  const inputCls =
    "w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]";

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-900">Request membership</h2>
        <p className="text-sm text-slate-500 mt-1">
          Submit your details to join the ISTE MHSSCOE student chapter. Your
          application is reviewed by the council before an account is created.
        </p>
      </div>
      <div className="space-y-3">
        <input value={form.fullName} onChange={set("fullName")} placeholder="Full name" className={inputCls} />
        <input type="email" value={form.email} onChange={set("email")} placeholder="Email address" autoComplete="email" className={inputCls} />
        <div className="grid sm:grid-cols-2 gap-3">
          <input value={form.department} onChange={set("department")} placeholder="Department (e.g. Computer)" className={inputCls} />
          <select value={form.yearOfStudy} onChange={set("yearOfStudy")} className={inputCls}>
            <option value="">Year of study</option>
            <option value="FY">FY — First Year</option>
            <option value="SY">SY — Second Year</option>
            <option value="TY">TY — Third Year</option>
            <option value="BE">BE — Final Year</option>
          </select>
        </div>
        <input value={form.portfolioUrl} onChange={set("portfolioUrl")} placeholder="Portfolio / GitHub URL (optional)" className={inputCls} />
      </div>
      {error && <p className="text-xs text-[#B91C1C] mt-3">{error}</p>}
      <button
        onClick={submit}
        disabled={loading || !form.fullName || !form.email || !form.department || !form.yearOfStudy}
        className="glass-btn mt-5 w-full disabled:opacity-50 text-white font-semibold text-sm py-3 rounded-xl transition-opacity hover:opacity-90 inline-flex items-center justify-center gap-2"
      >
        {loading && <Loader2 size={15} className="animate-spin" />}
        Submit Application
      </button>
      <p className="text-xs text-slate-400 mt-4 text-center">
        Already have an account?{" "}
        <a href="/login" className="text-[#2563EB] font-semibold hover:underline">Sign in</a>
      </p>
    </div>
  );
}