import { Clock, ArrowRight } from "lucide-react";

const articles = [
  {
    title: "Building Scalable APIs with Node.js and GraphQL",
    tag: "Backend",
    tagColor: "bg-[#DBEAFE] text-[#1D4ED8]",
    readTime: "5 min read",
    date: "Aug 28, 2026",
  },
  {
    title: "Getting Started with Transformer Architectures in NLP",
    tag: "AI/ML",
    tagColor: "bg-[#F3E8FF] text-[#7C3AED]",
    readTime: "8 min read",
    date: "Aug 22, 2026",
  },
  {
    title: "Securing Web Applications: OWASP Top 10 Deep Dive",
    tag: "CyberSec",
    tagColor: "bg-[#DCFCE7] text-[#16A34A]",
    readTime: "6 min read",
    date: "Aug 15, 2026",
  },
];

export default function TechBlog() {
  return (
    <section id="blog" className="bg-white py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2563EB] mb-3">
            From Our Community
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
            Tech Blog &amp; Publications
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((a) => (
            <div
              key={a.title}
              className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-6 flex flex-col gap-4 hover:shadow-lg transition-shadow"
            >
              <span
                className={`inline-flex items-center self-start text-xs font-bold px-3 py-1 rounded-md ${a.tagColor}`}
              >
                {a.tag}
              </span>
              <h3 className="text-lg font-bold text-[#0F172A] leading-snug">
                {a.title}
              </h3>
              <div className="flex items-center gap-4 text-xs text-[#94A3B8] mt-auto">
                <span>{a.date}</span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {a.readTime}
                </span>
              </div>
              <a
                href="#"
                className="inline-flex items-center gap-1.5 text-[#2563EB] text-sm font-semibold hover:underline"
              >
                Read Article <ArrowRight size={14} />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
