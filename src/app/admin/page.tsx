"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  CalendarDays,
  Award,
  Users,
  Bell,
  Inbox,
  UserCog,
  Link2,
} from "lucide-react";

interface DashboardData {
  counts: {
    posts: number;
    publishedPosts: number;
    events: number;
    certificates: number;
    council: number;
    socialLinks: number;
    notifications: number;
    users: number;
    admins: number;
    pendingIntake: number;
    intake: number;
    auditLogs: number;
  };
  recentLogs: {
    id: string;
    action: string;
    entity: string | null;
    actorName: string | null;
    actorRole: string | null;
    createdAt: string;
    details: string | null;
  }[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then((body) => {
        if (body.error) setError(body.message ?? "Failed to load dashboard");
        else setData(body);
      })
      .catch(() => setError("Could not reach dashboard."));
  }, []);

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm">
        {error}
      </div>
    );
  }

  if (!data) {
    return <div className="text-center text-sm text-slate-500 py-16">Loading dashboard…</div>;
  }

  const { counts, recentLogs } = data;

  const cards = [
    { href: "/admin/posts", label: "Posts", value: counts.posts, sub: `${counts.publishedPosts} published`, icon: FileText, color: "bg-blue-500/10 text-blue-400 border border-blue-500/20" },
    { href: "/admin/events", label: "Events", value: counts.events, sub: "active listings", icon: CalendarDays, color: "bg-purple-500/10 text-purple-400 border border-purple-500/20" },
    { href: "/admin/certificates", label: "Certificates", value: counts.certificates, sub: "issued", icon: Award, color: "bg-orange-500/10 text-orange-400 border border-orange-500/20" },
    { href: "/admin/council", label: "Council Team", value: counts.council, sub: "members", icon: Users, color: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" },
    { href: "/admin/notifications", label: "Notifications", value: counts.notifications, sub: "active", icon: Bell, color: "bg-amber-500/10 text-amber-400 border border-amber-500/20" },
    { href: "/admin/social-links", label: "Social Links", value: counts.socialLinks, sub: "linked", icon: Link2, color: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" },
    { href: "/admin/intake", label: "Intake", value: counts.pendingIntake, sub: `${counts.intake} total applications`, icon: Inbox, color: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" },
    { href: "/admin/users", label: "Users", value: counts.users, sub: `${counts.admins} admins`, icon: UserCog, color: "bg-rose-500/10 text-rose-400 border border-rose-500/20" },
  ];

  return (
    <div className="w-full space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">
          Overview of content and activity across the ISTE-MHSSCE site.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 shadow-xl backdrop-blur-md hover:border-emerald-500/40 hover:bg-slate-900/70 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${c.color}`}>
                <c.icon size={20} />
              </div>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-white">{c.value}</p>
            <p className="text-sm font-semibold text-slate-200">{c.label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{c.sub}</p>
          </Link>
        ))}
      </div>

      <section className="bg-slate-900/50 border border-slate-800 rounded-xl shadow-xl backdrop-blur-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-bold text-white">Recent Activity</h2>
          <Link href="/admin/audit-logs" className="text-sm text-emerald-400 font-semibold hover:text-emerald-300">
            View all
          </Link>
        </div>
        {recentLogs.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-slate-500">No activity recorded yet.</div>
        ) : (
          <ul className="divide-y divide-slate-800/70">
            {recentLogs.map((log) => (
              <li key={log.id} className="px-6 py-3.5 flex items-center gap-3 hover:bg-slate-900/40 transition-colors">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-200">
                    <span className="font-semibold text-white">{log.actorName ?? "System"}</span>
                    <span className="mx-1.5 text-slate-500">{log.action}</span>
                    <span className="font-mono text-xs bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                      {log.entity ?? "—"}
                    </span>
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(log.createdAt).toLocaleString()}
                    {log.details ? ` · ${log.details.slice(0, 80)}` : ""}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}