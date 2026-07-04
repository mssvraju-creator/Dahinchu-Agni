import { useState } from "react";
import { Link } from "wouter";
import { useGetLiveStream, useGetVideos, getGetLiveStreamQueryKey } from "@workspace/api-client-react";
import { AppShell } from "@/components/AppShell";
import { useAdmin } from "@/context/AdminContext";
import { MINISTRY, BIBLE_VERSES, type MinistryEvent } from "@/constants/ministry";
import { PlayCircle, Gift, Heart, BookOpen, ExternalLink, Calendar, MapPin, Clock, Tv, Bell } from "lucide-react";

const CHANNEL_ID = "UChxz3kSq1sw0pLD3Pg-Vj7w";

const DAY_TO_NUM: Record<string, number> = {
  sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
  thursday: 4, friday: 5, saturday: 6,
};

function getNextOccurrenceDate(event: MinistryEvent): string {
  if (!event.isRecurring) return event.date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(event.date + "T00:00:00");
  if (eventDate >= today) return event.date;
  const pattern = (event.recurringPattern || "").toLowerCase();
  for (const [dayName, dayNum] of Object.entries(DAY_TO_NUM)) {
    if (pattern.includes(dayName)) {
      const diff = (dayNum - today.getDay() + 7) % 7 || 7;
      const next = new Date(today);
      next.setDate(today.getDate() + diff);
      return next.toISOString().split("T")[0];
    }
  }
  let d = new Date(eventDate);
  while (d < today) d.setDate(d.getDate() + 7);
  return d.toISOString().split("T")[0];
}

function formatShortDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" });
}

export default function Home() {
  const { data: liveStatus } = useGetLiveStream(
    { channelId: CHANNEL_ID },
    { query: { refetchInterval: 60000, queryKey: getGetLiveStreamQueryKey({ channelId: CHANNEL_ID }) } }
  );
  const { data: videosData, isLoading: videosLoading } = useGetVideos({ channelId: CHANNEL_ID, page: 1 });
  const { events, adminSettings } = useAdmin();

  const verse = BIBLE_VERSES[new Date().getDate() % BIBLE_VERSES.length];
  const latestVideos = videosData?.videos.slice(0, 5) ?? [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingEvents = events
    .map((e) => ({ ...e, date: getNextOccurrenceDate(e) }))
    .filter((e) => new Date(e.date + "T00:00:00") >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  return (
    <AppShell>
      {/* Notice Banner */}
      {adminSettings.noticeText ? (
        <div className="mx-4 mt-3 flex items-start gap-2 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200">
          <Bell size={13} className="text-orange-500 shrink-0 mt-0.5" />
          <p className="text-amber-900 text-xs leading-relaxed">{adminSettings.noticeText}</p>
        </div>
      ) : null}

      {/* Live Banner */}
      {liveStatus?.isLive ? (
        <a
          href={`https://www.youtube.com/watch?v=${liveStatus.videoId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mx-4 mt-3 flex items-center gap-3 p-3.5 rounded-2xl overflow-hidden relative"
          style={{ background: "linear-gradient(90deg,#DC2626,#991B1B)" }}
          data-testid="banner-live-now"
        >
          <div className="relative flex items-center justify-center w-7 h-7">
            <div className="absolute inset-0 rounded-full border-2 border-white/40" />
            <div className="w-3 h-3 rounded-full bg-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white/90 text-[10px] font-bold tracking-[1.5px] uppercase mb-0.5">🔴 Live Now</p>
            <p className="text-white text-sm font-bold truncate">{liveStatus.title ?? "Live Service"}</p>
            <p className="text-white/70 text-xs mt-0.5">Tap to watch • Dahinchu Agni</p>
          </div>
          <div className="flex items-center gap-1 bg-white rounded-lg px-2.5 py-1.5 shrink-0">
            <PlayCircle size={12} className="text-red-600" />
            <span className="text-red-600 text-xs font-bold">Watch</span>
          </div>
        </a>
      ) : (
        <a
          href={`${MINISTRY.youtubeChannelUrl}/live`}
          target="_blank"
          rel="noopener noreferrer"
          className="mx-4 mt-3 flex items-center gap-3 px-4 py-3 rounded-2xl bg-card border border-white/10"
        >
          <div className="w-2 h-2 rounded-full bg-white/30 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold">No Live Stream Right Now</p>
            <p className="text-white/50 text-xs mt-0.5">Tap to check our YouTube channel</p>
          </div>
          <ExternalLink size={15} className="text-white/30 shrink-0" />
        </a>
      )}

      {/* Bible Verse Card */}
      <div
        className="mx-4 mt-3 rounded-2xl px-5 py-4 border border-amber-200"
        style={{ background: "linear-gradient(135deg,#FFF7ED,#FFECD2,#FFF7ED)" }}
        data-testid="verse-card"
      >
        <BookOpen size={15} className="text-orange-500 mb-2" />
        <p className="text-amber-900 text-[14px] leading-[22px] italic mb-2.5">"{verse.text}"</p>
        <p className="text-primary text-xs font-semibold">{verse.ref}</p>
      </div>

      {/* Stats Row */}
      <div className="flex gap-2 mx-4 mt-3">
        {MINISTRY.stats.map((s) => (
          <div
            key={s.label}
            className="flex-1 flex flex-col items-center gap-0.5 py-3 rounded-2xl bg-card border border-white/10"
          >
            <span className="text-primary text-lg font-black">{s.number}</span>
            <span className="text-white/50 text-[9px] uppercase tracking-wide text-center leading-tight">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2.5 mx-4 mt-3">
        <a
          href={liveStatus?.isLive ? `https://www.youtube.com/watch?v=${liveStatus.videoId}` : `${MINISTRY.youtubeChannelUrl}/live`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-red-600 font-semibold text-white text-sm"
          data-testid="btn-watch-live"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-white" />
          Watch Live
        </a>
        <Link href="/give" className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl font-semibold text-white text-sm" style={{ backgroundColor: "#C8860A" }} data-testid="btn-give">
          <Gift size={14} className="text-white" />
          Give
        </Link>
        <Link href="/prayer" className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl font-semibold text-white text-sm" style={{ backgroundColor: "#7C3AED" }} data-testid="btn-prayer">
          <Heart size={14} className="text-white" />
          Prayer
        </Link>
      </div>

      {/* Latest Messages */}
      <div className="mx-4 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white text-xl font-black">Latest Messages</h2>
          <Link href="/media" className="text-primary text-sm font-medium">See all</Link>
        </div>

        {videosLoading ? (
          <div className="rounded-2xl bg-card border border-white/10 p-5 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-white/50 text-sm ml-3">Loading messages…</span>
          </div>
        ) : latestVideos.length === 0 ? (
          <div className="rounded-2xl bg-card border border-white/10 border-dashed p-6 flex flex-col items-center gap-2">
            <PlayCircle size={28} className="text-white/30" />
            <p className="text-white text-sm font-semibold">No videos loaded</p>
            <a href={MINISTRY.youtubeChannelUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 mt-1 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold">
              <ExternalLink size={12} />
              Open YouTube Channel
            </a>
          </div>
        ) : (
          <>
            {/* Featured video */}
            <a
              href={`https://www.youtube.com/watch?v=${latestVideos[0].id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-2xl overflow-hidden bg-card border border-white/10 mb-2.5 group"
              data-testid={`video-featured-${latestVideos[0].id}`}
            >
              <div className="relative aspect-video">
                <img src={latestVideos[0].thumbnailUrl} alt={latestVideos[0].title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-white font-bold text-sm leading-snug line-clamp-2">{latestVideos[0].title}</p>
                  <p className="text-white/60 text-xs mt-1">{latestVideos[0].published ? new Date(latestVideos[0].published).toLocaleDateString() : ""}</p>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <PlayCircle size={22} className="text-white ml-0.5" />
                </div>
                {latestVideos[0].duration && (
                  <div className="absolute bottom-3 right-3 px-1.5 py-0.5 bg-black/70 rounded text-white text-xs font-medium">
                    {latestVideos[0].duration}
                  </div>
                )}
              </div>
            </a>

            {/* Compact video cards */}
            <div className="flex flex-col gap-2">
              {latestVideos.slice(1, 4).map((v) => (
                <a
                  key={v.id}
                  href={`https://www.youtube.com/watch?v=${v.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex gap-3 p-2.5 rounded-2xl bg-card border border-white/10 group items-center"
                  data-testid={`video-card-${v.id}`}
                >
                  <div className="relative w-28 aspect-video rounded-xl overflow-hidden shrink-0">
                    <img src={v.thumbnailUrl} alt={v.title} className="w-full h-full object-cover" />
                    {v.duration && (
                      <div className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/80 rounded text-white text-[9px] font-medium">
                        {v.duration}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 py-0.5">
                    <p className="text-white text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">{v.title}</p>
                    <p className="text-white/40 text-xs mt-1">{v.published ? new Date(v.published).toLocaleDateString() : ""}</p>
                  </div>
                </a>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Upcoming Events */}
      <div className="mx-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white text-xl font-black">Upcoming Events</h2>
          <Link href="/events" className="text-primary text-sm font-medium">See all</Link>
        </div>

        {upcomingEvents.length === 0 ? (
          <div className="rounded-2xl bg-card border border-white/10 border-dashed p-6 flex flex-col items-center gap-2">
            <Calendar size={28} className="text-white/30" />
            <p className="text-white text-sm font-semibold">No upcoming events</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {upcomingEvents.map((e) => (
              <Link
                key={e.id}
                href="/events"
                className="flex gap-3 p-3.5 rounded-2xl bg-card border border-white/10 items-start"
                data-testid={`event-card-home-${e.id}`}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                  <Calendar size={18} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold leading-snug line-clamp-1">{e.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-white/50 text-xs">
                    <span className="flex items-center gap-1"><Clock size={10} />{formatShortDate(e.date)}</span>
                    <span className="flex items-center gap-1"><MapPin size={10} />{e.location.split(",")[0]}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Calvary TV Banner */}
      <div className="mx-4 mt-4 mb-4">
        <a
          href={MINISTRY.youtubeChannelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-4 rounded-2xl"
          style={{ background: "linear-gradient(90deg,#1C1C1C,#2D1515)" }}
          data-testid="calvary-tv-banner"
        >
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#E84C1E22" }}>
            <Tv size={20} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-bold">Calvary TV Ministry</p>
            <p className="text-white/60 text-xs mt-0.5">Watch Sunday services, Pastor's meetings & live programs</p>
          </div>
          <ExternalLink size={16} className="text-primary shrink-0" />
        </a>
      </div>
    </AppShell>
  );
}
