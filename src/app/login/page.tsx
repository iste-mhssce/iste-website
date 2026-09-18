"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LoginForm, { type LoginUser } from "@/components/auth/LoginForm";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((body) => {
        if (body?.user) {
          router.replace(
            body.user.role === "ADMIN" || body.user.role === "SUPER_ADMIN"
              ? "/admin"
              : "/dashboard",
          );
        }
      })
      .catch(() => {})
      .finally(() => setChecked(true));
  }, [router]);

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">
        Loading…
      </div>
    );
  }

  const onSuccess = (u: LoginUser) => {
    router.replace(
      u.role === "ADMIN" || u.role === "SUPER_ADMIN" ? "/admin" : "/dashboard",
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#2563EB] mb-6 transition-colors"
        >
          <ArrowLeft size={15} />
          Back to home
        </Link>
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
          <LoginForm
            title="ISTE-MHSSCE Sign In"
            subtitle="Members and administrators"
            onSuccess={onSuccess}
          />
        </div>
        <div className="flex items-center justify-center gap-4 text-xs text-slate-500 mt-6">
          <span>Accounts are provisioned by an administrator.</span>
          <Link href="/register" className="text-[#2563EB] font-semibold hover:underline">
            Join the chapter
          </Link>
        </div>
      </div>
    </div>
  );
}