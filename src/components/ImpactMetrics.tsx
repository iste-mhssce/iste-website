const metrics = [
  { number: "50+", label: "Technical Workshops & Flagship Conventions" },
  { number: "1200+", label: "Active Student Members & Alumni Network" },
  { number: "3500+", label: "Verified Certificates Issued & Shareable" },
  { number: "40+", label: "Industry Expert Guest Sessions" },
];

export default function ImpactMetrics() {
  return (
    <section id="about" className="bg-white/70 border-y border-slate-200/70 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {metrics.map((m) => (
            <div key={m.number} className="text-center">
              <div className="text-4xl sm:text-5xl font-extrabold text-gradient mb-2">
                {m.number}
              </div>
              <p className="text-sm sm:text-base text-slate-600 font-medium leading-snug">
                {m.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}