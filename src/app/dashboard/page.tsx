"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  LogOut,
  Users,
  Inbox,
  UserCircle,
  Plus,
  Trash2,
  KeyRound,
  CheckCircle,
  XCircle,
  Flag,
  Clock,
  Timer,
  Power,
} from "lucide-react";
import LoginForm, { type LoginUser } from "@/components/auth/LoginForm";

type Role = "ADMIN" | "HEAD" | "MEMBER";
type IntakeStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "ACCEPTED"
  | "REJECTED"
  | "FLAGGED";

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  team: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

interface IntakeApplication {
  id: string;
  fullName: string;
  email: string;
  department: string;
  yearOfStudy: string;
  portfolioUrl: string | null;
  status: IntakeStatus;
  riskFlags: string[];
  createdAt: string;
}

const STATUS_STYLES: Record<IntakeStatus, string> = {
  PENDING: "bg-[#FEF9C3] text-[#92400E]",
  UNDER_REVIEW: "bg-[#DBEAFE] text-[#1D4ED8]",
  ACCEPTED: "bg-[#DCFCE7] text-[#16A34A]",
  REJECTED: "bg-[#FEE2E2] text-[#DC2626]",
  FLAGGED: "bg-[#FED7AA] text-[#C2410C]",
};

async function jsonOrThrow(res: Response) {
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(body?.message ?? `Request failed (${res.status})`);
  }
  return body;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<LoginUser | null>(null);
  const [checked, setChecked] = useState(false);
  const [tab, setTab] = useState<"members" | "intake" | "profile">("profile");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [members, setMembers] = useState<ManagedUser[] | null>(null);
  const [applications, setApplications] = useState<IntakeApplication[] | null>(
    null,
  );
  const [summary, setSummary] = useState<Record<string, number>>({});

  const loadData = useCallback(() => {
    if (user?.role === "HEAD" && tab === "members") {
      fetch("/api/admin/users")
        .then(async (r) => {
          setMembers((await jsonOrThrow(r)).users);
        })
        .catch((e) => setError(e.message));
    }
    if (user?.role === "HEAD" && tab === "intake" && !applications) {
      fetch("/api/admin/intake?limit=50")
        .then(async (r) => {
          const body = await jsonOrThrow(r);
          setApplications(body.applications);
          setSummary(body.summary ?? {});
        })
        .catch((e) => setError(e.message));
    }
  }, [user, tab, applications]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((body) => {
        if (body?.user) {
          if (body.user.role === "ADMIN") {
            router.replace("/admin");
            return;
          }
          setUser(body.user);
        }
      })
      .finally(() => setChecked(true));
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
    router.push("/");
  };

  if (!checked) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-sm text-[#64748B]">
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-8">
          <LoginForm
            title="ISTE Portal Sign In"
            subtitle="Heads and members sign in here"
            onSuccess={(u) => {
              if (u.role === "ADMIN") {
                router.replace("/admin");
                return;
              }
              setUser(u);
              setTab("profile");
            }}
          />
        </div>
      </div>
    );
  }

  const isHead = user.role === "HEAD";

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-[#0F172A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-[#06B6D4]" />
            <h1 className="font-bold tracking-tight">
              ISTE {isHead ? "Head" : "Member"} Portal
            </h1>
            <span
              className={`ml-2 hidden sm:inline-flex text-xs px-2 py-0.5 rounded-md ${
                isHead ? "bg-[#2563EB]/30 text-[#93C5FD]" : "bg-[#16A34A]/30 text-[#86EFAC]"
              }`}
            >
              {user.role}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:block text-sm text-white/60">{user.name}</span>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-[#FEE2E2] border border-[#FECACA] text-[#B91C1C] rounded-xl px-4 py-3 text-sm mb-6">
            {error}
          </div>
        )}
        {notice && (
          <div className="bg-[#DCFCE7] border border-[#BBF7D0] text-[#15803D] rounded-xl px-4 py-3 text-sm mb-6">
            {notice}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 mb-8">
          <button
            onClick={() => setTab("profile")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              tab === "profile"
                ? "bg-[#0F172A] text-white"
                : "bg-white border border-[#E2E8F0] text-[#475569] hover:border-[#2563EB] hover:text-[#2563EB]"
            }`}
          >
            <UserCircle size={15} />
            My Profile
          </button>
          {isHead && (
            <>
              <button
                onClick={() => {
                  setTab("members");
                  setError(null);
                  setNotice(null);
                }}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  tab === "members"
                    ? "bg-[#0F172A] text-white"
                    : "bg-white border border-[#E2E8F0] text-[#475569] hover:border-[#2563EB] hover:text-[#2563EB]"
                }`}
              >
                <Users size={15} />
                Manage Members
              </button>
              <button
                onClick={() => {
                  setTab("intake");
                  setError(null);
                  setNotice(null);
                }}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  tab === "intake"
                    ? "bg-[#0F172A] text-white"
                    : "bg-white border border-[#E2E8F0] text-[#475569] hover:border-[#2563EB] hover:text-[#2563EB]"
                }`}
              >
                <Inbox size={15} />
                Intake Review
              </button>
            </>
          )}
        </div>

        {tab === "profile" && <ProfileTab user={user} />}

        {tab === "members" && isHead && (
          <MembersTab
            members={members}
            refresh={() => {
              fetch("/api/admin/users")
                .then(async (r) => {
                  setMembers((await jsonOrThrow(r)).users);
                })
                .catch((e) => setError(e.message));
            }}
          />
        )}

        {tab === "intake" && isHead && (
          <IntakeTab
            applications={applications}
            summary={summary}
            refresh={() => {
              fetch("/api/admin/intake?limit=50")
                .then(async (r) => {
                  const body = await jsonOrThrow(r);
                  setApplications(body.applications);
                  setSummary(body.summary ?? {});
                })
                .catch((e) => setError(e.message));
            }}
          />
        )}
      </main>
    </div>
  );
}

function ProfileTab({ user }: { user: LoginUser }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const changePassword = async () => {
    setMessage(null);
    setError(null);
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? "Could not change password");
      }
      setMessage("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not change password");
    } finally {
      setBusy(false);
    }
  };

  const roleStyle =
    user.role === "HEAD"
      ? "bg-[#DBEAFE] text-[#1D4ED8]"
      : "bg-[#DCFCE7] text-[#16A34A]";

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <section className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-6">
        <h2 className="font-bold text-[#0F172A] mb-4">My Account</h2>
        <dl className="space-y-4 text-sm">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <dt className="text-[#64748B]">Name</dt>
            <dd className="font-semibold text-[#0F172A]">{user.name}</dd>
          </div>
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <dt className="text-[#64748B]">Email</dt>
            <dd className="font-semibold text-[#0F172A]">{user.email}</dd>
          </div>
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <dt className="text-[#64748B]">Role</dt>
            <dd>
              <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold ${roleStyle}`}>
                {user.role}
              </span>
            </dd>
          </div>
          <div className="flex items-center justify-between pb-1">
            <dt className="text-[#64748B]">Team</dt>
            <dd className="font-semibold text-[#0F172A]">{user.team || "General"}</dd>
          </div>
        </dl>
      </section>

      <section className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-6">
        <h2 className="font-bold text-[#0F172A] mb-4">Change Password</h2>
        <div className="space-y-3">
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current password"
            autoComplete="current-password"
            className="w-full px-3 py-2.5 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password"
            autoComplete="new-password"
            className="w-full px-3 py-2.5 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            autoComplete="new-password"
            className="w-full px-3 py-2.5 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          />
          {error && <p className="text-xs text-[#DC2626]">{error}</p>}
          {message && <p className="text-xs text-[#16A34A]">{message}</p>}
          <button
            onClick={changePassword}
            disabled={busy || !currentPassword || !newPassword}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            Update password
          </button>
        </div>
      </section>
    </div>
  );
}

function MembersTab({
  members,
  refresh,
}: {
  members: ManagedUser[] | null;
  refresh: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(genPassword());
  const [team, setTeam] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const create = async () => {
    setFormError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role: "MEMBER",
          team: team || undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? "Failed to create member");
      }
      setName("");
      setEmail("");
      setPassword(genPassword());
      setTeam("");
      refresh();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Failed to create member");
    }
  };

  const updateMember = async (
    id: string,
    patch: { isActive?: boolean; resetPassword?: string },
  ) => {
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? "Request failed");
      }
      refresh();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Request failed");
    } finally {
      setBusy(null);
    }
  };

  const deleteMember = async (id: string, name: string) => {
    if (!window.confirm(`Delete ${name}'s account? This cannot be undone.`)) return;
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? "Failed to delete member");
      }
      refresh();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Request failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E8F0]">
          <h2 className="font-bold text-[#0F172A]">Register a Member</h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Create member credentials — members sign in at /dashboard
          </p>
        </div>
        <div className="p-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="w-full px-3 py-2.5 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full px-3 py-2.5 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
            <div className="relative">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-3 py-2.5 pr-20 rounded-lg border border-[#E2E8F0] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
              <button
                onClick={() => setPassword(genPassword())}
                className="absolute right-1 top-1/2 -translate-y-1/2 text-xs text-[#2563EB] font-semibold px-2 py-1.5 hover:underline"
              >
                New
              </button>
            </div>
            <input
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              placeholder="Team (optional)"
              className="w-full px-3 py-2.5 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={create}
              disabled={!name || !email || !password}
              className="inline-flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
              <Plus size={15} />
              Register member
            </button>
            {formError && <p className="text-xs text-[#DC2626]">{formError}</p>}
          </div>
        </div>
      </section>

      <section className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E8F0]">
          <h2 className="font-bold text-[#0F172A]">Members</h2>
        </div>
        {!members ? (
          <div className="px-6 py-10 text-center text-sm text-[#64748B]">Loading…</div>
        ) : members.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-[#64748B]">
            No members registered yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-[#94A3B8] border-b border-[#E2E8F0]">
                  <th className="px-6 py-3">Member</th>
                  <th className="px-6 py-3">Team</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Last login</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {members.map((m) => (
                  <tr key={m.id} className={!m.isActive ? "opacity-60" : ""}>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-[#0F172A]">{m.name}</p>
                      <p className="text-xs text-[#64748B]">{m.email}</p>
                    </td>
                    <td className="px-6 py-4 text-[#475569]">{m.team || "—"}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => updateMember(m.id, { isActive: !m.isActive })}
                        disabled={busy === m.id}
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md transition-colors disabled:opacity-50 ${
                          m.isActive
                            ? "bg-[#DCFCE7] text-[#15803D]"
                            : "bg-[#FEE2E2] text-[#B91C1C]"
                        }`}
                      >
                        <Power size={11} />
                        {m.isActive ? "Active" : "Disabled"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-xs text-[#64748B]">
                      {m.lastLoginAt ? new Date(m.lastLoginAt).toLocaleString() : "Never"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const next = genPassword();
                            if (window.confirm(`Reset password to "${next}"?`)) {
                              updateMember(m.id, { resetPassword: next });
                            }
                          }}
                          disabled={busy === m.id}
                          className="inline-flex items-center gap-1 text-xs bg-[#0F172A] hover:bg-[#1E293B] text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <KeyRound size={12} /> Reset
                        </button>
                        <button
                          onClick={() => deleteMember(m.id, m.name)}
                          disabled={busy === m.id}
                          className="inline-flex items-center gap-1 text-xs bg-[#EF4444] hover:bg-[#DC2626] text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
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
    </div>
  );
}

function IntakeTab({
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

function genPassword() {
  const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
  return Array.from(
    { length: 12 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
}