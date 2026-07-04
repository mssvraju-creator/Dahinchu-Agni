import { useState, useEffect } from "react";
import { AppShell } from "@/components/AppShell";
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
      className={`flex flex-col gap-3 p-4 rounded-2xl border transition-all ${
        prayer.isPrayed ? "bg-green-500/5 border-green-500/20 opacity-70" : "bg-card border-white/10"
      }`}
      data-testid={`prayer-card-${prayer.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <span className="text-primary font-bold text-sm">{prayer.isAnonymous ? "A" : prayer.name[0]?.toUpperCase()}</span>
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
          {prayer.isPublic ? <Globe size={12} className="text-white/30" /> : <Lock size={12} className="text-white/30" />}
          {prayer.isPrayed && (
            <div className="flex items-center gap-1 text-xs text-green-400">
              <CheckCircle2 size={12} />
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
  const [form, setForm] = useState({ name: "", request: "", isAnonymous: false, isPublic: true });

  useEffect(() => {
    setVerseIndex(Math.floor(Date.now() / 86400000) % BIBLE_VERSES.length);
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
    <AppShell subtitle="Prayer Wall">
      {/* Verse */}
      <div
        className="mx-4 mt-4 rounded-2xl px-5 py-4 border border-amber-200 flex flex-col gap-2"
        style={{ background: "linear-gradient(135deg,#FFF7ED,#FFECD2,#FFF7ED)" }}
      >
        <BookOpen size={15} className="text-orange-500" />
        <p className="text-amber-900 text-sm leading-relaxed italic">"{verse.text}"</p>
        <p className="text-primary text-xs font-semibold">— {verse.ref}</p>
      </div>

      {/* Submit form */}
      <div className="mx-4 mt-4">
        <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <Send size={11} /> Submit a Prayer Request
        </p>

        {submitted ? (
          <div className="flex flex-col items-center gap-3 py-10 rounded-2xl bg-card border border-white/10 text-center" data-testid="prayer-submitted">
            <CheckCircle2 size={40} className="text-green-400" />
            <p className="text-lg font-bold text-white">Prayer Submitted!</p>
            <p className="text-white/50 text-sm">We are standing with you in prayer.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3" data-testid="prayer-form">
            <label className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-card border border-white/10 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isAnonymous}
                onChange={(e) => setForm((f) => ({ ...f, isAnonymous: e.target.checked }))}
                className="w-4 h-4 accent-primary"
              />
              <span className="text-white/70 text-sm">Submit anonymously</span>
            </label>

            {!form.isAnonymous && (
              <input
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="input-field"
                data-testid="input-prayer-name"
              />
            )}

            <textarea
              placeholder="Share your prayer request..."
              value={form.request}
              onChange={(e) => setForm((f) => ({ ...f, request: e.target.value }))}
              required
              rows={4}
              className="input-field resize-none"
              data-testid="input-prayer-request"
            />

            <label className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-card border border-white/10 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isPublic}
                onChange={(e) => setForm((f) => ({ ...f, isPublic: e.target.checked }))}
                className="w-4 h-4 accent-primary"
              />
              <span className="text-white/70 text-sm">Show on public prayer wall</span>
            </label>

            <Button type="submit" className="bg-primary text-white hover:bg-primary/90 fire-glow h-12 rounded-2xl" data-testid="btn-submit-prayer">
              <Send size={15} className="mr-2" />
              Submit Prayer Request
            </Button>
          </form>
        )}
      </div>

      {/* Community wall */}
      {publicPrayers.length > 0 && (
        <div className="mx-4 mt-6 pb-4">
          <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Heart size={11} /> Community Prayer Wall · {publicPrayers.length}
          </p>
          <div className="flex flex-col gap-2.5" data-testid="prayer-wall">
            {publicPrayers.map((p) => <PrayerCard key={p.id} prayer={p} />)}
          </div>
        </div>
      )}
    </AppShell>
  );
}
