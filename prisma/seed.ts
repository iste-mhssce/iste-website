import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth/password";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Account credentials (admin creates lower-level accounts via the dashboard).
  const accounts = [
    {
      email: "admin@iste.com",
      name: "Administrator",
      password: "Admin@123",
      role: "ADMIN" as const,
      team: null,
    },
    {
      email: "head@iste.com",
      name: "Tech Head",
      password: "Head@123",
      role: "HEAD" as const,
      team: "Tech Team",
    },
    {
      email: "member@iste.com",
      name: "Member One",
      password: "Member@123",
      role: "MEMBER" as const,
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

  // Events
  const reactEvent = await prisma.event.upsert({
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

  const genaiEvent = await prisma.event.upsert({
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

  const websec = await prisma.event.upsert({
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

  const hackathon2026 = await prisma.event.upsert({
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

  // Council members
  const teams: { name: string; role: string; team: string; order: number }[] = [
    { name: "Alex Morgan", role: "Chairperson", team: "Core Council", order: 1 },
    { name: "Priya Sharma", role: "Vice Chairperson", team: "Core Council", order: 2 },
    { name: "Rohan Deshmukh", role: "Secretary", team: "Core Council", order: 3 },
    { name: "Sneha Kulkarni", role: "Treasurer", team: "Core Council", order: 4 },
    { name: "Aditya Patil", role: "Technical Head", team: "Tech Team", order: 1 },
    { name: "Meera Joshi", role: "Events Coordinator", team: "Management", order: 1 },
    { name: "Tanvi Rao", role: "Creative Director", team: "Creatives", order: 1 },
  ];
  for (const m of teams) {
    await prisma.councilMember.create({
      data: m,
    });
  }

  // Publications
  await prisma.publication.upsert({
    where: { id: "pub_node_graphql" },
    update: {},
    create: {
      id: "pub_node_graphql",
      title: "Building Scalable APIs with Node.js and GraphQL",
      author: "Aditya Patil",
      readTime: "5 min read",
      publishedAt: new Date("2026-08-28T00:00:00Z"),
    },
  });

  await prisma.publication.upsert({
    where: { id: "pub_transformer_nlp" },
    update: {},
    create: {
      id: "pub_transformer_nlp",
      title: "Getting Started with Transformer Architectures in NLP",
      author: "Priya Sharma",
      readTime: "8 min read",
      publishedAt: new Date("2026-08-22T00:00:00Z"),
    },
  });

  console.log("Seed complete");
  console.log({ reactEvent: reactEvent.id, genaiEvent: genaiEvent.id, websec: websec.id, hackathon2026: hackathon2026.id });
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
