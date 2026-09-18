"use client";
import { useState } from "react";
import { Plus, Trash2, KeyRound, Power } from "lucide-react";
import { type ManagedUser, genPassword } from "@lib/dashboard-types";

export default function MembersTab({
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