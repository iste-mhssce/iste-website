import { ArrowRight, FileText } from "lucide-react";

const perks = [
  "Priority Access to Events",
  "Official ISTE Membership",
  "1-on-1 Mentorship Programs",
  "Leadership Opportunities",
];

export default function IntakeBanner() {
  return (
    <section id="intake" className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] to-[#1E3A8A]" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMS41Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/80 text-xs font-bold px-4 py-2 rounded-full mb-6 uppercase tracking-widest">
            Recruitment Open
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
            Join the ISTE Committee Intake Drive
          </h2>
          <p className="text-lg text-white/70 mb-10 max-w-xl mx-auto">
            Be part of India&apos;s largest technical student community. Gain
            exclusive perks and shape the future of engineering at MHSSCOE.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
            {perks.map((perk) => (
              <div
                key={perk}
                className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-4 text-white text-sm font-semibold text-center"
              >
                {perk}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="#"
              className="inline-flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold px-7 py-3.5 rounded-xl text-sm transition-colors"
            >
              Fill Application Form
              <FileText size={15} />
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-2 border-2 border-[#06B6D4] text-[#06B6D4] hover:bg-[#06B6D4] hover:text-white font-semibold px-7 py-3.5 rounded-xl text-sm transition-colors"
            >
              Submit Task Portfolio
              <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
