import { PrismaClient, UserRole } from "@prisma/client";
import { hashPassword } from "../lib/auth/password";
import { DEFAULT_SITE_SETTINGS } from "../lib/site-settings";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Account credentials (higher roles create lower accounts via the panel).
  const accounts: {
    email: string;
    name: string;
    password: string;
    role: UserRole;
    team: string | null;
  }[] = [
    {
      email: "superadmin@iste.com",
      name: "Super Administrator",
      password: "Super@123",
      role: "SUPER_ADMIN",
      team: null,
    },
    {
      email: "admin@iste.com",
      name: "Administrator",
      password: "Admin@123",
      role: "ADMIN",
      team: "Core Council",
    },
    {
      email: "member@iste.com",
      name: "Member One",
      password: "Member@123",
      role: "MEMBER",
      team: "Tech Team",
    },
  ];
  for (const a of accounts) {
    await prisma.user.upsert({
      where: { email: a.email },
      update: {},
      create: {
        email: a.email,
        name: a.name,
        passwordHash: hashPassword(a.password),
        role: a.role,
        team: a.team,
      },
    });
  }
  console.log(
    "Seeded accounts:",
    accounts.map((a) => `${a.email} (${a.role})`).join(", "),
  );

  for (const [key, value] of Object.entries(DEFAULT_SITE_SETTINGS)) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: {},
      create: { key, value },
    });
  }
  console.log("Seeded site settings.");

  // Posts / articles
  const posts = [
    {
      slug: "welcome-to-iste-mhsscoe-2026",
      title: "Welcome to ISTE MHSSCOE — A New Chapter of Innovation",
      excerpt:
        "Meet the 2026 committee and discover everything the ISTE student chapter plans to build this year.",
      body:
        "The ISTE MHSSCOE student chapter is excited to kick off the 2026 technical season. From hands-on " +
        "workshops and national-level hackathons to industry mentorship and certification programs, our " +
        "chapter exists to turn curious students into confident engineers.\n\nThroughout the year we will " +
        "publish training notes, event recaps, and student research. Follow the chapter on our social links " +
        "to stay in the loop, and keep an eye on the Events Hub for registrations.",
      category: "Announcement",
      author: "ISTE MHSSCOE Committee",
      published: true,
      publishedAt: new Date("2026-08-20T00:00:00Z"),
    },
    {
      slug: "react-cloud-architecture-recap",
      title: "Recap: React & Cloud Architecture Workshop",
      excerpt:
        "A quick summary of our first workshop of the year — modern React patterns and CI/CD deployments.",
      body:
        "Our first workshop of the year brought together 120+ students for a hands-on session on modern " +
        "React patterns, server rendering, and shipping applications to the cloud. Attendees deployed a " +
        "real application with a CI/CD pipeline before leaving the room.\n\nSlides and code references have " +
        "been shared with registered members. If you missed it, sign up for the newsletter so you never " +
        "miss an announcement again.",
      category: "Event Recap",
      author: "Tech Team",
      published: true,
      publishedAt: new Date("2026-08-28T00:00:00Z"),
    },
    {
      slug: "student-guide-to-open-source",
      title: "A Student's Guide to Contributing to Open Source",
      excerpt:
        "Practical steps to land your first meaningful open-source contribution while studying.",
      body:
        "Open source is one of the fastest ways to grow as a developer. Start small: pick a project you " +
        "already use, read its contributing guide, and look for issues tagged 'good first issue'.\n\n" +
        "Do not worry about perfection — maintainers value clear communication, tiny pull requests, and " +
        "a willingness to learn. Your ISTE tech team hosts monthly 'Hack Night' sessions to help members " +
        "make their first PR.",
      category: "Resources",
      author: "Technical Head",
      published: true,
      publishedAt: new Date("2026-09-05T00:00:00Z"),
    },
  ];
  for (const p of posts) {
    await prisma.post.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
  }
  console.log("Seeded posts.");

  // Events
  await prisma.event.upsert({
    where: { slug: "react-cloud-architecture" },
    update: {},
    create: {
      slug: "react-cloud-architecture",
      title: "React & Cloud Architecture",
      category: "WORKSHOP",
      tag: "WebDev",
      description:
        "Hands-on workshop covering modern React patterns, server-rendering, and deploying to the cloud with CI/CD.",
      startDate: new Date("2026-10-15T10:00:00Z"),
      location: "CC-04",
      keynote: "Senior Frontend Engineer, Cloud Native Lab",
      isFeatured: false,
    },
  });

  await prisma.event.upsert({
    where: { slug: "genai-automation-challenge" },
    update: {},
    create: {
      slug: "genai-automation-challenge",
      title: "GenAI & Automation Challenge",
      category: "HACKATHON",
      tag: "AI",
      description:
        "24-hour hackathon to build AI-driven automation agents. Bring your team and ship something production-useful.",
      startDate: new Date("2026-11-03T09:00:00Z"),
      location: "Tech Hub",
      keynote: "Industry Tech Lead",
      isFeatured: false,
    },
  });

  await prisma.event.upsert({
    where: { slug: "web-app-vulnerabilities" },
    update: {},
    create: {
      slug: "web-app-vulnerabilities",
      title: "Web App Vulnerabilities",
      category: "SEMINAR",
      tag: "CyberSec",
      description:
        "Lecture and live demo on OWASP top-10, secure coding practices, and responsible disclosure.",
      startDate: new Date("2026-11-20T11:00:00Z"),
      location: "Seminar Hall",
      keynote: "VAPT Excellence Center Lead",
      isFeatured: false,
    },
  });

  await prisma.event.upsert({
    where: { slug: "national-level-hackathon-2026" },
    update: {},
    create: {
      slug: "national-level-hackathon-2026",
      title: "NATIONAL LEVEL HACKATHON 2026",
      category: "HACKATHON",
      tag: "AI/ML",
      description:
        "National-level hackathon for students across India. Solve real-world problems in WebDev, AI/ML and Robotics.",
      startDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      location: "Main Auditorium & Hybrid",
      keynote: "Industry Tech Lead",
      isFeatured: true,
    },
  });

  // Certificates
  await prisma.certificate.upsert({
    where: { certificateId: "ISTE-MHSS-2026-X982" },
    update: {},
    create: {
      certificateId: "ISTE-MHSS-2026-X982",
      studentName: "John Doe",
      eventName: "Annual Web Dev Bootcamp 2026",
      issueDate: new Date("2026-02-14T00:00:00Z"),
      pdfUrl: null,
      isVerified: true,
      riskScore: 0,
    },
  });

  await prisma.certificate.upsert({
    where: { certificateId: "ISTE-MHSS-2026-A445" },
    update: {},
    create: {
      certificateId: "ISTE-MHSS-2026-A445",
      studentName: "Aisha Khan",
      eventName: "GenAI Foundations Summit 2026",
      issueDate: new Date("2026-06-10T00:00:00Z"),
      pdfUrl: null,
      isVerified: true,
      riskScore: 0,
    },
  });

  // Council members (committee / team)
  const teams: {
    name: string;
    role: string;
    team: string;
    order: number;
    linkedin: string | null;
    github: string | null;
  }[] = [
    { name: "Alex Morgan", role: "Chairperson", team: "Core Council", order: 1, linkedin: "https://linkedin.com", github: "https://github.com" },
    { name: "Priya Sharma", role: "Vice Chairperson", team: "Core Council", order: 2, linkedin: "https://linkedin.com", github: "https://github.com" },
    { name: "Rohan Deshmukh", role: "Secretary", team: "Core Council", order: 3, linkedin: "https://linkedin.com", github: "https://github.com" },
    { name: "Sneha Kulkarni", role: "Treasurer", team: "Core Council", order: 4, linkedin: "https://linkedin.com", github: "https://github.com" },
    { name: "Aditya Patil", role: "Technical Head", team: "Tech Team", order: 1, linkedin: "https://linkedin.com", github: "https://github.com" },
    { name: "Meera Joshi", role: "Events Coordinator", team: "Management", order: 1, linkedin: "https://linkedin.com", github: "https://github.com" },
    { name: "Tanvi Rao", role: "Creative Director", team: "Creatives", order: 1, linkedin: "https://linkedin.com", github: "https://github.com" },
    { name: "Prof. N. Kulkarni", role: "Faculty Advisor", team: "Faculty Board", order: 1, linkedin: null, github: null },
  ];
  for (const m of teams) {
    const existing = await prisma.councilMember.findFirst({
      where: { name: m.name },
    });
    if (existing) {
      await prisma.councilMember.update({
        where: { id: existing.id },
        data: m,
      });
    } else {
      await prisma.councilMember.create({ data: m });
    }
  }

  // Social links
  const socials = [
    { platform: "instagram", label: "Instagram", url: "https://instagram.com", order: 1 },
    { platform: "linkedin", label: "LinkedIn", url: "https://linkedin.com", order: 2 },
    { platform: "github", label: "GitHub", url: "https://github.com", order: 3 },
    { platform: "youtube", label: "YouTube", url: "https://youtube.com", order: 4 },
  ];
  for (const s of socials) {
    await prisma.socialLink.upsert({
      where: { id: `${s.platform}-seed` },
      update: {},
      create: { id: `${s.platform}-seed`, ...s },
    });
  }

  // Notifications
  const notifications = [
    {
      title: "National Level Hackathon 2026 registrations are open",
      body: "Team registrations close soon. Reserve your seat from the Events Hub.",
      category: "event",
      pinned: true,
    },
    {
      title: "New workshop announced",
      body: "React & Cloud Architecture workshop is coming up — stay tuned for the schedule.",
      category: "workshop",
      pinned: false,
    },
  ];
  for (const n of notifications) {
    await prisma.notification.create({ data: n });
  }

  console.log("Seed complete");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });