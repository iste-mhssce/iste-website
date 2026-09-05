"use client";
import { useState } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";

export interface LoginUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "HEAD" | "MEMBER";
  team: string | null;
}

export default function LoginForm({
  onSuccess,
  title,
  subtitle,
}: {
  onSuccess: (user: LoginUser) => void;
  title: string;
  subtitle?: string;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setError(body?.message ?? "Login failed. Try again.");
        return;
      }
      onSuccess(body.user);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center">
          <ShieldCheck size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-[#0F172A]">{title}</h1>
          {subtitle && <p className="text-xs text-[#64748B]">{subtitle}</p>}
        </div>
      </div>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="Email address"
        autoComplete="username"
        className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] mb-3 bg-white"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="Password"
        autoComplete="current-password"
        className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] mb-3 bg-white"
      />
      {error && <p className="text-xs text-[#DC2626] mb-3">{error}</p>}
      <button
        onClick={submit}
        disabled={loading || !email || !password}
        className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white font-semibold text-sm py-3 rounded-xl transition-colors inline-flex items-center justify-center gap-2"
      >
        {loading && <Loader2 size={15} className="animate-spin" />}
        Sign in
      </button>
    </div>
  );
}