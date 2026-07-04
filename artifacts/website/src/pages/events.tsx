import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAdmin } from "@/context/AdminContext";
import { type MinistryEvent } from "@/constants/ministry";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, X, ChevronRight, RefreshCw, ExternalLink, Filter } from "lucide-react";

const CATEGORY_LABELS: Record<MinistryEvent["category"], string> = {
  service: "Service",
  prayer: "Prayer",
  conference: "Conference",
  training: "Training",
  youth: "Youth",
  special: "Special",
};

const CATEGORY_COLORS: Record<MinistryEvent["category"], string> = {
  service: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  prayer: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  conference: "bg-primary/20 text-primary border-primary/30",
  training: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  youth: "bg-green-500/20 text-green-400 border-green-500/30",
  special: "bg-pink-500/20 text-pink-400 border-pink-500/30",
};

const ALL_CATEGORIES: Array<MinistryEvent["category"] | "all"> = [
  "all", "service", "prayer", "conference", "training", "youth", "special",
];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function EventCard({ event, onClick }: { event: MinistryEvent; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left group flex flex-col gap-3 p-5 rounded-xl bg-card border border-white/10 hover:border-primary/40 hover:shadow-[0_0_20px_rgba(232,76,30,0.1)] transition-all"
      data-testid={`event-card-${event.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[event.category]}`}>
              {CATEGORY_LABELS[event.category]}
            </span>
            {event.isRecurring && (
              <span className="flex items-center gap-1 text-xs text-white/50">
                <RefreshCw size={10} />
                {event.recurringPattern}
              </span>
            )}
          </div>
          <h3 className="font-bold text-white text-lg leading-tight mt-1 group-hover:text-primary transition-colors line-clamp-2">
            {event.title}
          </h3>
        </div>
        <ChevronRight size={18} className="text-white/30 group-hover:text-primary transition-colors shrink-0 mt-1" />
      </div>

      <div className="flex flex-col gap-1.5 text-sm text-white/60">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-primary shrink-0" />
          <span>{formatDate(event.date)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-primary shrink-0" />
          <span>{event.time}{event.endTime ? ` – ${event.endTime}` : ""}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-primary shrink-0" />
          <span className="line-clamp-1">{event.location}</span>
        </div>
      </div>
    </button>
  );
}

function EventModal({ event, onClose }: { event: MinistryEvent; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-card border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        data-testid="event-modal"
      >
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${CATEGORY_COLORS[event.category]}`}>
            {CATEGORY_LABELS[event.category]}
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            data-testid="btn-close-modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-white">{event.title}</h2>

          <div className="flex flex-col gap-2.5 text-sm">
            <div className="flex items-center gap-3 text-white/70">
              <Calendar size={16} className="text-primary shrink-0" />
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-3 text-white/70">
              <Clock size={16} className="text-primary shrink-0" />
              <span>{event.time}{event.endTime ? ` – ${event.endTime}` : ""}</span>
            </div>
            <div className="flex items-center gap-3 text-white/70">
              <MapPin size={16} className="text-primary shrink-0" />
              <span>{event.location}</span>
            </div>
            {event.isRecurring && (
              <div className="flex items-center gap-3 text-white/70">
                <RefreshCw size={16} className="text-primary shrink-0" />
                <span>{event.recurringPattern}</span>
              </div>
            )}
          </div>

          <p className="text-white/70 leading-relaxed">{event.description}</p>

          {event.registrationUrl && (
            <a
              href={event.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors fire-glow"
              data-testid="btn-register"
            >
              Register Now
              <ExternalLink size={16} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Events() {
  const { events } = useAdmin();
  const [activeCategory, setActiveCategory] = useState<MinistryEvent["category"] | "all">("all");
  const [selectedEvent, setSelectedEvent] = useState<MinistryEvent | null>(null);

  const filtered = activeCategory === "all"
    ? events
    : events.filter((e) => e.category === activeCategory);

  const recurring = filtered.filter((e) => e.isRecurring);
  const upcoming = filtered.filter((e) => !e.isRecurring).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <Navbar />

      <section className="pt-24 pb-12 bg-secondary/20 border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-black mb-4">
            <span className="text-white">Ministry</span> <span className="fire-gradient-text">Events</span>
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Join us for worship, prayer, training, and revival. All are welcome to come and experience the fire of God.
          </p>
        </div>
      </section>

      <div className="sticky top-20 z-10 bg-background/95 backdrop-blur-sm border-b border-white/10 py-3">
        <div className="container mx-auto px-4 md:px-6 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <Filter size={14} className="text-white/40 shrink-0 mr-1" />
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                activeCategory === cat
                  ? "bg-primary text-white border-primary"
                  : "bg-white/5 text-white/60 border-white/10 hover:border-white/30"
              }`}
              data-testid={`filter-${cat}`}
            >
              {cat === "all" ? "All Events" : CATEGORY_LABELS[cat as MinistryEvent["category"]]}
            </button>
          ))}
        </div>
      </div>

      <section className="py-12 flex-1">
        <div className="container mx-auto px-4 md:px-6 flex flex-col gap-12">
          {recurring.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
                <RefreshCw size={18} className="text-primary" />
                Regular Services
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recurring.map((event) => (
                  <EventCard key={event.id} event={event} onClick={() => setSelectedEvent(event)} />
                ))}
              </div>
            </div>
          )}

          {upcoming.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
                <Calendar size={18} className="text-primary" />
                Upcoming Events
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcoming.map((event) => (
                  <EventCard key={event.id} event={event} onClick={() => setSelectedEvent(event)} />
                ))}
              </div>
            </div>
          )}

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-white/40 gap-3">
              <Calendar size={48} className="opacity-30" />
              <p className="text-lg">No events in this category</p>
            </div>
          )}
        </div>
      </section>

      {selectedEvent && (
        <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}

      <Footer />
    </div>
  );
}
