"use client";
import { useState } from "react";
import { CheckCircle, XCircle, Flag, Clock, Timer } from "lucide-react";
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
  summary: Record<string, number>;
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
          { label: "Flagged", value: summary.FLAGGED ?? 0, icon: Flag, color: "text-[#C2410C] bg-[#FED7AA]" },
          { label: "Pending Review", value: summary.PENDING ?? 0, icon: Clock, color: "text-[#92400E] bg-[#FEF9C3]" },
          { label: "Accepted", value: summary.ACCEPTED ?? 0, icon: CheckCircle, color: "text-[#16A34A] bg-[#DCFCE7]" },
        ].map((c) => (
          <div key={c.label} className="bg-white border border-[#E2E8F0] rounded-2xl p-5 flex items-center gap-4 shadow-sm">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${c.color}`}>
              <c.icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-[#0F172A]">{c.value}</p>
              <p className="text-xs text-[#64748B] font-medium">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      <section className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E8F0]">
          <h2 className="font-bold text-[#0F172A]">Intake Applications</h2>
        </div>
        {!applications ? (
          <div className="px-6 py-10 text-center text-sm text-[#64748B]">Loading…</div>
        ) : applications.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-[#64748B]">
            No intake applications yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-[#94A3B8] border-b border-[#E2E8F0]">
                  <th className="px-6 py-3">Applicant</th>
                  <th className="px-6 py-3">Dept / Year</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {applications.map((a) => (
                  <tr key={a.id}>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-[#0F172A]">{a.fullName}</p>
                      <p className="text-xs text-[#64748B]">{a.email}</p>
                    </td>
                    <td className="px-6 py-4 text-[#475569]">
                      {a.department}
                      <p className="text-xs text-[#94A3B8]">{a.yearOfStudy}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold ${STATUS_STYLES[a.status]}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setStatus(a.id, "ACCEPTED")}
                          disabled={busy === a.id}
                          className="inline-flex items-center gap-1 text-xs bg-[#16A34A] hover:bg-[#15803D] text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <CheckCircle size={12} /> Accept
                        </button>
                        <button
                          onClick={() => setStatus(a.id, "REJECTED")}
                          disabled={busy === a.id}
                          className="inline-flex items-center gap-1 text-xs bg-[#EF4444] hover:bg-[#DC2626] text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <XCircle size={12} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <p className="text-xs text-[#94A3B8] inline-flex items-center gap-1">
        <Timer size={12} /> Applications are never auto-approved — a human always reviews them.
      </p>
    </div>
  );
}