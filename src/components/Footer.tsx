import { ExternalLink } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { loadSiteSettings } from "@lib/site-settings-server";

type LinkItem = { label: string; href: string };

const quickLinks: LinkItem[] = [
  { label: "About Us", href: "#about" },
  { label: "Events Hub", href: "#events" },
  { label: "Certificates", href: "#certificates" },
  { label: "Team", href: "/team" },
  { label: "Blog & Updates", href: "#blog" },
  { label: "Join Chapter", href: "#intake" },
];

const socialKeys: { label: string; key: string }[] = [
  { label: "Instagram", key: "social.instagram" },
  { label: "LinkedIn", key: "social.linkedin" },
  { label: "Twitter / X", key: "social.twitter" },
  { label: "YouTube", key: "social.youtube" },
  { label: "GitHub", key: "social.github" },
];

export default async function Footer() {
  const settings = await loadSiteSettings();
  const socialLinks: LinkItem[] = socialKeys
    .map((s) => ({ label: s.label, href: settings[s.key] ?? "" }))
    .filter((l) => l.href.length > 0);

  return (
    <footer className="bg-slate-900 text-white border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <Image
                src="/iste-logo.png"
                alt="ISTE-MHSSCE logo"
                width={36}
                height={36}
                className="object-contain"
              />
              <span className="font-bold text-lg">ISTE-MHSSCE</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              The Indian Society for Technical Education — MHSSCOE Student
              Chapter. Empowering innovation and building future-ready engineers.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-sm mb-4 uppercase tracking-wide text-slate-300">
              Quick Links
            </h3>
            <ul className="flex flex-col gap-2.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  {link.href.startsWith("/") ? (
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-[#60A5FA] transition-colors"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-[#60A5FA] transition-colors"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-sm mb-4 uppercase tracking-wide text-slate-300">
              Social Networks
            </h3>
            <ul className="flex flex-col gap-2.5">
              {socialLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-slate-400 hover:text-[#60A5FA] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-sm mb-4 uppercase tracking-wide text-slate-300">
              Partner Notice
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-3">
              For advanced cybersecurity &amp; vulnerability audit services,
              visit our official partner:
            </p>
            <a
              href={settings["partner.vapt_url"] || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[#60A5FA] text-sm font-semibold hover:underline"
            >
              {settings["partner.vapt_name"] || "MHSSCOE VAPT Excellence Center"}
              <ExternalLink size={13} />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>&copy; 2026 MHSSCOE ISTE Student Chapter. All Rights Reserved.</span>
          <a
            href="/login"
            className="hover:text-[#60A5FA] transition-colors inline-flex items-center gap-1"
          >
            Sign In / Dashboard
          </a>
        </div>
      </div>
    </footer>
  );
}