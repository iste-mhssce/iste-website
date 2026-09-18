"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { type LoginUser } from "@/components/auth/LoginForm";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<LoginUser | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((body) => {
        if (body?.user) {
          if (body.user.role === "ADMIN" || body.user.role === "SUPER_ADMIN") {
            setUser(body.user);
          } else {
            router.replace("/dashboard");
          }
        } else {
          router.replace("/login");
        }
      })
      .catch(() => router.replace("/login"))
      .finally(() => setChecked(true));
  }, [router]);

  if (!checked || !user) {
    return (
      <div className="w-full min-h-screen bg-slate-950 flex items-center justify-center text-sm text-slate-400">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex w-full min-h-screen bg-slate-950">
      <AdminSidebar
        user={{ name: user.name, role: user.role }}
        onLogout={() => setUser(null)}
      />
      <main className="flex-1 p-8 space-y-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}