"use client";
import { useEffect, useState } from "react";
import { Sparkles, Flame, Calendar } from "lucide-react";

interface RecommendedEvent {
  id: string;
  title: string;
  slug: string;
  category: string;
  tag: string;
  description: string;
  startDate: string;
  location: string;
  score: number;
  isFeatured: boolean;
}

interface RecommendResponse {
  personalized: boolean;
  fallback: boolean;
  events: RecommendedEvent[];
}

export default function RecommendedEventsRail() {
  const [data, setData] = useState<RecommendResponse | null>(null);

  useEffect(() => {
    // No email/interests provided pre-login, so the rail is populated in
    // fallback ("Popular this month") mode by the API.
    fetch(`/api/ai/recommend-events`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json: RecommendResponse | null) => {
        if (json && Array.isArray(json.events)) setData(json);
      })
      .catch(() => {});
  }, []);

  if (!data || data.events.length === 0) {
    return null;
  }

  const personalized = data.personalized;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-blue-50/50 flex items-center gap-2">
          {personalized ? (
            <Sparkles size={16} className="text-[#2563EB]" />
          ) : (
            <Flame size={16} className="text-[#2563EB]" />
          )}
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            {personalized ? "Recommended for you" : "Popular this month"}
          </h3>
        </div>
        <div className="divide-y divide-slate-100">
          {data.events.slice(0, 4).map((ev) => (
            <div
              key={ev.id}
              className="px-6 py-4 flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {ev.title}
                </p>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <Calendar size={12} />
                  {new Date(ev.startDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                  <span>·</span>
                  {ev.location}
                </p>
              </div>
              <span className="shrink-0 bg-blue-50 text-[#2563EB] text-xs font-bold px-3 py-1 rounded-md">
                {ev.category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
