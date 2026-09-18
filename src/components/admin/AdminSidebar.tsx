"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  CalendarDays,
  Award,
  Users,
  Link2,
  Bell,
  Inbox,
  UserCog,
  ScrollText,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";

const NAV_ITEMS: { href: string; label: string; icon: typeof LayoutDashboard }[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/posts", label: "Posts", icon: FileText },
  { href: "/admin/events", label: "Events", icon: CalendarDays },
  { href: "/admin/certificates", label: "Certificates", icon: Award },
  { href: "/admin/council", label: "Council Team", icon: Users },
  { href: "/admin/social-links", label: "Social Links", icon: Link2 },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/intake", label: "Intake", icon: Inbox },
  { href: "/admin/users", label: "Users & Access", icon: UserCog },
  { href: "/admin/audit-logs", label: "Audit Log", icon: ScrollText },
  { href: "/admin/settings", label: "Site Settings", icon: Settings },
];

export default function AdminSidebar({
  user,
  onLogout,
}: {
  user: { name: string; role: string };
  onLogout: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    onLogout();
    router.push("/");
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-2xl bg-[#2563EB] text-white px-4 py-3 shadow-lg shadow-blue-600/30"
      >
        <Menu size={18} /> Admin Menu
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
        <div className="px-5 pt-5 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <Image
              src="/iste-logo.png"
              alt="ISTE-MHSSCE logo"
              width={28}
              height={28}
              className="object-contain"
            />
            <p className="text-[11px] font-mono uppercase tracking-widest text-slate-500">
              ISTE-MHSSCE
            </p>
          </div>
          <h1 className="mt-1 text-lg font-bold text-white tracking-tight">
            Admin Panel
          </h1>
          <div className="mt-3 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[#2563EB]/20 text-[#93C5FD] flex items-center justify-center text-xs font-bold">
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
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`inline-flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? "bg-[#2563EB]/20 text-white"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon size={16} className={isActive(item.href) ? "text-[#60A5FA]" : ""} />
              {item.label}
            </Link>
          ))}
          {user.role === "SUPER_ADMIN" && (
            <>
              <div className="pt-3 mt-3 border-t border-white/10" />
              <Link
                href="/super-admin"
                onClick={() => setOpen(false)}
                className="inline-flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 hover:text-emerald-200"
              >
                <ShieldCheck size={16} className="text-emerald-400" />
                Super Admin Portal
              </Link>
            </>
          )}
        </nav>

        <div className="px-3 pb-5 border-t border-white/10 pt-3">
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