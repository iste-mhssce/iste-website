"use client";
import { useEffect, useState } from "react";
import {
  Calendar,
  MapPin,
  Mic,
  Clock,
  ArrowRight,
  FileText,
} from "lucide-react";
import EventRegisterModal from "@/components/EventRegisterModal";

function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const diff = target - now;
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}

export default function Hero() {
  const [featured, setFeatured] = useState<{
    id: string;
    title: string;
    startDate: string;
    location: string;
    keynote: string | null;
    category?: string;
    tag?: string;
  } | null>(null);
  const [registering, setRegistering] = useState(false);

  // Featured event target: use the real startDate from the API if available,
  // otherwise degrades to a sensible demo target (~4 days out). Never blocks
  // rendering if the events API is unreachable.
  const [eventDate, setEventDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    d.setHours(d.getHours() + 12);
    return d;
  });

  useEffect(() => {
    fetch(`/api/events?page=1&limit=50`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const list = (data?.events ?? []) as {
          id?: string;
          isFeatured?: boolean;
          title?: string;
          startDate?: string;
          location?: string;
          keynote?: string | null;
          category?: string;
          tag?: string;
        }[];
        const feat = list.find((e) => e.isFeatured && e.startDate);
        if (feat?.startDate) {
          setFeatured({
            id: feat.id ?? "",
            title: feat.title ?? "NATIONAL LEVEL HACKATHON 2026",
            startDate: feat.startDate,
            location: feat.location ?? "Main Auditorium & Hybrid",
            keynote: feat.keynote ?? null,
            category: feat.category,
            tag: feat.tag,
          });
          setEventDate(new Date(feat.startDate));
        }
      })
      .catch(() => {});
  }, []);

  const time = useCountdown(eventDate);
  const pad = (n: number) => String(n).padStart(2, "0");

  const eventTitle = featured?.title ?? "NATIONAL LEVEL HACKATHON 2026";
  const eventLocation = featured?.location ?? "Main Auditorium & Hybrid";
  const keynote = featured?.keynote ?? "Industry Tech Lead (Keynote Speaker)";

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div className="flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 bg-white text-[#2563EB] px-4 py-2 rounded-full text-sm font-bold shadow-sm ring-1 ring-slate-200 w-fit">
            ISTE STUDENT CHAPTER MHSSCOE
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
            Empowering Technical Innovation,{" "}
            <span className="text-gradient">Fostering Leadership</span>, and
            Building Future Engineers.
          </h1>

          <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
            MHSSCOE ISTE drives academic excellence through hands-on workshops,
            national-level hackathons, and industry-recognized certifications
            — equipping students with the skills that matter most.
          </p>

          <div className="flex flex-wrap gap-4 mt-2">
            <a
              href="#events"
              className="glass-btn inline-flex items-center gap-2 text-white font-semibold px-7 py-3.5 rounded-xl text-sm transition-opacity hover:opacity-90"
            >
              Explore Events
              <ArrowRight size={16} />
            </a>
            <a
              href="#intake"
              className="inline-flex items-center gap-2 border border-slate-300 bg-white text-slate-800 hover:border-[#2563EB] hover:text-[#2563EB] font-semibold px-7 py-3.5 rounded-xl text-sm transition-colors"
            >
              Apply For Intake
              <FileText size={16} />
            </a>
          </div>
        </div>

        <div className="glass-strong rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <span className="inline-flex items-center gap-1.5 bg-[#FEF9C3] text-[#92400E] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              UPCOMING FEATURED EVENT
            </span>
          </div>

          <div className="p-6 sm:p-8 flex flex-col gap-5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {eventTitle}
            </h2>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 text-sm font-medium text-slate-500 mb-3">
                <Clock size={14} />
                Starts In:
              </div>
              <div className="flex items-center justify-center gap-3">
                {[
                  { val: time.days, label: "Days" },
                  { val: time.hours, label: "Hours" },
                  { val: time.minutes, label: "Min" },
                  { val: time.seconds, label: "Sec" },
                ].map((item, i) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <span className="text-3xl sm:text-4xl font-extrabold text-[#2563EB] tabular-nums">
                        {pad(item.val)}
                      </span>
                      <span className="text-xs text-slate-500 font-medium mt-1">
                        {item.label}
                      </span>
                    </div>
                    {i < 3 && (
                      <span className="text-2xl font-bold text-slate-300 -mt-4">
                        :
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2.5 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <MapPin size={15} className="text-[#2563EB] shrink-0" />
                {eventLocation}
              </div>
              <div className="flex items-center gap-2">
                <Mic size={15} className="text-[#2563EB] shrink-0" />
                {keynote}
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={15} className="text-[#2563EB] shrink-0" />
                {eventDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-1">
              <a
                href={featured?.id ? "#events" : "#events"}
                onClick={(e) => {
                  if (!featured?.id) return;
                  e.preventDefault();
                  setRegistering(true);
                }}
                className="glass-btn inline-flex items-center gap-2 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-opacity hover:opacity-90"
              >
                {featured?.id ? "Register Now" : "Check Events"}
                <ArrowRight size={14} />
              </a>
              <a
                href="#events"
                className="inline-flex items-center gap-2 border border-slate-300 bg-white hover:border-[#2563EB] text-slate-700 hover:text-[#2563EB] font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
              >
                View All Events
                <FileText size={14} />
              </a>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {["#WebDev", "#AI/ML", "#Robotics"].map((tag) => (
                <span
                  key={tag}
                  className="bg-blue-50 text-[#2563EB] text-xs font-semibold px-3 py-1.5 rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <EventRegisterModal
        event={
          registering && featured?.id
            ? {
                id: featured.id,
                title: eventTitle,
                category: featured.category ?? "SEMINAR",
                location: eventLocation,
                startDate: featured.startDate,
              }
            : null
        }
        onClose={() => setRegistering(false)}
      />
    </section>
  );
}
