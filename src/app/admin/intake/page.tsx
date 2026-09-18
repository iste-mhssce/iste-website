"use client";
import { useCallback, useEffect, useState } from "react";
import IntakeTab from "@/components/admin/IntakeTab";
import { jsonOrThrow, type IntakeApplication } from "@lib/dashboard-types";

export default function IntakePage() {
  const [applications, setApplications] = useState<IntakeApplication[] | null>(null);
  const [summary, setSummary] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setError(null);
    fetch("/api/admin/intake?limit=100")
      .then(async (r) => {
        const body = await jsonOrThrow(r);
        setApplications(body.applications);
        setSummary(body.summary ?? {});
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/intake?limit=100")
      .then(async (r) => {
        const body = await jsonOrThrow(r);
        if (cancelled) return;
        setApplications(body.applications);
        setSummary(body.summary ?? {});
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="w-full space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Intake Review</h1>
        <p className="text-sm text-slate-400 mt-1">
          Membership applications submitted through the Join Chapter form.
        </p>
      </div>
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}
      <IntakeTab
        applications={applications}
        summary={{
          flaggedCount: summary.FLAGGED ?? 0,
          pendingCount: summary.PENDING ?? 0,
          acceptedCount: summary.ACCEPTED ?? 0,
        }}
        refresh={refresh}
      />
    </div>
  );
}