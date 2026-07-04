import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useAdmin } from "@/context/AdminContext";
import { type MinistryEvent } from "@/constants/ministry";
import { Calendar, MapPin, Clock, X, ChevronRight, RefreshCw, ExternalLink } from "lucide-react";

const CATEGORY_LABELS: Record<MinistryEvent["category"], string> = {
  service: "Service", prayer: "Prayer", conference: "Conference",
  training: "Training", youth: "Youth", special: "Special",
};

const CATEGORY_COLORS: Record<MinistryEvent["category"], string> = {
  service: "bg-blue-100 text-blue-700 border-blue-200",
  prayer: "bg-purple-100 text-purple-700 border-purple-200",
  conference: "bg-primary/10 text-primary border-primary/20",
  training: "bg-yellow-100 text-yellow-700 border-yellow-200",
  youth: "bg-green-100 text-green-700 border-green-200",
  special: "bg-pink-100 text-pink-700 border-pink-200",
};

const ALL_CATEGORIES: Array<MinistryEvent["category"] | "all"> = [
  "all", "service", "prayer", "conference", "training", "youth", "special",
];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function EventModal({ event, onClose }: { event: MinistryEvent; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-card border border-border rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        data-testid="event-modal"
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${CATEGORY_COLORS[event.category]}`}>
            {CATEGORY_LABELS[event.category]}
          </span>
          <button onClick={onClose} className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" data-testid="btn-close-modal">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <h2 className="text-xl font-bold text-foreground leading-snug">{event.title}</h2>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center gap-2.5 text-muted-foreground"><Calendar size={14} className="text-primary shrink-0" />{formatDate(event.date)}</div>
            <div className="flex items-center gap-2.5 text-muted-foreground"><Clock size={14} className="text-primary shrink-0" />{event.time}{event.endTime ? ` – ${event.endTime}` : ""}</div>
            <div className="flex items-center gap-2.5 text-muted-foreground"><MapPin size={14} className="text-primary shrink-0" />{event.location}</div>
            {event.isRecurring && (
              <div className="flex items-center gap-2.5 text-muted-foreground"><RefreshCw size={14} className="text-primary shrink-0" />{event.recurringPattern}</div>
            )}
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">{event.description}</p>
          {event.registrationUrl && (
            <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
              data-testid="btn-register">
              Register Now <ExternalLink size={14} />
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

  const filtered = activeCategory === "all" ? events : events.filter((e) => e.category === activeCategory);
  const recurring = filtered.filter((e) => e.isRecurring);
  const upcoming = filtered.filter((e) => !e.isRecurring).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <AppShell subtitle="Events">
      {/* Category filter */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
              activeCategory === cat ? "bg-primary text-white border-primary" : "bg-card text-muted-foreground border-border"
            }`}
            data-testid={`filter-${cat}`}
          >
            {cat === "all" ? "All" : CATEGORY_LABELS[cat as MinistryEvent["category"]]}
          </button>
        ))}
      </div>

      <div className="px-4 pb-4 flex flex-col gap-5">
        {recurring.length > 0 && (
          <div>
            <p className="text-muted-foreground text-xs font-semibold uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
              <RefreshCw size={11} /> Regular Services
            </p>
            <div className="flex flex-col gap-2">
              {recurring.map((event) => (
                <button
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className="w-full text-left flex items-start justify-between gap-3 p-4 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all"
                  data-testid={`event-card-${event.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[event.category]}`}>
                        {CATEGORY_LABELS[event.category]}
                      </span>
                      <span className="text-muted-foreground text-[10px] flex items-center gap-1"><RefreshCw size={9} />{event.recurringPattern}</span>
                    </div>
                    <p className="text-foreground font-bold text-sm leading-snug line-clamp-2">{event.title}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-muted-foreground text-xs">
                      <span className="flex items-center gap-1"><Clock size={10} />{event.time}</span>
                      <span className="flex items-center gap-1"><MapPin size={10} />{event.location.split(",")[0]}</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground/40 shrink-0 mt-1" />
                </button>
              ))}
            </div>
          </div>
        )}

        {upcoming.length > 0 && (
          <div>
            <p className="text-muted-foreground text-xs font-semibold uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
              <Calendar size={11} /> Upcoming Events
            </p>
            <div className="flex flex-col gap-2">
              {upcoming.map((event) => (
                <button
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className="w-full text-left flex items-start justify-between gap-3 p-4 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all"
                  data-testid={`event-card-${event.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[event.category]}`}>
                        {CATEGORY_LABELS[event.category]}
                      </span>
                    </div>
                    <p className="text-foreground font-bold text-sm leading-snug line-clamp-2">{event.title}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-muted-foreground text-xs">
                      <span className="flex items-center gap-1"><Calendar size={10} />{formatDate(event.date)}</span>
                      <span className="flex items-center gap-1"><Clock size={10} />{event.time}</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground/40 shrink-0 mt-1" />
                </button>
              ))}
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
            <Calendar size={40} className="opacity-30" />
            <p>No events in this category</p>
          </div>
        )}
      </div>

      {selectedEvent && <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
    </AppShell>
  );
}
