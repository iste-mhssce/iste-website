import { Clock } from "lucide-react";
import { prisma } from "@lib/db";

const TAG_STYLES: Record<string, string> = {
  Backend: "bg-[#DBEAFE] text-[#1D4ED8]",
  "AI/ML": "bg-[#F3E8FF] text-[#7C3AED]",
  CyberSec: "bg-[#DCFCE7] text-[#16A34A]",
};

export default async function TechBlog() {
  let articles: { title: string; author: string | null; category: string; publishedAt: Date | null }[] = [];

  try {
    articles = await prisma.post.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      take: 6,
    });
  } catch {
    articles = [];
  }

  if (articles.length === 0) {
    return null;
  }

  return (
    <section id="blog" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#3B82F6] mb-3">
            From Our Community
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Tech Blog &amp; <span className="text-gradient">Updates</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((a) => (
            <div
              key={a.title}
              className="rounded-2xl p-6 flex flex-col gap-4 bg-white shadow-sm ring-1 ring-slate-200 hover:shadow-md transition-shadow"
            >
              <span
                className={`inline-flex items-center self-start text-xs font-bold px-3 py-1 rounded-md ${TAG_STYLES[a.category] ?? TAG_STYLES["Backend"]}`}
              >
                {a.category}
              </span>
              <h3 className="text-lg font-bold text-slate-900 leading-snug">
                {a.title}
              </h3>
              <p className="text-sm text-slate-500">by {a.author ?? "ISTE-MHSSCE"}</p>
              <div className="flex items-center gap-4 text-xs text-slate-500 mt-auto">
                <span>{a.publishedAt ? new Date(a.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Pending"}</span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  read
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}