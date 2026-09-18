"use client";
import { useEffect, useState } from "react";
import { Link2, Globe } from "lucide-react";

interface Member {
  id: string;
  name: string;
  role: string;
  team: string;
  photoUrl: string | null;
  linkedin: string | null;
  github: string | null;
}

const tabs = [
  { label: "Faculty Board", team: "Faculty Board" },
  { label: "Core Council", team: "Core Council" },
  { label: "Tech Team", team: "Tech Team" },
  { label: "Creatives", team: "Creatives" },
  { label: "Management", team: "Management" },
];

const FALLBACK_MEMBERS: Member[] = [
  { id: "fb-1", name: "Alex Morgan", role: "Chairperson", team: "Core Council", photoUrl: null, linkedin: null, github: null },
  { id: "fb-2", name: "Priya Sharma", role: "Vice Chairperson", team: "Core Council", photoUrl: null, linkedin: null, github: null },
  { id: "fb-3", name: "Rohan Deshmukh", role: "Secretary", team: "Core Council", photoUrl: null, linkedin: null, github: null },
  { id: "fb-4", name: "Sneha Kulkarni", role: "Treasurer", team: "Core Council", photoUrl: null, linkedin: null, github: null },
  { id: "fb-5", name: "Aditya Patil", role: "Technical Head", team: "Tech Team", photoUrl: null, linkedin: null, github: null },
  { id: "fb-6", name: "Tanvi Rao", role: "Creative Director", team: "Creatives", photoUrl: null, linkedin: null, github: null },
  { id: "fb-7", name: "Meera Joshi", role: "Events Coordinator", team: "Management", photoUrl: null, linkedin: null, github: null },
];

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function StudentCouncil() {
  const [activeTab, setActiveTab] = useState(1);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const team = tabs[activeTab]?.team;

    fetch(`/api/council?team=${encodeURIComponent(team)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (data?.members?.length) {
          setMembers(data.members as Member[]);
        } else {
          // API returned no members for this team: show the static sample for
          // that team, or an empty state if none exists yet.
          setMembers(FALLBACK_MEMBERS.filter((m) => m.team === team));
        }
      })
      .catch(() => {
        if (!cancelled)
          setMembers(FALLBACK_MEMBERS.filter((m) => m.team === team));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  return (
    <section id="council" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            Student Council &amp; <span className="text-gradient">Leadership</span>
          </h2>
          <p className="text-slate-500 text-sm">
            Meet the team driving innovation and community at MHSSCOE ISTE.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {tabs.map((tab, i) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(i)}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === i
                  ? "glass-btn text-white shadow-md"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-[#2563EB] hover:text-[#2563EB]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="text-center text-sm text-slate-400 py-10">
            Loading team members...
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {members.map((m) => (
              <div
                key={m.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col items-center gap-3 shadow-sm"
              >
                {m.photoUrl ? (
                  <img
                    src={m.photoUrl}
                    alt={m.name}
                    className="w-20 h-20 rounded-full object-cover ring-2 ring-[#2563EB]/30"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#2563EB] to-[#06B6D4] flex items-center justify-center text-white font-bold text-xl">
                    {initials(m.name)}
                  </div>
                )}
                <div className="text-center">
                  <h3 className="font-bold text-slate-900 text-sm">{m.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{m.role}</p>
                </div>
                <div className="flex gap-2.5 mt-1">
                  <a
                    href={m.linkedin ?? "#"}
                    target={m.linkedin ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-[#2563EB] transition-colors"
                    aria-label={`${m.name} LinkedIn`}
                  >
                    <Link2 size={16} />
                  </a>
                  <a
                    href={m.github ?? "#"}
                    target={m.github ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-slate-900 transition-colors"
                    aria-label={`${m.name} GitHub`}
                  >
                    <Globe size={16} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
