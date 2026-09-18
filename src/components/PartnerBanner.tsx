import { ExternalLink } from "lucide-react";
import { loadSiteSettings } from "@lib/site-settings-server";

export default async function PartnerBanner() {
  const settings = await loadSiteSettings();
  const url = settings["partner.vapt_url"] || "#";
  const name = settings["partner.vapt_name"] || "VAPT Excellence Center";

  return (
    <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white text-center py-2.5 px-4 text-sm flex items-center justify-center gap-2">
      <span>
        Looking for Advanced Cybersecurity &amp; Vulnerability Audits? Visit our
        partner,{" "}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold underline underline-offset-2 hover:text-blue-100 transition-colors inline-flex items-center gap-1"
        >
          {name}
          <ExternalLink size={13} strokeWidth={2.5} />
        </a>
      </span>
    </div>
  );
}