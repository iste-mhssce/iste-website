"use client";
import { useEffect, useState } from "react";
import { Save, Loader2, CheckCircle } from "lucide-react";
import { SITE_SETTING_KEYS } from "@lib/site-settings";

const FIELDS: { key: (typeof SITE_SETTING_KEYS)[number]; label: string; placeholder: string; group: string }[] = [
  { key: "social.instagram", label: "Instagram", placeholder: "https://instagram.com/ste.mhsscoe", group: "Social Links" },
  { key: "social.linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/company/...", group: "Social Links" },
  { key: "social.twitter", label: "Twitter / X", placeholder: "https://x.com/...", group: "Social Links" },
  { key: "social.youtube", label: "YouTube", placeholder: "https://youtube.com/@...", group: "Social Links" },
  { key: "social.github", label: "GitHub", placeholder: "https://github.com/...", group: "Social Links" },
  { key: "partner.vapt_name", label: "VAPT Partner Name", placeholder: "VAPT Excellence Center", group: "Partner (VAPT)" },
  { key: "partner.vapt_url", label: "VAPT Website URL", placeholder: "https://vapt-mhssce.vercel.app/", group: "Partner (VAPT)" },
];

const GROUPS = ["Social Links", "Partner (VAPT)"];

export default function SiteSettingsTab() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then(async (r) => {
        const body = await r.json().catch(() => null);
        if (body?.settings) setValues(body.settings);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setBusy(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? "Failed to save settings");
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save settings");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-bold text-white">Site Settings</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Social links and the VAPT partner link shown on the public site footer &amp; banner.
          </p>
        </div>
        <button
          onClick={save}
          disabled={busy || loading}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
        >
          {busy ? <Loader2 size={15} className="animate-spin" /> : saved ? <CheckCircle size={15} /> : <Save size={15} />}
          {busy ? "Saving…" : saved ? "Saved!" : "Save Settings"}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center text-sm text-slate-500 py-10">Loading settings…</div>
      ) : (
        GROUPS.map((group) => (
          <section
            key={group}
            className="bg-slate-900/50 border border-slate-800 rounded-xl shadow-xl backdrop-blur-md overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-800">
              <h3 className="font-bold text-white">{group}</h3>
            </div>
            <div className="p-6 grid sm:grid-cols-2 gap-4">
              {FIELDS.filter((f) => f.group === group).map((f) => (
                <div key={f.key}>
                  <label className="text-xs font-medium text-slate-400 block mb-1.5">
                    {f.label}
                  </label>
                  <input
                    value={values[f.key] ?? ""}
                    onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-colors"
                  />
                </div>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}