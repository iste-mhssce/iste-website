"use client";
import { useState } from "react";
import { RefreshCw, Sparkles } from "lucide-react";
import type { Certificate } from "@lib/dashboard-types";

export default function CertificatesTab({
  certificates,
  refresh,
}: {
  certificates: Certificate[] | null;
  refresh: () => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);

  const recomputeRisk = async (certificateId: string) => {
    setBusy(certificateId);
    try {
      await fetch("/api/ai/certificates/risk-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ certificateId }),
      });
      refresh();
    } catch {
    } finally {
      setBusy(null);
    }
  };

  const reindexEmbeddings = () => {
    setBusy("reindex");
    fetch("/api/ai/embeddings/reindex", { method: "POST" }).finally(() =>
      setBusy(null),
    );
  };

  return (
    <div className="space-y-6">
      <section className="bg-slate-900/50 border border-slate-800 rounded-xl shadow-xl backdrop-blur-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-white">High-Risk Certificates</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Certificates with riskScore &gt;= 0.4 (waiting on manual verification)
            </p>
          </div>
          <button
            onClick={reindexEmbeddings}
            disabled={busy === "reindex"}
            className="inline-flex items-center gap-2 text-sm bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500/40 text-slate-200 hover:text-emerald-300 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <Sparkles size={14} />
            Reindex Embeddings
          </button>
        </div>
        {!certificates ? (
          <div className="px-6 py-10 text-center text-sm text-slate-500">Loading…</div>
        ) : certificates.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-slate-500">
            No high-risk certificates currently flagged.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-slate-500 border-b border-slate-800">
                  <th className="px-6 py-3 font-semibold">Certificate ID</th>
                  <th className="px-6 py-3 font-semibold">Recipient</th>
                  <th className="px-6 py-3 font-semibold">Event</th>
                  <th className="px-6 py-3 font-semibold">Risk</th>
                  <th className="px-6 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {certificates.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-emerald-300">
                      {c.certificateId}
                    </td>
                    <td className="px-6 py-4 font-medium text-white">
                      {c.studentName}
                    </td>
                    <td className="px-6 py-4 text-slate-300">{c.eventName}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                        {(c.riskScore * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => recomputeRisk(c.certificateId)}
                        disabled={busy === c.certificateId}
                        className="inline-flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <RefreshCw size={12} /> Recompute
                      </button>
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