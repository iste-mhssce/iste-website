"use client";
import { useState } from "react";
import { RefreshCw, CheckCircle, XCircle, Flag, Clock } from "lucide-react";
import {
  type IntakeStatus,
  type IntakeApplication,
  STATUS_STYLES,
} from "@lib/dashboard-types";

export default function IntakeTab({
  applications,
  summary,
  refresh,
}: {
  applications: IntakeApplication[] | null;
  summary: { flaggedCount: number; pendingCount: number; acceptedCount: number };
  refresh: () => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);

  const setStatus = async (id: string, status: IntakeStatus) => {
    setBusy(id);
    try {
      await fetch(`/api/admin/intake/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      refresh();
    } catch {
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Flagged", value: summary.flaggedCount, icon: Flag, color: "text-orange-400 bg-orange-500/10 border border-orange-500/20" },
          { label: "Pending Review", value: summary.pendingCount, icon: Clock, color: "text-amber-400 bg-amber-500/10 border border-amber-500/20" },
          { label: "Accepted", value: summary.acceptedCount, icon: CheckCircle, color: "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" },
        ].map((c) => (
          <div key={c.label} className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex items-center gap-4 shadow-xl backdrop-blur-md">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${c.color}`}>
              <c.icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-white">{c.value}</p>
              <p className="text-xs text-slate-500 font-medium">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      <section className="bg-slate-900/50 border border-slate-800 rounded-xl shadow-xl backdrop-blur-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-bold text-white">Intake Applications</h2>
          <button
            onClick={refresh}
            className="inline-flex items-center gap-1.5 text-sm text-emerald-400 font-semibold hover:text-emerald-300"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
        {!applications ? (
          <div className="px-6 py-10 text-center text-sm text-slate-500">Loading…</div>
        ) : applications.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-slate-500">
            No intake applications yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-slate-500 border-b border-slate-800">
                  <th className="px-6 py-3 font-semibold">Applicant</th>
                  <th className="px-6 py-3 font-semibold">Dept / Year</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">Flags</th>
                  <th className="px-6 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {applications.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-white">{a.fullName}</p>
                      <p className="text-xs text-slate-400">{a.email}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {a.department}
                      <p className="text-xs text-slate-500">{a.yearOfStudy}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold ${STATUS_STYLES[a.status]}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {a.riskFlags.length ? (
                        <div className="flex flex-col gap-1">
                          {a.riskFlags.map((f) => (
                            <span key={f} className="text-xs text-orange-400">{f}</span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => setStatus(a.id, "ACCEPTED")}
                          disabled={busy === a.id}
                          className="inline-flex items-center gap-1 text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <CheckCircle size={12} /> Accept
                        </button>
                        <button
                          onClick={() => setStatus(a.id, "REJECTED")}
                          disabled={busy === a.id}
                          className="inline-flex items-center gap-1 text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <XCircle size={12} /> Reject
                        </button>
                        {a.status === "FLAGGED" && (
                          <button
                            onClick={() => setStatus(a.id, "UNDER_REVIEW")}
                            disabled={busy === a.id}
                            className="inline-flex items-center gap-1 text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                          >
                            Review
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}