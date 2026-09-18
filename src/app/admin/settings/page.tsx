import SiteSettingsTab from "@/components/admin/SiteSettingsTab";

export const metadata = { title: "Site Settings · ISTE-MHSSCE Admin" };

export default function SettingsPage() {
  return (
    <div className="w-full">
      <div>
        <h1 className="text-2xl font-bold text-white">Site Settings</h1>
        <p className="text-sm text-slate-400 mt-1">
          Social links and partner links used across the public site.
        </p>
      </div>
      <div className="mt-8">
        <SiteSettingsTab />
      </div>
    </div>
  );
}