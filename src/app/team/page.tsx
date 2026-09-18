"use client";
import { useEffect, useState } from "react";
import {
  X,
  Link2,
  Globe,
  AtSign,
  Mail,
  MousePointerClick,
} from "lucide-react";

interface Member {
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
}

const TEAM_ORDER = [
  "Faculty Board",
  "Core Council",
  "Tech Team",
  "Management",
  "Creatives",
];

function groupByTeam(members: Member[]): { team: string; label: string; items: Member[] }[] {
  const map = new Map<string, Member[]>();
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
  return teams.map((team) => {
    const label =
      team === "Faculty Board" ? "Faculty" : team === "Core Council" ? "Core Team" : team;
    return {
      team,
      label,
      items: (map.get(team) ?? []).sort((a, b) => a.order - b.order),
    };
  });
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const FALLBACK_MEMBERS: Member[] = [
  { id: "fb-1", name: "Alex Morgan", role: "Chairperson", team: "Core Council", photoUrl: null, email: null, bio: null, linkedin: null, instagram: null, github: null, order: 1 },
  { id: "fb-2", name: "Priya Sharma", role: "Vice Chairperson", team: "Core Council", photoUrl: null, email: null, bio: null, linkedin: null, instagram: null, github: null, order: 2 },
  { id: "fb-3", name: "Rohan Deshmukh", role: "Secretary", team: "Core Council", photoUrl: null, email: null, bio: null, linkedin: null, instagram: null, github: null, order: 3 },
  { id: "fb-4", name: "Sneha Kulkarni", role: "Treasurer", team: "Core Council", photoUrl: null, email: null, bio: null, linkedin: null, instagram: null, github: null, order: 4 },
  { id: "fb-5", name: "Aditya Patil", role: "Technical Head", team: "Tech Team", photoUrl: null, email: null, bio: null, linkedin: null, instagram: null, github: null, order: 1 },
  { id: "fb-6", name: "Tanvi Rao", role: "Creative Director", team: "Creatives", photoUrl: null, email: null, bio: null, linkedin: null, instagram: null, github: null, order: 1 },
  { id: "fb-7", name: "Meera Joshi", role: "Events Coordinator", team: "Management", photoUrl: null, email: null, bio: null, linkedin: null, instagram: null, github: null, order: 1 },
];

export default function TeamPage() {
  const [members, setMembers] = useState<Member[] | null>(null);
  const [selected, setSelected] = useState<Member | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/council")
      .then(async (r) => {
        const body = await r.json().catch(() => null);
        if (cancelled) return;
        if (r.ok && body?.members?.length > 0) {
          setMembers(body.members as Member[]);
        } else {
          setMembers(FALLBACK_MEMBERS);
        }
      })
      .catch(() => {
        if (!cancelled) setMembers(FALLBACK_MEMBERS);
        setError(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const groups = members ? groupByTeam(members) : [];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-mono uppercase tracking-widest text-[#2563EB] font-semibold">
            ISTE-MHSSCE
          </p>
          <h1 className="mt-2 text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Meet the <span className="text-gradient">Team</span>
          </h1>
          <p className="mt-4 text-slate-500 text-sm sm:text-base">
            The faculty advisors and core team members powering workshops,
            hackathons and innovation at ISTE-MHSSCE. Click any card for more
            information.
          </p>
        </div>

        {!members && !error && (
          <div className="text-center text-sm text-slate-400 py-10">
            Loading team members...
          </div>
        )}

        {members && (
          <div className="space-y-16">
            {groups.length === 0 && (
              <p className="text-center text-sm text-slate-400">
                No team members have been added yet.
              </p>
            )}
            {groups.map((group) => (
              <section key={group.team}>
                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
                  <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-[#2563EB] to-[#06B6D4]" />
                  {group.label}
                  <span className="text-slate-400 font-medium text-sm">
                    ({group.items.length})
                  </span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                  {group.items.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelected(m)}
                      className="group bg-white border border-slate-200 rounded-2xl p-5 flex flex-col items-center gap-3 shadow-sm hover:shadow-xl hover:border-[#2563EB]/40 hover:-translate-y-1 transition-all text-left"
                    >
                      <div className="relative">
                        {m.photoUrl ? (
                          <img
                            src={m.photoUrl}
                            alt={m.name}
                            className="w-32 h-32 rounded-2xl object-cover ring-2 ring-slate-200 group-hover:ring-[#2563EB]/40 transition-shadow"
                          />
                        ) : (
                          <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#06B6D4] flex items-center justify-center text-white font-bold text-3xl">
                            {initials(m.name)}
                          </div>
                        )}
                        <span className="absolute bottom-1.5 right-1.5 rounded-full bg-slate-900/80 text-white p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MousePointerClick size={12} />
                        </span>
                      </div>
                      <div className="text-center min-w-0">
                        <h3 className="font-bold text-slate-900 text-sm truncate">
                          {m.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{m.role}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        <p className="mt-16 text-center text-xs text-slate-400">
          Detailed profiles and committee responsibilities are updated by the
          chapter team. Theme by ISTE-MHSSCE.
        </p>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-[70] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative px-6 pt-8 pb-2">
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                aria-label="Close"
              >
                <X size={18} />
              </button>
              <div className="flex flex-col items-center text-center">
                {selected.photoUrl ? (
                  <img
                    src={selected.photoUrl}
                    alt={selected.name}
                    className="w-40 h-40 rounded-2xl object-cover ring-4 ring-[#2563EB]/20"
                  />
                ) : (
                  <div className="w-40 h-40 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#06B6D4] flex items-center justify-center text-white font-bold text-5xl">
                    {initials(selected.name)}
                  </div>
                )}
                <h3 className="mt-4 text-xl font-extrabold text-slate-900">
                  {selected.name}
                </h3>
                <p className="text-sm font-semibold text-[#2563EB] mt-0.5">
                  {selected.role}
                </p>
                <span className="mt-2 inline-block text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                  {selected.team}
                </span>
              </div>
            </div>

            <div className="px-6 pb-8">
              {selected.bio && (
                <p className="mt-5 text-sm text-slate-600 leading-relaxed text-center">
                  {selected.bio}
                </p>
              )}

              <div className="mt-6 grid grid-cols-1 gap-2">
                {selected.email && (
                  <a
                    href={`mailto:${selected.email}`}
                    className="inline-flex items-center justify-center gap-2 text-slate-700 text-sm font-medium px-4 py-2.5 rounded-xl border border-slate-200 hover:border-[#2563EB]/40 hover:text-[#2563EB] transition-colors"
                  >
                    <Mail size={15} /> {selected.email}
                  </a>
                )}
                {(selected.linkedin ||
                  selected.github ||
                  selected.instagram) && (
                    <div className="flex items-center justify-center gap-2 mt-1">
                      {selected.linkedin && (
                        <a
                          href={selected.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 text-slate-400 hover:text-[#2563EB] border border-slate-200 rounded-xl hover:border-[#2563EB]/40 transition-colors"
                          aria-label={`${selected.name} LinkedIn`}
                        >
                          <Link2 size={17} />
                        </a>
                      )}
                      {selected.instagram && (
                        <a
                          href={selected.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 text-slate-400 hover:text-[#2563EB] border border-slate-200 rounded-xl hover:border-[#2563EB]/40 transition-colors"
                          aria-label={`${selected.name} Instagram`}
                        >
                          <AtSign size={17} />
                        </a>
                      )}
                      {selected.github && (
                        <a
                          href={selected.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 text-slate-400 hover:text-slate-900 border border-slate-200 rounded-xl hover:border-slate-400/40 transition-colors"
                          aria-label={`${selected.name} GitHub`}
                        >
                          <Globe size={17} />
                        </a>
                      )}
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}