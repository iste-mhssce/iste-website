export type FieldType =
  | "text"
  | "textarea"
  | "email"
  | "url"
  | "number"
  | "boolean"
  | "select"
  | "datetime";

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: FieldOption[];
  defaultValue?: string | number | boolean;
  placeholder?: string;
  help?: string;
}

export interface ListColumn {
  key: string;
  label: string;
}

export interface EntityDef {
  key: string;
  label: string;
  singular: string;
  description: string;
  fields: FieldDef[];
  listColumns: ListColumn[];
  defaultOrder: Record<string, "asc" | "desc">;
  searchFields?: string[];
  /** String keys whose values should be rendered as-formatted dates in lists. */
  dateKeys?: string[];
}

const PUBLISHED_AT: FieldDef = {
  key: "publishedAt",
  label: "Published At",
  type: "datetime",
  help: "Leave empty to use 'now' when published.",
};

export const ENTITIES: EntityDef[] = [
  {
    key: "posts",
    label: "Posts",
    singular: "Post",
    description: "News, announcements and tech articles shown on the website.",
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      {
        key: "slug",
        label: "Slug",
        type: "text",
        placeholder: "auto-generated from title",
        help: "Leave empty to auto-generate from the title.",
      },
      { key: "category", label: "Category", type: "select", required: true, defaultValue: "General", options: [
        { value: "General", label: "General" },
        { value: "Backend", label: "Backend" },
        { value: "AI/ML", label: "AI/ML" },
        { value: "CyberSec", label: "CyberSec" },
        { value: "Web", label: "Web" },
        { value: "Design", label: "Design" },
      ] },
      { key: "excerpt", label: "Excerpt", type: "textarea", required: true, placeholder: "Short summary shown on cards." },
      { key: "body", label: "Body", type: "textarea", required: true, placeholder: "Full article content (markdown/plain text)." },
      { key: "author", label: "Author", type: "text", placeholder: "e.g. Priya Sharma" },
      { key: "published", label: "Published", type: "boolean", defaultValue: false },
      PUBLISHED_AT,
    ],
    listColumns: [
      { key: "title", label: "Title" },
      { key: "category", label: "Category" },
      { key: "author", label: "Author" },
      { key: "published", label: "Published" },
      { key: "publishedAt", label: "Published At" },
    ],
    defaultOrder: { publishedAt: "desc" },
    searchFields: ["title", "excerpt", "category", "author"],
    dateKeys: ["publishedAt"],
  },
  {
    key: "events",
    label: "Events",
    singular: "Event",
    description: "Workshops, hackathons, seminars and summits.",
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      {
        key: "slug",
        label: "Slug",
        type: "text",
        placeholder: "auto-generated from title",
        help: "Leave empty to auto-generate from the title.",
      },
      { key: "category", label: "Category", type: "select", required: true, options: [
        { value: "WORKSHOP", label: "Workshop" },
        { value: "HACKATHON", label: "Hackathon" },
        { value: "SEMINAR", label: "Seminar" },
        { value: "SUMMIT", label: "Summit" },
      ] },
      { key: "tag", label: "Tag", type: "text", required: true, placeholder: "e.g. Hands-on" },
      { key: "description", label: "Description", type: "textarea", required: true },
      { key: "startDate", label: "Start Date", type: "datetime", required: true },
      { key: "location", label: "Location", type: "text", required: true, placeholder: "e.g. Seminar Hall, MHSSCOE" },
      { key: "keynote", label: "Keynote / Speaker", type: "text" },
      { key: "isFeatured", label: "Featured", type: "boolean", defaultValue: false },
    ],
    listColumns: [
      { key: "title", label: "Title" },
      { key: "category", label: "Category" },
      { key: "startDate", label: "Start Date" },
      { key: "location", label: "Location" },
      { key: "isFeatured", label: "Featured" },
    ],
    defaultOrder: { startDate: "desc" },
    searchFields: ["title", "tag", "location", "description"],
    dateKeys: ["startDate"],
  },
  {
    key: "certificates",
    label: "Certificates",
    singular: "Certificate",
    description: "Issued participation/achievement certificates.",
    fields: [
      { key: "certificateId", label: "Certificate ID", type: "text", required: true },
      { key: "studentName", label: "Student Name", type: "text", required: true },
      { key: "eventName", label: "Event Name", type: "text", required: true },
      { key: "issueDate", label: "Issue Date", type: "datetime", required: true },
      { key: "pdfUrl", label: "PDF URL", type: "url" },
      { key: "isVerified", label: "Verified", type: "boolean", defaultValue: true },
      { key: "riskScore", label: "Risk Score", type: "number", defaultValue: 0, help: "0 = safe, higher = suspicious." },
    ],
    listColumns: [
      { key: "certificateId", label: "Certificate ID" },
      { key: "studentName", label: "Student" },
      { key: "eventName", label: "Event" },
      { key: "issueDate", label: "Issued" },
      { key: "isVerified", label: "Verified" },
      { key: "riskScore", label: "Risk" },
    ],
    defaultOrder: { createdAt: "desc" },
    searchFields: ["certificateId", "studentName", "eventName"],
    dateKeys: ["issueDate", "createdAt"],
  },
  {
    key: "council",
    label: "Council Team",
    singular: "Council Member",
    description: "Student council & committee members shown on the home page.",
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "role", label: "Position", type: "text", required: true, placeholder: "e.g. Chairperson" },
      { key: "team", label: "Team", type: "text", required: true, placeholder: "e.g. Executive Committee" },
      { key: "photoUrl", label: "Photo URL", type: "url" },
      { key: "email", label: "Email", type: "email" },
      { key: "bio", label: "Bio", type: "textarea" },
      { key: "linkedin", label: "LinkedIn", type: "url" },
      { key: "instagram", label: "Instagram", type: "url" },
      { key: "github", label: "GitHub", type: "url" },
      { key: "order", label: "Display Order", type: "number", defaultValue: 0 },
      { key: "isActive", label: "Active", type: "boolean", defaultValue: true },
    ],
    listColumns: [
      { key: "name", label: "Name" },
      { key: "role", label: "Position" },
      { key: "team", label: "Team" },
      { key: "order", label: "Order" },
      { key: "isActive", label: "Active" },
    ],
    defaultOrder: { order: "asc" },
    searchFields: ["name", "role", "team"],
  },
  {
    key: "social-links",
    label: "Social Links",
    singular: "Social Link",
    description: "Social media links displayed in the footer and contact sections.",
    fields: [
      { key: "platform", label: "Platform", type: "text", required: true, placeholder: "e.g. Instagram" },
      { key: "label", label: "Label", type: "text", placeholder: "e.g. @iste_mhsscoe" },
      { key: "url", label: "URL", type: "url", required: true },
      { key: "order", label: "Order", type: "number", defaultValue: 0 },
      { key: "isActive", label: "Active", type: "boolean", defaultValue: true },
    ],
    listColumns: [
      { key: "platform", label: "Platform" },
      { key: "label", label: "Label" },
      { key: "url", label: "URL" },
      { key: "order", label: "Order" },
      { key: "isActive", label: "Active" },
    ],
    defaultOrder: { order: "asc" },
    searchFields: ["platform", "label"],
  },
  {
    key: "notifications",
    label: "Notifications",
    singular: "Notification",
    description: "Announcement banners shown to visitors and members.",
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "body", label: "Body", type: "textarea", required: true },
      { key: "category", label: "Category", type: "text", defaultValue: "general", placeholder: "e.g. general, intake, events" },
      { key: "pinned", label: "Pinned", type: "boolean", defaultValue: false },
      { key: "isActive", label: "Active", type: "boolean", defaultValue: true },
    ],
    listColumns: [
      { key: "title", label: "Title" },
      { key: "category", label: "Category" },
      { key: "pinned", label: "Pinned" },
      { key: "isActive", label: "Active" },
      { key: "createdAt", label: "Created" },
    ],
    defaultOrder: { createdAt: "desc" },
    searchFields: ["title", "body", "category"],
    dateKeys: ["createdAt"],
  },
];

export function getEntityDef(key: string): EntityDef | undefined {
  return ENTITIES.find((e) => e.key === key);
}

const READONLY_KEYS = new Set([
  "id",
  "createdAt",
  "updatedAt",
  "passwordHash",
  "lastLoginAt",
  "createdBy",
  "registrations",
]);

/** Field keys that accept a free-form string input (not datetime/select options). */
export function isEditableField(key: string, def: EntityDef): boolean {
  if (READONLY_KEYS.has(key)) return false;
  return def.fields.some((f) => f.key === key);
}

export function isActiveTarget(def: EntityDef): string {
  return def.fields.some((f) => f.key === "isActive") ? "isActive" : "";
}