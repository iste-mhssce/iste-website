"use client";
import { useState } from "react";
import { ArrowRight, FileText } from "lucide-react";
import IntakeApplyModal from "@/components/IntakeApplyModal";

const perks = [
  "Priority Access to Events",
  "Official ISTE Membership",
  "1-on-1 Mentorship Programs",
  "Leadership Opportunities",
];

export default function IntakeBanner() {
  const [open, setOpen] = useState(false);

  return (
    <section id="intake" className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1D4ED8] via-[#2563EB] to-[#06B6D4]" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMudzNvcmcvMjAwMC9zdmciPjxnIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+PGcgZmlsbD0iI2ZmZmZmZiIgZmlsbC1vcGFjaXR5PSIwLjA1Ij48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxLjUiLz48L2c+PC9nPjwvc3ZnPg==')]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-xs font-bold px-4 py-2 rounded-full mb-6 uppercase tracking-widest">
            Recruitment Open
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
            Join the ISTE Committee Intake Drive
          </h2>
          <p className="text-lg text-white/85 mb-10 max-w-xl mx-auto">
            Be part of India&apos;s largest technical student community. Gain
            exclusive perks and shape the future of engineering at MHSSCOE.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
            {perks.map((perk) => (
              <div
                key={perk}
                className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-4 text-white text-sm font-semibold text-center"
              >
                {perk}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setOpen(true)}
              className="bg-white text-[#1D4ED8] inline-flex items-center gap-2 font-bold px-7 py-3.5 rounded-xl text-sm shadow-lg shadow-blue-900/30 transition-transform hover:scale-[1.02]"
            >
              Fill Application Form
              <FileText size={15} />
            </button>
            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 border border-white/50 text-white hover:bg-white/10 font-semibold px-7 py-3.5 rounded-xl text-sm transition-colors backdrop-blur-sm"
            >
              Submit Task Portfolio
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>

      <IntakeApplyModal open={open} onClose={() => setOpen(false)} />
    </section>
  );
}