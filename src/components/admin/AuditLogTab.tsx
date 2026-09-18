"use client";
import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

interface AuditRow {
  id: string;
  action: string;
  entity: string | null;
  entityId: string | null;
  actorName: string | null;
  actorRole: string | null;
  details: string | null;
  createdAt: string;
}

const ACTION_STYLES: Record<string, string> = {
  create: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  update: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  delete: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
  settings: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
};

export default function AuditLogTab() {
  const [logs, setLogs] = useState<AuditRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [action, setAction] = useState("");

  const load = async () => {
    setError(null);
    try {
      const qs = action ? `?action=${encodeURIComponent(action)}` : "";
      const res = await fetch(`/api/admin/audit-logs${qs}`);
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.message ?? "Failed to load audit log");
      setLogs(body.logs ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load audit log");
    }
  };

  useEffect(() => {
    let cancelled = false;
    const qs = action ? `?action=${encodeURIComponent(action)}` : "";
    fetch(`/api/admin/audit-logs${qs}`)
      .then(async (r) => {
        const body = await r.json().catch(() => null);
        if (cancelled) return;
        if (!r.ok) throw new Error(body?.message ?? "Failed to load audit log");
        setLogs(body.logs ?? []);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load audit log");
      });
    return () => {
      cancelled = true;
    };
  }, [action]);

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Audit Log</h1>
          <p className="text-sm text-slate-400 mt-1">
            Chronological record of administrative actions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="px-3 py-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 cursor-pointer"
          >
            <option value="" className="bg-slate-950 text-slate-200">All actions</option>
            <option value="create" className="bg-slate-950 text-slate-200">create</option>
            <option value="update" className="bg-slate-950 text-slate-200">update</option>
            <option value="delete" className="bg-slate-950 text-slate-200">delete</option>
            <option value="settings" className="bg-slate-950 text-slate-200">settings</option>
          </select>
          <button
            onClick={load}
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-semibold text-sm"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <section className="bg-slate-900/50 border border-slate-800 rounded-xl shadow-xl backdrop-blur-md overflow-hidden">
        {!logs ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">Loading…</div>
        ) : logs.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">No log entries.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-slate-500 border-b border-slate-800">
                  <th className="px-6 py-3 font-semibold">When</th>
                  <th className="px-6 py-3 font-semibold">Actor</th>
                  <th className="px-6 py-3 font-semibold">Action</th>
                  <th className="px-6 py-3 font-semibold">Entity</th>
                  <th className="px-6 py-3 font-semibold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-6 py-3.5 text-xs text-slate-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-3.5">
                      <p className="font-medium text-white">{log.actorName ?? "System"}</p>
                      <p className="text-xs text-slate-500">{log.actorRole ?? ""}</p>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold ${ACTION_STYLES[log.action] ?? "bg-slate-800 text-slate-300 border border-slate-700"}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-mono text-xs text-slate-300">
                      {log.entity ?? "—"}
                      {log.entityId ? <span className="text-slate-500"> ({log.entityId.slice(0, 8)}…)</span> : null}
                    </td>
                    <td className="px-6 py-3.5 text-xs text-slate-400 max-w-sm truncate">
                      {log.details ?? "—"}
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