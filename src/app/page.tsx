import PartnerBanner from "@/components/PartnerBanner";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ImpactMetrics from "@/components/ImpactMetrics";
import EventsHub from "@/components/EventsHub";
import RecommendedEventsRail from "@/components/RecommendedEventsRail";
import StudentCouncil from "@/components/StudentCouncil";
import IntakeBanner from "@/components/IntakeBanner";
import TechBlog from "@/components/TechBlog";
import Footer from "@/components/Footer";
import AIAssistant from "@/components/AIAssistant";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <PartnerBanner />
      <Navbar />
      <main className="flex-1">
        <Hero />
        <ImpactMetrics />
        <EventsHub />
        <RecommendedEventsRail />
        <StudentCouncil />
        <IntakeBanner />
        <TechBlog />
      </main>
      <Footer />
      <AIAssistant />
    </div>
  );
}
