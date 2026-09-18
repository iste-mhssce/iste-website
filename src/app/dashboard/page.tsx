"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, LogOut, Users, Inbox, UserCircle } from "lucide-react";
import LoginForm, { type LoginUser } from "@/components/auth/LoginForm";
import ProfileTab from "@/components/dashboard/ProfileTab";
import MembersTab from "@/components/dashboard/MembersTab";
import IntakeTab from "@/components/dashboard/IntakeTab";
import {
  type ManagedUser,
  type IntakeApplication,
  jsonOrThrow,
} from "@lib/dashboard-types";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<LoginUser | null>(null);
  const [checked, setChecked] = useState(false);
  const [tab, setTab] = useState<"members" | "intake" | "profile">("profile");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [members, setMembers] = useState<ManagedUser[] | null>(null);
  const [applications, setApplications] = useState<IntakeApplication[] | null>(null);
  const [summary, setSummary] = useState<Record<string, number>>({});

  const loadData = useCallback(() => {
    const isStaff = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
    if (isStaff && tab === "members") {
      fetch("/api/admin/users")
        .then(async (r) => {
          setMembers((await jsonOrThrow(r)).users);
        })
        .catch((e) => setError(e.message));
    }
    if (isStaff && tab === "intake" && !applications) {
      fetch("/api/admin/intake?limit=50")
        .then(async (r) => {
          const body = await jsonOrThrow(r);
          setApplications(body.applications);
          setSummary(body.summary ?? {});
        })
        .catch((e) => setError(e.message));
    }
  }, [user, tab, applications]);

  const homeFor = (role: string) =>
    role === "SUPER_ADMIN" ? "/super-admin" : "/admin";

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((body) => {
        if (body?.user) {
          if (body.user.role === "ADMIN" || body.user.role === "SUPER_ADMIN") {
            router.replace(homeFor(body.user.role));
            return;
          }
          setUser(body.user);
        }
      })
      .finally(() => setChecked(true));
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
    router.push("/");
  };

  if (!checked) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-sm text-[#64748B]">
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-8">
          <LoginForm
            title="ISTE Portal Sign In"
            subtitle="Heads and members sign in here"
            onSuccess={(u) => {
              if (u.role === "ADMIN" || u.role === "SUPER_ADMIN") {
                router.replace(homeFor(u.role));
                return;
              }
              setUser(u);
              setTab("profile");
            }}
          />
        </div>
      </div>
    );
  }

  const isStaff = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-[#0F172A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-[#06B6D4]" />
            <h1 className="font-bold tracking-tight">
              ISTE Member Portal
            </h1>
            <span
              className={`ml-2 hidden sm:inline-flex text-xs px-2 py-0.5 rounded-md ${
                isStaff ? "bg-[#2563EB]/30 text-[#93C5FD]" : "bg-[#16A34A]/30 text-[#86EFAC]"
              }`}
            >
              {user.role}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:block text-sm text-white/60">{user.name}</span>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-[#FEE2E2] border border-[#FECACA] text-[#B91C1C] rounded-xl px-4 py-3 text-sm mb-6">
            {error}
          </div>
        )}
        {notice && (
          <div className="bg-[#DCFCE7] border border-[#BBF7D0] text-[#15803D] rounded-xl px-4 py-3 text-sm mb-6">
            {notice}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 mb-8">
          <button
            onClick={() => setTab("profile")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              tab === "profile"
                ? "bg-[#0F172A] text-white"
                : "bg-white border border-[#E2E8F0] text-[#475569] hover:border-[#2563EB] hover:text-[#2563EB]"
            }`}
          >
            <UserCircle size={15} />
            My Profile
          </button>
          {isStaff && (
            <>
              <button
                onClick={() => {
                  setTab("members");
                  setError(null);
                  setNotice(null);
                }}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  tab === "members"
                    ? "bg-[#0F172A] text-white"
                    : "bg-white border border-[#E2E8F0] text-[#475569] hover:border-[#2563EB] hover:text-[#2563EB]"
                }`}
              >
                <Users size={15} />
                Manage Members
              </button>
              <button
                onClick={() => {
                  setTab("intake");
                  setError(null);
                  setNotice(null);
                }}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  tab === "intake"
                    ? "bg-[#0F172A] text-white"
                    : "bg-white border border-[#E2E8F0] text-[#475569] hover:border-[#2563EB] hover:text-[#2563EB]"
                }`}
              >
                <Inbox size={15} />
                Intake Review
              </button>
            </>
          )}
        </div>

        {tab === "profile" && <ProfileTab user={user} />}

        {tab === "members" && isStaff && (
          <MembersTab
            members={members}
            refresh={() => {
              fetch("/api/admin/users")
                .then(async (r) => {
                  setMembers((await jsonOrThrow(r)).users);
                })
                .catch((e) => setError(e.message));
            }}
          />
        )}

        {tab === "intake" && isStaff && (
          <IntakeTab
            applications={applications}
            summary={summary}
            refresh={() => {
              fetch("/api/admin/intake?limit=50")
                .then(async (r) => {
                  const body = await jsonOrThrow(r);
                  setApplications(body.applications);
                  setSummary(body.summary ?? {});
                })
                .catch((e) => setError(e.message));
            }}
          />
        )}
      </main>
    </div>
  );
}