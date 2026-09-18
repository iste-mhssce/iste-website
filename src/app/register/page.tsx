import Link from "next/link";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata = {
  title: "Join | ISTE-MHSSCE",
  description:
    "Submit your application to join the ISTE-MHSSCE student chapter.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#2563EB] mb-6 transition-colors"
        >
          {"< Back to home"}
        </Link>
        <RegisterForm />
      </div>
    </div>
  );
}