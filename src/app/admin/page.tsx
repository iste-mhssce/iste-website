"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  LogOut,
  RefreshCw,
  CheckCircle,
  XCircle,
  Flag,
  Clock,
  Sparkles,
  Users,
  Inbox,
  FileBadge,
  Plus,
  Trash2,
  KeyRound,
  Eye,
  EyeOff,
  Power,
  Copy,
  Check,
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

interface Certificate {
  id: string;
  certificateId: string;
  studentName: string;
  eventName: string;
  issueDate: string;
  riskScore: number;
}

const ROLE_STYLES: Record<Role, string> = {
  ADMIN: "bg-[#FEE2E2] text-[#B91C1C]",
  HEAD: "bg-[#DBEAFE] text-[#1D4ED8]",
  MEMBER: "bg-[#DCFCE7] text-[#16A34A]",
};

const STATUS_STYLES: Record<IntakeStatus, string> = {
  PENDING: "bg-[#FEF9C3] text-[#92400E]",
  UNDER_REVIEW: "bg-[#DBEAFE] text-[#1D4ED8]",
  ACCEPTED: "bg-[#DCFCE7] text-[#16A34A]",
  REJECTED: "bg-[#FEE2E2] text-[#DC2626]",
  FLAGGED: "bg-[#FED7AA] text-[#C2410C]",
};

const genPassword = () => {
  const chars =
    "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
  return Array.from(
    { length: 12 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
};

async function jsonOrThrow(res: Response) {
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(body?.message ?? `Request failed (${res.status})`);
  }
  return body;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<LoginUser | null>(null);
  const [checked, setChecked] = useState(false);
  const [tab, setTab] = useState<"users" | "intake" | "certificates">("users");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // ---- Users state ----
  const [users, setUsers] = useState<ManagedUser[] | null>(null);
  // ---- Intake state ----
  const [applications, setApplications] = useState<IntakeApplication[] | null>(
    null,
  );
  const [summary, setSummary] = useState<Record<string, number>>({});
  // ---- Certificates state ----
  const [certificates, setCertificates] = useState<Certificate[] | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((body) => {
        if (body?.user) {
          if (body.user.role !== "ADMIN") {
            router.replace("/dashboard");
            return;
          }
          setUser(body.user);
        }
      })
      .finally(() => setChecked(true));
  }, [router]);

  useEffect(() => {
    if (tab === "users" && user) {
      fetch("/api/admin/users")
        .then(async (r) => {
          const body = await jsonOrThrow(r);
          setUsers(body.users);
        })
        .catch((e) => setError(e.message));
    }
    if (tab === "intake" && user && !applications) {
      fetch("/api/admin/intake?limit=50")
        .then(async (r) => {
          const body = await jsonOrThrow(r);
          setApplications(body.applications);
          setSummary(body.summary ?? {});
        })
        .catch((e) => setError(e.message));
    }
    if (tab === "certificates" && user && !certificates) {
      fetch("/api/admin/certificates?highRisk=true&limit=50")
        .then(async (r) => {
          const body = await jsonOrThrow(r);
          setCertificates(body.certificates);
        })
        .catch((e) => setError(e.message));
    }
  }, [tab, user, applications, certificates]);

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
            title="Admin Sign In"
            subtitle="Administrator credentials only"
            onSuccess={(u) => {
              if (u.role !== "ADMIN") {
                router.replace("/dashboard");
                return;
              }
              setUser(u);
            }}
          />
        </div>
      </div>
    );
  }

  const flaggedCount = summary?.FLAGGED ?? 0;
  const pendingCount = summary?.PENDING ?? 0;
  const acceptedCount = summary?.ACCEPTED ?? 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-[#0F172A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-[#06B6D4]" />
            <h1 className="font-bold tracking-tight">ISTE Nexus Admin</h1>
            <span className="ml-2 hidden sm:inline-flex text-xs bg-[#DC2626]/20 text-[#FCA5A5] px-2 py-0.5 rounded-md">
              {user.role}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:block text-sm text-white/60">
              {user.name}
            </span>
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
          {[
            { id: "users", label: "Users & Access", icon: Users },
            { id: "intake", label: "Intake Applications", icon: Inbox },
            { id: "certificates", label: "Certificates", icon: FileBadge },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id as typeof tab);
                setError(null);
                setNotice(null);
              }}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                tab === t.id
                  ? "bg-[#0F172A] text-white"
                  : "bg-white border border-[#E2E8F0] text-[#475569] hover:border-[#2563EB] hover:text-[#2563EB]"
              }`}
            >
              <t.icon size={15} />
              {t.label}
            </button>
          ))}
        </div>

        {tab === "users" && (
          <UsersTab
            users={users}
            refresh={() => {
              fetch("/api/admin/users")
                .then(async (r) => {
                  const body = await jsonOrThrow(r);
                  setUsers(body.users);
                })
                .catch((e) => setError(e.message));
            }}
          />
        )}

        {tab === "intake" && (
          <IntakeTab
            applications={applications}
            summary={{ flaggedCount, pendingCount, acceptedCount }}
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

        {tab === "certificates" && (
          <CertificatesTab
            certificates={certificates}
            refresh={() => {
              fetch("/api/admin/certificates?highRisk=true&limit=50")
                .then(async (r) => {
                  const body = await jsonOrThrow(r);
                  setCertificates(body.certificates);
                })
                .catch((e) => setError(e.message));
            }}
          />
        )}
      </main>
    </div>
  );
}

function UsersTab({
  users,
  refresh,
}: {
  users: ManagedUser[] | null;
  refresh: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(genPassword());
  const [role, setRole] = useState<Role>("MEMBER");
  const [team, setTeam] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const create = async () => {
    setFormError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, team: team || undefined }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? "Failed to create user");
      }
      setName("");
      setEmail("");
      setPassword(genPassword());
      setTeam("");
      setCopied(false);
      refresh();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Failed to create user");
    }
  };

  const updateUser = async (id: string, patch: Record<string, unknown>, label: string) => {
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? `Failed to ${label}`);
      }
      refresh();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Request failed");
    } finally {
      setBusy(null);
    }
  };

  const resetPassword = (id: string) => {
    const next = genPassword();
    if (!window.confirm(`Reset password to "${next}"?`)) return;
    updateUser(id, { resetPassword: next }, "reset password");
  };

  const deleteUser = async (id: string, name: string) => {
    if (!window.confirm(`Delete ${name}'s account? This cannot be undone.`)) return;
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? "Failed to delete user");
      }
      refresh();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Request failed");
    } finally {
      setBusy(null);
    }
  };

  const count = (r: Role) => users?.filter((u) => u.role === r).length ?? 0;

  return (
    <div className="space-y-6">
      <section className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <h2 className="font-bold text-[#0F172A]">Create Credentials</h2>
          <span className="text-xs text-[#64748B]">
            Generate accounts for heads and members
          </span>
        </div>
        <div className="p-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="text-xs font-semibold text-[#64748B] block mb-1.5">
                Full name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="w-full px-3 py-2.5 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#64748B] block mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@student.mhsscoe.ac.in"
                className="w-full px-3 py-2.5 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#64748B] block mb-1.5">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full px-3 py-2.5 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] bg-white"
              >
                <option value="MEMBER">Member</option>
                <option value="HEAD">Head</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#64748B] block mb-1.5">
                Team (optional)
              </label>
              <input
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                placeholder="e.g. Tech Team"
                className="w-full px-3 py-2.5 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                className="w-56 px-3 py-2.5 pr-20 rounded-lg border border-[#E2E8F0] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 text-[#64748B] hover:text-[#2563EB]"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button
                  onClick={copyPassword}
                  className="p-1.5 text-[#64748B] hover:text-[#2563EB]"
                  aria-label="Copy password"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>
            <button
              onClick={() => setPassword(genPassword())}
              className="text-xs text-[#2563EB] font-semibold hover:underline"
            >
              Regenerate
            </button>
            <button
              onClick={create}
              disabled={!name || !email || !password}
              className="ml-auto inline-flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
              <Plus size={15} />
              Create account
            </button>
          </div>
          {formError && <p className="text-xs text-[#DC2626] mt-3">{formError}</p>}
          {copied && (
            <p className="text-xs text-[#16A34A] mt-3">Password copied to clipboard.</p>
          )}
        </div>
      </section>

      <section className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <h2 className="font-bold text-[#0F172A]">All Accounts</h2>
          <div className="flex gap-3 text-xs text-[#64748B] font-medium">
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#DC2626]" /> Admins {count("ADMIN")}
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#2563EB]" /> Heads {count("HEAD")}
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#16A34A]" /> Members {count("MEMBER")}
            </span>
          </div>
        </div>
        {!users ? (
          <div className="px-6 py-10 text-center text-sm text-[#64748B]">Loading…</div>
        ) : users.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-[#64748B]">
            No accounts yet. Create the first one above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-[#94A3B8] border-b border-[#E2E8F0]">
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Team</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Last login</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {users.map((u) => (
                  <tr key={u.id} className={!u.isActive ? "opacity-60" : ""}>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-[#0F172A]">{u.name}</p>
                      <p className="text-xs text-[#64748B]">{u.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold ${ROLE_STYLES[u.role]}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#475569]">{u.team || "—"}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() =>
                          updateUser(u.id, { isActive: !u.isActive }, "update user")
                        }
                        disabled={busy === u.id}
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md transition-colors disabled:opacity-50 ${
                          u.isActive
                            ? "bg-[#DCFCE7] text-[#15803D]"
                            : "bg-[#FEE2E2] text-[#B91C1C]"
                        }`}
                      >
                        <Power size={11} />
                        {u.isActive ? "Active" : "Disabled"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-xs text-[#64748B]">
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "Never"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <select
                          value={u.role}
                          onChange={(e) =>
                            updateUser(u.id, { role: e.target.value }, "change role")
                          }
                          disabled={busy === u.id}
                          className="text-xs px-2 py-1.5 rounded-md border border-[#E2E8F0] bg-white focus:outline-none"
                        >
                          <option value="MEMBER">Member</option>
                          <option value="HEAD">Head</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                        <button
                          onClick={() => resetPassword(u.id)}
                          disabled={busy === u.id}
                          className="inline-flex items-center gap-1 text-xs bg-[#0F172A] hover:bg-[#1E293B] text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                          title="Reset password"
                        >
                          <KeyRound size={12} /> Reset
                        </button>
                        <button
                          onClick={() => deleteUser(u.id, u.name)}
                          disabled={busy === u.id}
                          className="inline-flex items-center gap-1 text-xs bg-[#EF4444] hover:bg-[#DC2626] text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete account"
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
  summary: { flaggedCount: number; pendingCount: number; acceptedCount: number };
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
          { label: "Flagged", value: summary.flaggedCount, icon: Flag, color: "text-[#C2410C] bg-[#FED7AA]" },
          { label: "Pending Review", value: summary.pendingCount, icon: Clock, color: "text-[#92400E] bg-[#FEF9C3]" },
          { label: "Accepted", value: summary.acceptedCount, icon: CheckCircle, color: "text-[#16A34A] bg-[#DCFCE7]" },
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
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <h2 className="font-bold text-[#0F172A]">Intake Applications</h2>
          <button
            onClick={refresh}
            className="inline-flex items-center gap-1.5 text-sm text-[#2563EB] font-semibold"
          >
            <RefreshCw size={14} /> Refresh
          </button>
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
                  <th className="px-6 py-3">Flags</th>
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
                      {a.riskFlags.length ? (
                        <div className="flex flex-col gap-1">
                          {a.riskFlags.map((f) => (
                            <span key={f} className="text-xs text-[#C2410C]">{f}</span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-[#94A3B8]">—</span>
                      )}
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
                        {a.status === "FLAGGED" && (
                          <button
                            onClick={() => setStatus(a.id, "UNDER_REVIEW")}
                            disabled={busy === a.id}
                            className="inline-flex items-center gap-1 text-xs bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                          >
                            Review
                          </button>
                        )}
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

function CertificatesTab({
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
      <section className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <div>
            <h2 className="font-bold text-[#0F172A]">High-Risk Certificates</h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Certificates with riskScore &gt;= 0.4 (waiting on manual verification)
            </p>
          </div>
          <button
            onClick={reindexEmbeddings}
            disabled={busy === "reindex"}
            className="inline-flex items-center gap-2 text-sm bg-white border border-[#E2E8F0] hover:border-[#2563EB] text-[#475569] hover:text-[#2563EB] px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <Sparkles size={14} />
            Reindex Embeddings
          </button>
        </div>
        {!certificates ? (
          <div className="px-6 py-10 text-center text-sm text-[#64748B]">Loading…</div>
        ) : certificates.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-[#64748B]">
            No high-risk certificates currently flagged.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-[#94A3B8] border-b border-[#E2E8F0]">
                  <th className="px-6 py-3">Certificate ID</th>
                  <th className="px-6 py-3">Recipient</th>
                  <th className="px-6 py-3">Event</th>
                  <th className="px-6 py-3">Risk</th>
                  <th className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {certificates.map((c) => (
                  <tr key={c.id}>
                    <td className="px-6 py-4 font-mono text-xs text-[#0F172A]">
                      {c.certificateId}
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#0F172A]">
                      {c.studentName}
                    </td>
                    <td className="px-6 py-4 text-[#475569]">{c.eventName}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-semibold bg-[#FED7AA] text-[#C2410C]">
                        {(c.riskScore * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => recomputeRisk(c.certificateId)}
                        disabled={busy === c.certificateId}
                        className="inline-flex items-center gap-1 text-xs bg-[#0F172A] hover:bg-[#1E293B] text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
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