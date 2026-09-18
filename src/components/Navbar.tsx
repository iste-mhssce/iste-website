"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, LogIn, LayoutDashboard } from "lucide-react";

const navLinks = [
  { label: "About Us", href: "#about" },
  { label: "Events Hub", href: "#events" },
  { label: "Certificates", href: "#certificates" },
  { label: "Council & Team", href: "#council" },
  { label: "Blog & Updates", href: "#blog" },
];

interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "MEMBER";
  team: string | null;
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [session, setSession] = useState<SessionUser | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((body) => {
        if (body?.user) setSession(body.user);
      })
      .catch(() => {});
  }, []);

  const portalHref =
  session?.role === "ADMIN" || session?.role === "SUPER_ADMIN" ? "/admin" : "/dashboard";

  return (
    <nav className="glass sticky top-0 z-50 h-[70px] border-b border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/iste-logo.png"
            alt="ISTE-MHSSCE logo"
            width={40}
            height={40}
            className="object-contain"
            priority
          />
          <span className="text-slate-900 font-bold text-lg tracking-tight hidden sm:block">
            ISTE-MHSSCE
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-7">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-slate-500 text-sm font-medium hover:text-[#2563EB] transition-colors"
            >
              {link.label}
            </a>
          ))}
          {session ? (
            <a
              href={portalHref}
              className="inline-flex items-center gap-2 text-[#2563EB] text-sm font-semibold px-4 py-2.5 rounded-lg border border-[#2563EB]/30 bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <LayoutDashboard size={15} />
              {session.name.split(" ")[0]}
            </a>
          ) : (
            <a
              href="/login"
              className="bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] inline-flex items-center gap-2 text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-md shadow-blue-600/30 transition-opacity hover:opacity-90"
            >
              <LogIn size={15} />
              Sign In
            </a>
          )}
          <a
            href="#intake"
            className="bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            Join Chapter
          </a>
        </div>

        <button
          className="lg:hidden p-2 text-slate-900"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="glass lg:hidden border-t border-slate-200/70 px-4 pb-4 pt-2">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block py-2.5 text-slate-600 text-sm font-medium hover:text-[#2563EB] transition-colors"
            >
              {link.label}
            </a>
          ))}
          <a
            href={session ? portalHref : "/login"}
            onClick={() => setMobileOpen(false)}
            className="bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] block text-center mt-2 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-opacity hover:opacity-90"
          >
            {session ? "My Dashboard" : "Sign In"}
          </a>
          <a
            href="#intake"
            onClick={() => setMobileOpen(false)}
            className="mt-2 block text-center bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            Join Chapter
          </a>
        </div>
      )}
    </nav>
  );
}