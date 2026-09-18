"use client";
import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Pencil,
  Search,
  Loader2,
  X,
} from "lucide-react";
import type { EntityDef, FieldDef } from "@lib/admin/entities";
import { ENTITIES } from "@lib/admin/entities";

interface Row {
  id: string;
  [key: string]: unknown;
}

function inputValue(field: FieldDef, value: unknown): string {
  if (field.type === "datetime" && value) {
    const d = new Date(String(value));
    if (!Number.isNaN(d.getTime())) {
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
    }
    return String(value).slice(0, 16);
  }
  if (value === null || value === undefined) return "";
  return String(value);
}

function formatCell(def: EntityDef, fieldKey: string, value: unknown): React.ReactNode {
  if (value === null || value === undefined || value === "") {
    return <span className="text-slate-400">—</span>;
  }
  if (def.dateKeys?.includes(fieldKey) && typeof value === "string") {
    return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  if (typeof value === "boolean") {
    return (
      <span
        className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold border ${
          value ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"
        }`}
      >
        {value ? "Yes" : "No"}
      </span>
    );
  }
  return String(value);
}

export default function EntityPage({
  entity,
}: {
  entity: string;
}) {
  const def = ENTITIES.find((e) => e.key === entity)!;
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [editing, setEditing] = useState<Row | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Record<string, string | number | boolean>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [formBusy, setFormBusy] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    const qs = search ? `?search=${encodeURIComponent(search)}` : "";
    try {
      const res = await fetch(`/api/admin/${entity}${qs}`);
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.message ?? "Failed to load");
      setRows(body.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    }
  }, [entity, search]);

  useEffect(() => {
    let cancelled = false;
    const qs = search ? `?search=${encodeURIComponent(search)}` : "";
    fetch(`/api/admin/${entity}${qs}`)
      .then(async (r) => {
        const body = await r.json().catch(() => null);
        if (cancelled) return;
        if (!r.ok) throw new Error(body?.message ?? "Failed to load");
        setRows(body.items ?? []);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      });
    return () => {
      cancelled = true;
    };
  }, [entity, search]);

  const openCreate = () => {
    const init: Record<string, string | number | boolean> = {};
    for (const field of def.fields) {
      if (field.defaultValue !== undefined) init[field.key] = field.defaultValue;
      else init[field.key] = field.type === "boolean" ? false : "";
    }
    setForm(init);
    setFormError(null);
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (row: Row) => {
    const init: Record<string, string | number | boolean> = {};
    for (const field of def.fields) {
      init[field.key] = inputValue(field, row[field.key]) as string | number | boolean;
    }
    setForm(init);
    setFormError(null);
    setEditing(row);
    setShowForm(true);
  };

  const submit = async () => {
    setFormBusy(true);
    setFormError(null);
    try {
      const res = await fetch(editing ? `/api/admin/${entity}/${editing.id}` : `/api/admin/${entity}`, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.message ?? "Request failed");
      setNotice(`Saved ${def.singular}.`);
      setShowForm(false);
      setEditing(null);
      setFormBusy(false);
      setTimeout(() => setNotice(null), 2500);
      load();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Request failed");
      setFormBusy(false);
    }
  };

  const remove = async (row: Row) => {
    if (!window.confirm(`Delete this ${def.singular.toLowerCase()}? This cannot be undone.`)) return;
    setBusy(row.id);
    try {
      const res = await fetch(`/api/admin/${entity}/${row.id}`, { method: "DELETE" });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.message ?? "Delete failed");
      setNotice(`Deleted ${def.singular.toLowerCase()}.`);
      setTimeout(() => setNotice(null), 2500);
      load();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusy(null);
    }
  };

  const renderFieldInput = (field: FieldDef) => {
    const value = form[field.key] ?? "";
    const base =
      "w-full px-3 py-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-colors";
    switch (field.type) {
      case "boolean":
        return (
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.checked }))}
            className="w-5 h-5 accent-emerald-500"
          />
        );
      case "number":
        return (
          <input
            type="number"
            value={Number(value)}
            onChange={(e) => setForm((f) => ({ ...f, [field.key]: Number(e.target.value) }))}
            className={base}
          />
        );
      case "select":
        return (
          <select
            value={String(value)}
            onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
            className={base}
          >
            {field.options?.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        );
      case "textarea":
        return (
          <textarea
            value={String(value)}
            onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
            rows={3}
            placeholder={field.placeholder}
            className={base}
          />
        );
      case "datetime":
        return (
          <input
            type="datetime-local"
            value={String(value)}
            onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
            className={base}
          />
        );
      default:
        return (
          <input
            type={field.type === "email" ? "email" : field.type === "url" ? "url" : "text"}
            value={String(value)}
            onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
            placeholder={field.placeholder}
            className={base}
          />
        );
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">{def.label}</h1>
          <p className="text-sm text-slate-400 mt-1">{def.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="pl-9 pr-3 py-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40"
            />
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            <Plus size={15} /> New {def.singular}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}
      {notice && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-4 py-3 text-sm">
          {notice}
        </div>
      )}

      <section className="bg-slate-900/50 border border-slate-800 rounded-xl shadow-xl backdrop-blur-md overflow-hidden">
        {!rows ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">
            No {def.label.toLowerCase()} found. Create the first one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-slate-500 border-b border-slate-800">
                  {def.listColumns.map((c) => (
                    <th key={c.key} className="px-6 py-3 font-semibold">{c.label}</th>
                  ))}
                  <th className="px-6 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-900/40 transition-colors">
                    {def.listColumns.map((c) => (
                      <td key={c.key} className="px-6 py-3.5 text-slate-300 max-w-xs truncate">
                        {formatCell(def, c.key, row[c.key])}
                      </td>
                    ))}
                    <td className="px-6 py-3.5">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(row)}
                          className="inline-flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Pencil size={12} /> Edit
                        </button>
                        <button
                          onClick={() => remove(row)}
                          disabled={busy === row.id}
                          className="inline-flex items-center gap-1.5 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={12} /> Delete
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

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900">
              <h2 className="font-bold text-white">
                {editing ? `Edit ${def.singular}` : `New ${def.singular}`}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 grid sm:grid-cols-2 gap-4">
              {def.fields.map((field) => (
                <div key={field.key} className={field.type === "textarea" ? "sm:col-span-2" : ""}>
                  <label className="text-xs font-medium text-slate-400 block mb-1.5">
                    {field.label}
                    {field.required && <span className="text-red-400"> *</span>}
                  </label>
                  {renderFieldInput(field)}
                  {field.help && <p className="text-[11px] text-slate-500 mt-1">{field.help}</p>}
                </div>
              ))}
            </div>
            {formError && (
              <div className="px-6 pb-4 text-sm text-red-400">{formError}</div>
            )}
            <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-end gap-3 sticky bottom-0 bg-slate-900">
              <button
                onClick={() => setShowForm(false)}
                className="text-sm font-semibold text-slate-400 hover:text-white px-4 py-2.5"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={formBusy}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
              >
                {formBusy && <Loader2 size={15} className="animate-spin" />}
                {editing ? "Save changes" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}