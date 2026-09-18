"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ShieldCheck,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Crown,
} from "lucide-react";

export default function SuperAdminSidebar({
  user,
  onLogout,
}: {
  user: { name: string; role: string };
  onLogout: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    onLogout();
    router.push("/");
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-2xl bg-emerald-600 text-white px-4 py-3 shadow-lg shadow-emerald-600/30"
      >
        <Menu size={18} /> Super Admin
      </button>

      {open && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-slate-950/60"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 flex-shrink-0 bg-slate-900 text-slate-300 flex flex-col transition-transform lg:transition-none lg:translate-x-0 border-r border-slate-800 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-5 pt-5 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <Image
              src="/iste-logo.png"
              alt="ISTE-MHSSCE logo"
              width={28}
              height={28}
              className="object-contain"
            />
            <p className="text-[11px] font-mono uppercase tracking-widest text-emerald-400">
              ISTE-MHSSCE
            </p>
          </div>
          <h1 className="mt-1 text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Crown size={16} className="text-emerald-400" />
            Super Admin
          </h1>
          <div className="mt-3 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xs font-bold">
              {user.name.slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <p className="text-[11px] text-slate-400">{user.role}</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="ml-auto lg:hidden text-slate-400 hover:text-white"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <Link
            href="/super-admin"
            onClick={() => setOpen(false)}
            className={`inline-flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              pathname === "/super-admin"
                ? "bg-emerald-500/20 text-white"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <ShieldCheck
              size={16}
              className={pathname === "/super-admin" ? "text-emerald-400" : ""}
            />
            Access Control
          </Link>

          <div className="pt-3 mt-3 border-t border-slate-800">
            <p className="px-3 pb-2 text-[11px] font-mono uppercase tracking-widest text-slate-500">
              Shared Portal
            </p>
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className={`inline-flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                pathname.startsWith("/admin")
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <LayoutDashboard size={16} className="" />
              Admin Portal
            </Link>
          </div>
        </nav>

        <div className="px-3 pb-5 border-t border-slate-800 pt-3">
          <button
            onClick={logout}
            className="inline-flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}