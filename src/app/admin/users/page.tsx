"use client";
import { useCallback, useEffect, useState } from "react";
import UsersTab from "@/components/admin/UsersTab";
import { jsonOrThrow, type ManagedUser } from "@lib/dashboard-types";

export default function UsersPage() {
  const [users, setUsers] = useState<ManagedUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

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
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((body) => {
        if (!cancelled && body?.user) {
          setIsSuperAdmin(body.user.role === "SUPER_ADMIN");
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="w-full space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Users &amp; Access</h1>
        <p className="text-sm text-slate-400 mt-1">
          Create and manage member and administrator accounts. Super admins can
          provision admins; admins can provision members.
        </p>
      </div>
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}
      <UsersTab users={users} refresh={refresh} isSuperAdmin={isSuperAdmin} />
    </div>
  );
}