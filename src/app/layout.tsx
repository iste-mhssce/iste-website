import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ISTE-MHSSCE | Empowering Technical Innovation",
  description:
    "MHSSCOE ISTE Student Chapter - Empowering technical innovation, fostering leadership, and building future engineers through workshops, hackathons, and industry certifications.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
