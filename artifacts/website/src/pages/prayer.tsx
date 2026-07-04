import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { usePrayer, type PrayerRequest } from "@/context/PrayerContext";
import { BIBLE_VERSES } from "@/constants/ministry";
import { Button } from "@/components/ui/button";
import { Heart, Send, Clock, CheckCircle2, Globe, Lock, BookOpen } from "lucide-react";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function PrayerCard({ prayer }: { prayer: PrayerRequest }) {
  return (
    <div
      className={`flex flex-col gap-3 p-5 rounded-xl border transition-all ${
        prayer.isPrayed
          ? "bg-green-500/5 border-green-500/20 opacity-70"
          : "bg-card border-white/10"
      }`}
      data-testid={`prayer-card-${prayer.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <span className="text-primary font-bold text-sm">
              {prayer.isAnonymous ? "A" : prayer.name[0]?.toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-semibold text-white text-sm">{prayer.isAnonymous ? "Anonymous" : prayer.name}</p>
            <div className="flex items-center gap-1.5 text-xs text-white/40">
              <Clock size={10} />
              <span>{timeAgo(prayer.createdAt)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {prayer.isPublic ? (
            <Globe size={13} className="text-white/30" />
          ) : (
            <Lock size={13} className="text-white/30" />
          )}
          {prayer.isPrayed && (
            <div className="flex items-center gap-1 text-xs text-green-400">
              <CheckCircle2 size={13} />
              <span>Prayed</span>
            </div>
          )}
        </div>
      </div>
      <p className="text-white/70 leading-relaxed text-sm">{prayer.request}</p>
    </div>
  );
}

export default function Prayer() {
  const { prayers, submitPrayer } = usePrayer();
  const [verseIndex, setVerseIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    request: "",
    isAnonymous: false,
    isPublic: true,
  });

  useEffect(() => {
    const idx = Math.floor(Date.now() / 86400000) % BIBLE_VERSES.length;
    setVerseIndex(idx);
  }, []);

  const verse = BIBLE_VERSES[verseIndex];
  const publicPrayers = prayers.filter((p) => p.isPublic);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.request.trim()) return;
    submitPrayer({
      name: form.isAnonymous ? "Anonymous" : form.name || "Anonymous",
      request: form.request,
      isAnonymous: form.isAnonymous,
      isPublic: form.isPublic,
    });
    setSubmitted(true);
    setForm({ name: "", request: "", isAnonymous: false, isPublic: true });
    setTimeout(() => setSubmitted(false), 4000);
  }

  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <Navbar />

      <section className="pt-24 pb-12 bg-secondary/20 border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-black mb-4">
            <span className="text-white">Prayer</span> <span className="fire-gradient-text">Wall</span>
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Submit your prayer request and let the global Dahinchu Agni family stand with you in prayer.
          </p>
        </div>
      </section>

      <section className="py-8 border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6 max-w-2xl">
          <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-primary/10 border border-primary/20 text-center">
            <BookOpen size={20} className="text-primary" />
            <p className="text-white/90 font-medium italic leading-relaxed">"{verse.text}"</p>
            <p className="text-primary font-bold text-sm">— {verse.ref}</p>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto px-4 md:px-6 max-w-2xl">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Send size={20} className="text-primary" />
            Submit a Prayer Request
          </h2>

          {submitted ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center" data-testid="prayer-submitted">
              <CheckCircle2 size={48} className="text-green-400" />
              <p className="text-xl font-bold text-white">Prayer Submitted!</p>
              <p className="text-white/60">We are standing with you in prayer. God hears every prayer.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" data-testid="prayer-form">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={form.isAnonymous}
                  onChange={(e) => setForm((f) => ({ ...f, isAnonymous: e.target.checked }))}
                  className="w-4 h-4 accent-primary"
                />
                <label htmlFor="anonymous" className="text-white/80 text-sm cursor-pointer select-none">
                  Submit anonymously
                </label>
              </div>

              {!form.isAnonymous && (
                <input
                  type="text"
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 transition-colors"
                  data-testid="input-prayer-name"
                />
              )}

              <textarea
                placeholder="Share your prayer request..."
                value={form.request}
                onChange={(e) => setForm((f) => ({ ...f, request: e.target.value }))}
                required
                rows={5}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 transition-colors resize-none"
                data-testid="input-prayer-request"
              />

              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                <input
                  type="checkbox"
                  id="public"
                  checked={form.isPublic}
                  onChange={(e) => setForm((f) => ({ ...f, isPublic: e.target.checked }))}
                  className="w-4 h-4 accent-primary"
                />
                <label htmlFor="public" className="text-white/80 text-sm cursor-pointer select-none">
                  Show on public prayer wall (others can pray for you)
                </label>
              </div>

              <Button
                type="submit"
                className="bg-primary text-white hover:bg-primary/90 fire-glow h-12"
                data-testid="btn-submit-prayer"
              >
                <Send size={16} className="mr-2" />
                Submit Prayer Request
              </Button>
            </form>
          )}
        </div>
      </section>

      {publicPrayers.length > 0 && (
        <section className="py-10 border-t border-white/10">
          <div className="container mx-auto px-4 md:px-6 max-w-2xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Heart size={20} className="text-primary" />
              Community Prayer Wall
            </h2>
            <p className="text-white/50 text-sm mb-6">
              {publicPrayers.length} prayer{publicPrayers.length !== 1 ? "s" : ""} — join us in intercession
            </p>
            <div className="flex flex-col gap-4" data-testid="prayer-wall">
              {publicPrayers.map((p) => (
                <PrayerCard key={p.id} prayer={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
