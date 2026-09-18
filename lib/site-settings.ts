export const SITE_SETTING_KEYS = [
  "social.instagram",
  "social.linkedin",
  "social.twitter",
  "social.youtube",
  "social.github",
  "partner.vapt_name",
  "partner.vapt_url",
] as const;

export type SiteSettingKey = (typeof SITE_SETTING_KEYS)[number];

export const DEFAULT_SITE_SETTINGS: Record<SiteSettingKey, string> = {
  "social.instagram": "",
  "social.linkedin": "",
  "social.twitter": "",
  "social.youtube": "",
  "social.github": "",
  "partner.vapt_name": "VAPT Excellence Center",
  "partner.vapt_url": "https://vapt-mhssce.vercel.app/",
};

export type SiteSettings = Record<SiteSettingKey, string>;