"use client";
import { ExternalLink } from "lucide-react";

export default function PartnerBanner() {
  return (
    <div className="bg-[#1E3A8A] text-[#06B6D4] text-center py-2.5 px-4 text-sm flex items-center justify-center gap-2">
      <span>
        Looking for Advanced Cybersecurity &amp; Vulnerability Audits? Visit our
        partner,{" "}
        <a
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold underline underline-offset-2 hover:text-white transition-colors inline-flex items-center gap-1"
        >
          VAPT Excellence Center
          <ExternalLink size={13} strokeWidth={2.5} />
        </a>
      </span>
    </div>
  );
}
