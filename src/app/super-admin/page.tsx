"use client";
import { useCallback, useEffect, useState } from "react";
import { ShieldCheck, UserCog, Users, Power } from "lucide-react";
import UsersTab from "@/components/admin/UsersTab";
import {
  jsonOrThrow,
  type ManagedUser,
  type Role,
} from "@lib/dashboard-types";

export default function SuperAdminPortal() {
  const [users, setUsers] = useState<ManagedUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setError(null);
    fetch("/api/admin/users")
      .then(async (r) => {
        const body = await jsonOrThrow(r);
        setUsers(body.users);
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/users")
      .then(async (r) => {
        const body = await jsonOrThrow(r);
        if (!cancelled) setUsers(body.users);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const count = (r: Role) => users?.filter((u) => u.role === r).length ?? 0;
  const disabled = users?.filter((u) => !u.isActive).length ?? 0;

  const stats: {
    label: string;
    value: number;
    color: string;
    icon: typeof ShieldCheck;
  }[] = [
    {
      label: "Super Admins",
      value: count("SUPER_ADMIN"),
      color: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
      icon: ShieldCheck,
    },
    {
      label: "Admins",
      value: count("ADMIN"),
      color: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
      icon: UserCog,
    },
    {
      label: "Members",
      value: count("MEMBER"),
      color: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
      icon: Users,
    },
    {
      label: "Disabled Accounts",
      value: disabled,
      color: "bg-slate-500/10 text-slate-300 border border-slate-500/20",
      icon: Power,
    },
  ];

  return (
    <div className="w-full space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Access Control</h1>
        <p className="text-sm text-slate-400 mt-1">
          Super admin control room. Provision admins, manage privileges, and
          oversee every account in the ISTE-MHSSCE portal.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 shadow-xl backdrop-blur-md"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon size={20} />
            </div>
            <p className="mt-4 text-3xl font-extrabold text-white">{s.value}</p>
            <p className="text-sm font-semibold text-slate-200">{s.label}</p>
          </div>
        ))}
      </div>

      <UsersTab users={users} refresh={refresh} isSuperAdmin />
    </div>
  );
}