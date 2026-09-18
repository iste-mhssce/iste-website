"use client";
import { useEffect, useState } from "react";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import EventRegisterModal from "@/components/EventRegisterModal";

export interface ApiEvent {
  id: string;
  title: string;
  slug: string;
  category: string;
  tag: string;
  description: string;
  startDate: string;
  location: string;
  keynote: string | null;
  isFeatured: boolean;
}

// Static fallback used only when the events API is unreachable.
const FALLBACK_EVENTS: ApiEvent[] = [
  {
    id: "fb-1",
    title: "React & Cloud Architecture",
    slug: "react-cloud-architecture",
    category: "WORKSHOP",
    tag: "WebDev",
    description: "Hands-on React patterns and cloud deployment.",
    startDate: "2026-10-15T10:00:00Z",
    location: "CC-04",
    keynote: null,
    isFeatured: false,
  },
  {
    id: "fb-2",
    title: "GenAI & Automation Challenge",
    slug: "genai-automation-challenge",
    category: "HACKATHON",
    tag: "AI",
    description: "24-hour hackathon for AI agents.",
    startDate: "2026-11-03T09:00:00Z",
    location: "Tech Hub",
    keynote: null,
    isFeatured: false,
  },
  {
    id: "fb-3",
    title: "Web App Vulnerabilities",
    slug: "web-app-vulnerabilities",
    category: "SEMINAR",
    tag: "CyberSec",
    description: "OWASP top-10 and secure coding.",
    startDate: "2026-11-20T11:00:00Z",
    location: "Seminar Hall",
    keynote: null,
    isFeatured: false,
  },
];

const tabs: { label: string; category?: string }[] = [
  { label: "All Events" },
  { label: "Live & Upcoming" },
  { label: "Flagship Summits", category: "SUMMIT" },
  { label: "Past Archive" },
];

const TAG_COLORS: Record<string, string> = {
  WebDev: "bg-[#DBEAFE] text-[#1D4ED8]",
  AI: "bg-[#F3E8FF] text-[#7C3AED]",
  "AI/ML": "bg-[#F3E8FF] text-[#7C3AED]",
  CyberSec: "bg-[#DCFCE7] text-[#16A34A]",
};

export default function EventsHub() {
  const [activeTab, setActiveTab] = useState(1);
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<ApiEvent | null>(null);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ page: "1", limit: "12" });
    if (activeTab === 0) params.delete("category");
    else if (activeTab === 2) params.set("category", "SUMMIT");

    fetch(`/api/events?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (data?.events?.length) {
          const list = data.events as ApiEvent[];
          if (activeTab === 3) {
            setEvents(
              list.filter((e) => new Date(e.startDate).getTime() < Date.now()),
            );
          } else {
            setEvents(list);
          }
        } else {
          setEvents(FALLBACK_EVENTS);
        }
      })
      .catch(() => {
        if (!cancelled) setEvents(FALLBACK_EVENTS);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  return (
    <section id="events" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2563EB] mb-3">
            Explore Our Workshops, Hackathons &amp; Seminars
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Events <span className="text-gradient">Hub</span>
          </h2>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {tabs.map((tab, i) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(i)}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === i
                  ? "glass-btn text-white shadow-md"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-[#2563EB] hover:text-[#2563EB]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="text-center text-sm text-slate-400 py-10">
            Loading events...
          </div>
        )}

        {!loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((ev) => {
              const tagColor = TAG_COLORS[ev.tag] ?? "bg-[#DBEAFE] text-[#1D4ED8]";
              return (
                <div
                  key={ev.id}
                  className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-md hover:border-[#2563EB]/40 transition-all"
                >
                  <span
                    className={`inline-flex items-center self-start text-xs font-bold px-3 py-1 rounded-md ${tagColor}`}
                  >
                    {ev.tag || ev.category}
                  </span>

                  <h3 className="text-xl font-bold text-slate-900 leading-snug">
                    {ev.title}
                  </h3>

                  <div className="flex flex-col gap-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-[#2563EB] shrink-0" />
                      {new Date(ev.startDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-[#2563EB] shrink-0" />
                      {ev.location}
                    </div>
                  </div>

                  <div className="mt-auto pt-2">
                    <button
                      onClick={() => setRegistering(ev)}
                      className="glass-btn inline-flex items-center gap-2 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-opacity hover:opacity-90"
                    >
                      {ev.category === "HACKATHON"
                        ? "Register Team"
                        : "Register Seat"}
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && events.length === 0 && (
          <div className="text-center text-sm text-slate-400 py-10">
            No events in this category yet. Check back soon.
          </div>
        )}
      </div>

      <EventRegisterModal
        event={registering}
        onClose={() => setRegistering(null)}
      />
    </section>
  );
}
