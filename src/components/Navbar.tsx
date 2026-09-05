"use client";
import { useEffect, useState } from "react";
import { Menu, X, LogIn, LayoutDashboard } from "lucide-react";

const navLinks = [
  { label: "About Us", href: "#about" },
  { label: "Events Hub", href: "#events" },
  { label: "Certificates", href: "#certificates" },
  { label: "Council & Team", href: "#council" },
  { label: "Publications", href: "#blog" },
];

interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "HEAD" | "MEMBER";
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

  const portalHref = session?.role === "ADMIN" ? "/admin" : "/dashboard";

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-[#E2E8F0] h-[70px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        <a href="#" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#2563EB] flex items-center justify-center text-white font-bold text-sm">
            ISTE
          </div>
          <span className="text-[#0F172A] font-bold text-lg tracking-tight hidden sm:block">
            ISTE MHSSCOE
          </span>
        </a>

        <div className="hidden lg:flex items-center gap-7">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[#334155] text-sm font-medium hover:text-[#2563EB] transition-colors"
            >
              {link.label}
            </a>
          ))}
          {session ? (
            <a
              href={portalHref}
              className="inline-flex items-center gap-2 text-[#2563EB] text-sm font-semibold px-4 py-2.5 rounded-lg border border-[#2563EB]/30 hover:bg-[#2563EB]/5 transition-colors"
            >
              <LayoutDashboard size={15} />
              {session.name.split(" ")[0]}
            </a>
          ) : (
            <a
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
            >
              <LogIn size={15} />
              Sign In
            </a>
          )}
          <a
            href="#intake"
            className="bg-[#0F172A] hover:bg-[#1E293B] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            Join Chapter
          </a>
        </div>

        <button
          className="lg:hidden p-2 text-[#0F172A]"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-[#E2E8F0] px-4 pb-4 pt-2">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block py-2.5 text-[#334155] text-sm font-medium hover:text-[#2563EB] transition-colors"
            >
              {link.label}
            </a>
          ))}
          <a
            href={session ? portalHref : "/dashboard"}
            onClick={() => setMobileOpen(false)}
            className="block text-center mt-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            {session ? "My Dashboard" : "Sign In"}
          </a>
          <a
            href="#intake"
            onClick={() => setMobileOpen(false)}
            className="mt-2 block text-center bg-[#0F172A] hover:bg-[#1E293B] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            Join Chapter
          </a>
        </div>
      )}
    </nav>
  );
}