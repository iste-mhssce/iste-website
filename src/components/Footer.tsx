import { ExternalLink } from "lucide-react";

const quickLinks = [
  "About Us",
  "Events Hub",
  "Certificates",
  "Council & Team",
  "Publications",
  "Join Chapter",
];

const socialLinks = [
  "Instagram",
  "LinkedIn",
  "Twitter / X",
  "YouTube",
  "GitHub",
];

export default function Footer() {
  return (
    <footer className="bg-[#0F172A] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-[#2563EB] flex items-center justify-center text-white font-bold text-sm">
                ISTE
              </div>
              <span className="font-bold text-lg">ISTE MHSSCOE</span>
            </div>
            <p className="text-sm text-white/50 leading-relaxed">
              The Indian Society for Technical Education — MHSSCOE Student
              Chapter. Empowering innovation and building future-ready engineers.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-sm mb-4 uppercase tracking-wide text-white/80">
              Quick Links
            </h3>
            <ul className="flex flex-col gap-2.5">
              {quickLinks.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-white/50 hover:text-[#06B6D4] transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-sm mb-4 uppercase tracking-wide text-white/80">
              Social Networks
            </h3>
            <ul className="flex flex-col gap-2.5">
              {socialLinks.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-white/50 hover:text-[#06B6D4] transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-sm mb-4 uppercase tracking-wide text-white/80">
              Partner Notice
            </h3>
            <p className="text-sm text-white/50 leading-relaxed mb-3">
              For advanced cybersecurity &amp; vulnerability audit services,
              visit our official partner:
            </p>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[#06B6D4] text-sm font-semibold hover:underline"
            >
              MHSSCOE VAPT Excellence Center
              <ExternalLink size={13} />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/40">
          <span>&copy; 2026 MHSSCOE ISTE Student Chapter. All Rights Reserved.</span>
          <a
            href="/dashboard"
            className="hover:text-[#06B6D4] transition-colors inline-flex items-center gap-1"
          >
            Sign In / Dashboard
          </a>
        </div>
      </div>
    </footer>
  );
}
