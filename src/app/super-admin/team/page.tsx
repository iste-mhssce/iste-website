"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Upload,
  Trash2,
  ImagePlus,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface CouncilMember {
  id: string;
  name: string;
  role: string;
  team: string;
  photoUrl: string | null;
  email: string | null;
  bio: string | null;
  linkedin: string | null;
  instagram: string | null;
  github: string | null;
  order: number;
  isActive: boolean;
}

const TEAM_ORDER = [
  "Faculty Board",
  "Core Council",
  "Tech Team",
  "Management",
  "Creatives",
];

function groupByTeam(members: CouncilMember[]): { team: string; items: CouncilMember[] }[] {
  const map = new Map<string, CouncilMember[]>();
  for (const m of members) {
    const list = map.get(m.team) ?? [];
    list.push(m);
    map.set(m.team, list);
  }
  const teams = Array.from(map.keys()).sort((a, b) => {
    const ia = TEAM_ORDER.indexOf(a);
    const ib = TEAM_ORDER.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
  return teams.map((team) => ({
    team,
    items: (map.get(team) ?? []).sort((a, b) => a.order - b.order),
  }));
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function TeamPhotosTab() {
  const [members, setMembers] = useState<CouncilMember[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState<{ id: string; action: "upload" | "remove" } | null>(null);
  const fileInput = useRef<HTMLInputElement | null>(null);
  const activeId = useRef<string | null>(null);

  const refresh = useCallback(() => {
    fetch("/api/admin/council?limit=200")
      .then(async (r) => {
        const body = await r.json();
        if (!r.ok) throw new Error(body?.message ?? "Failed to load team members.");
        setMembers(body.items as CouncilMember[]);
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/council?limit=200")
      .then(async (r) => {
        const body = await r.json();
        if (!r.ok) throw new Error(body?.message ?? "Failed to load team members.");
        if (!cancelled) setMembers(body.items as CouncilMember[]);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const pickPhoto = (id: string) => {
    activeId.current = id;
    fileInput.current?.click();
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !activeId.current) return;
    const id = activeId.current;

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setNotice(null);
      setError("Only PNG, JPEG or WebP images are allowed.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setNotice(null);
      setError("Photo must be 2MB or smaller.");
      return;
    }

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Could not read the image file."));
      reader.readAsDataURL(file);
    }).catch(() => null);

    if (!dataUrl) {
      setError("Could not read the image file.");
      return;
    }

    setError(null);
    setNotice(null);
    setSaving({ id, action: "upload" });
    try {
      const res = await fetch("/api/super-admin/team-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, photo: dataUrl }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.message ?? "Upload failed.");
      setNotice("Photo uploaded.");
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setSaving(null);
    }
  };

  const removePhoto = async (m: CouncilMember) => {
    setError(null);
    setNotice(null);
    setSaving({ id: m.id, action: "remove" });
    try {
      const res = await fetch("/api/super-admin/team-photo", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: m.id }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.message ?? "Remove failed.");
      setNotice(`Removed photo for ${m.name}.`);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Remove failed.");
    } finally {
      setSaving(null);
    }
  };

  const savingFor = (id: string, action: "upload" | "remove") =>
    saving?.id === id && saving.action === action;

  return (
    <div className="w-full space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Team Photos</h1>
        <p className="text-sm text-slate-400 mt-1">
          Upload portrait photos for faculty and core team members. Photos are
          shown on the public Team page and home page council cards. Super
          admin only.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm inline-flex items-center gap-2">
          <XCircle size={16} /> {error}
        </div>
      )}
      {notice && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-4 py-3 text-sm inline-flex items-center gap-2">
          <CheckCircle size={16} /> {notice}
        </div>
      )}

      <input
        ref={fileInput}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={onFile}
      />

      {!members && !error && (
        <p className="text-sm text-slate-400">Loading team members...</p>
      )}

      {members && members.length === 0 && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-10 text-center text-sm text-slate-400">
          No council members yet. Add members from the Admin Portal &gt; Council
          Team, then upload their photos here.
        </div>
      )}

      {members && members.length > 0 && (
        <div className="space-y-10">
          {groupByTeam(members).map((group) => (
            <div key={group.team}>
              <h2 className="text-sm font-mono uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                <ImagePlus size={15} className="text-emerald-400" />
                {group.team}
                <span className="text-slate-600">({group.items.length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.items.map((m) => (
                  <div
                    key={m.id}
                    className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-center gap-4 shadow-xl"
                  >
                    {m.photoUrl ? (
                      <img
                        src={m.photoUrl}
                        alt={m.name}
                        className="w-16 h-16 rounded-full object-cover ring-2 ring-emerald-500/30 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-lg flex-shrink-0">
                        {initials(m.name)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate">{m.name}</p>
                      <p className="text-xs text-slate-400 truncate">{m.role}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={() => pickPhoto(m.id)}
                          disabled={!!saving}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {savingFor(m.id, "upload") ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Upload size={12} />
                          )}
                          {m.photoUrl ? "Replace" : "Upload"}
                        </button>
                        {m.photoUrl && (
                          <button
                            onClick={() => removePhoto(m)}
                            disabled={!!saving}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {savingFor(m.id, "remove") ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Trash2 size={12} />
                            )}
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}