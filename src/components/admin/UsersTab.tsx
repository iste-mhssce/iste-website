"use client";
import { useState } from "react";
import {
  Plus,
  Trash2,
  KeyRound,
  Eye,
  EyeOff,
  Power,
  Copy,
  Check,
  RefreshCw,
  Lock,
} from "lucide-react";
import {
  type Role,
  type ManagedUser,
  ROLE_STYLES,
  genPassword,
} from "@lib/dashboard-types";

export default function UsersTab({
  users,
  refresh,
  isSuperAdmin = false,
}: {
  users: ManagedUser[] | null;
  refresh: () => void;
  isSuperAdmin?: boolean;
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

  const inputCls =
  "w-full px-3 py-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-colors";

  const labelCls = "text-xs font-medium text-slate-400 block mb-1.5";

  const count = (r: Role) => users?.filter((u) => u.role === r).length ?? 0;

  return (
    <div className="space-y-8">
      <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">Create Credentials</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isSuperAdmin
                ? "Provision member, admin, and super admin credentials"
                : "Generate member accounts"}
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Secure Generator
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className={labelCls}>Full Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Priya Sharma"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@student.mhsscoe.ac.in"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Role</label>
            {isSuperAdmin ? (
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className={`${inputCls} appearance-none cursor-pointer`}
              >
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            ) : (
              <input
                value="Member"
                readOnly
                className={`${inputCls} opacity-70 cursor-not-allowed`}
              />
            )}
          </div>
          <div>
            <label className={labelCls}>Team (optional)</label>
            <input
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              placeholder="e.g. Tech Team"
              className={inputCls}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px] max-w-sm">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              className="w-full px-3 py-2.5 pr-[104px] rounded-lg bg-slate-950/60 border border-slate-800 text-sm font-mono text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-colors"
            />
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-white/5 transition-colors"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              <button
                onClick={copyPassword}
                className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-white/5 transition-colors"
                aria-label="Copy password"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>
          <button
            onClick={() => setPassword(genPassword())}
            className="inline-flex items-center gap-1.5 text-xs text-slate-300 font-semibold bg-slate-800 hover:bg-slate-700 hover:text-white px-3 py-2.5 rounded-lg transition-colors"
          >
            <RefreshCw size={12} /> Regenerate
          </button>
          <button
            onClick={create}
            disabled={!name || !email || !password}
            className="ml-auto inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={15} />
            Create account
          </button>
        </div>
        {formError && <p className="text-xs text-red-400 mt-3">{formError}</p>}
        {copied && (
          <p className="text-xs text-emerald-400 mt-3">
            Password copied to clipboard.
          </p>
        )}
      </section>

      <section className="bg-slate-900/50 border border-slate-800 rounded-xl shadow-xl backdrop-blur-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-white">All Accounts</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {users ? `${users.length} total account${users.length === 1 ? "" : "s"}` : "…"} ·{" "}
              {count("ADMIN")} admin · {count("SUPER_ADMIN")} super admin ·{" "}
              {count("MEMBER")} member
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-medium">
            <span className="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Admins ({count("ADMIN")})
            </span>
            <span className="inline-flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              Super Admins ({count("SUPER_ADMIN")})
            </span>
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Members ({count("MEMBER")})
            </span>
          </div>
        </div>
        {!users ? (
          <div className="px-6 py-12 text-center text-sm text-slate-400">
            Loading accounts…
          </div>
        ) : users.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-slate-400">
            No accounts yet. Create the first one above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-slate-500 border-b border-slate-800">
                  <th className="px-6 py-3 font-semibold">User</th>
                  <th className="px-6 py-3 font-semibold">Role</th>
                  <th className="px-6 py-3 font-semibold">Team</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">Last login</th>
                  <th className="px-6 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className={`${
                      !u.isActive ? "opacity-60" : ""
                    } hover:bg-slate-900/40 transition-colors`}
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-white">{u.name}</p>
                      <p className="text-xs text-slate-400">{u.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold ${ROLE_STYLES[u.role]}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {u.team || "—"}
                    </td>
                    <td className="px-6 py-4">
                      {isSuperAdmin || u.role === "MEMBER" ? (
                        <button
                          onClick={() =>
                            updateUser(u.id, { isActive: !u.isActive }, "update user")
                          }
                          disabled={busy === u.id}
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md transition-colors disabled:opacity-50 ${
                            u.isActive
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                              : "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700"
                          }`}
                          title={
                            u.isActive ? "Click to disable account" : "Click to activate account"
                          }
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.isActive ? "bg-emerald-400" : "bg-slate-500"
                            }`}
                          />
                          <Power size={11} />
                          {u.isActive ? "Active" : "Disabled"}
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-800/50 text-slate-500 border border-slate-800">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.isActive ? "bg-emerald-400" : "bg-slate-500"
                            }`}
                          />
                          {u.isActive ? "Active" : "Disabled"}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {u.lastLoginAt
                        ? new Date(u.lastLoginAt).toLocaleString()
                        : "Never"}
                    </td>
                    <td className="px-6 py-4">
                      {isSuperAdmin || u.role === "MEMBER" ? (
                        <div className="flex items-center gap-2 flex-wrap">
                          {isSuperAdmin && (
                            <select
                              value={u.role}
                              onChange={(e) =>
                                updateUser(u.id, { role: e.target.value }, "change role")
                              }
                              disabled={busy === u.id}
                              className="text-xs px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:opacity-50 cursor-pointer"
                            >
                              <option value="MEMBER" className="bg-slate-950 text-slate-200">
                                Member
                              </option>
                              <option value="ADMIN" className="bg-slate-950 text-slate-200">
                                Admin
                              </option>
                              <option
                                value="SUPER_ADMIN"
                                disabled={u.role !== "SUPER_ADMIN"}
                                className="bg-slate-950 text-slate-200"
                              >
                                Super Admin
                              </option>
                            </select>
                          )}
                          <button
                            onClick={() => resetPassword(u.id)}
                            disabled={busy === u.id}
                            className="inline-flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded transition-colors disabled:opacity-50"
                            title="Reset password"
                          >
                            <KeyRound size={12} /> Reset
                          </button>
                          <button
                            onClick={() => deleteUser(u.id, u.name)}
                            disabled={busy === u.id}
                            className="inline-flex items-center gap-1.5 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1.5 rounded transition-colors disabled:opacity-50"
                            title="Delete account"
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                          <Lock size={12} />
                          Super admin only
                        </span>
                      )}
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