"use client";
import { useState } from "react";
import type { LoginUser } from "@/components/auth/LoginForm";

export default function ProfileTab({ user }: { user: LoginUser }) {
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
    user.role === "MEMBER"
      ? "bg-[#DCFCE7] text-[#16A34A]"
      : "bg-[#DBEAFE] text-[#1D4ED8]";

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