"use client";
import { useState } from "react";
import { X, CheckCircle, Loader2, Calendar } from "lucide-react";

export interface RegisterEvent {
  id: string;
  title: string;
  category: string;
  location?: string;
  startDate?: string;
}

export default function EventRegisterModal({
  event,
  onClose,
}: {
  event: RegisterEvent | null;
  onClose: () => void;
}) {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [teamName, setTeamName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!event) return null;

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          userName,
          email,
          phone,
          teamName: teamName.trim() || undefined,
        }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setError(body?.message ?? "Registration failed. Please try again.");
        return;
      }
      setSuccess(true);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isHackathon = event.category === "HACKATHON";

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="font-bold text-slate-900">
            {isHackathon ? "Register Team" : "Register Seat"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div className="px-6 py-10 text-center">
            <CheckCircle size={40} className="text-[#16A34A] mx-auto mb-3" />
            <h3 className="font-bold text-slate-900 mb-1">
              {isHackathon ? "Team registered successfully!" : "Registration successful!"}
            </h3>
            <p className="text-sm text-slate-500">
              We&apos;ve received your registration for{" "}
              <span className="font-semibold text-slate-900">{event.title}</span>.
              Details will be shared on your registered email.
            </p>
            <button
              onClick={onClose}
              className="mt-5 glass-btn text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-opacity hover:opacity-90"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="px-6 py-5">
            <div className="flex items-start gap-2 mb-5 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              <Calendar size={16} className="text-[#2563EB] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-slate-900">{event.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {event.location && `${event.location}`}
                  {event.startDate &&
                    ` · ${new Date(event.startDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}`}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <input
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder={isHackathon ? "Team lead name" : "Full name"}
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
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
                autoComplete="tel"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
              />
              {isHackathon && (
                <input
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Team name (optional)"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                />
              )}
            </div>

            {error && (
              <p className="text-xs text-[#B91C1C] mt-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              onClick={submit}
              disabled={loading || !userName || !email || !phone}
              className="glass-btn mt-5 w-full disabled:opacity-50 text-white font-semibold text-sm py-3 rounded-xl transition-opacity hover:opacity-90 inline-flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              {isHackathon ? "Register Team" : "Confirm Registration"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}