import { useMemo, useState, useEffect, useCallback } from "react";
import { useGetVideos, useGetLiveStream, getGetLiveStreamQueryKey } from "@workspace/api-client-react";
import { AppShell } from "@/components/AppShell";
import { MINISTRY } from "@/constants/ministry";
import { PlayCircle, ExternalLink, Loader2, Radio, RefreshCw, Clock, Eye } from "lucide-react";
import type { VideoItem } from "@workspace/api-client-react/src/generated/api.schemas";

const CHANNEL_ID = "UChxz3kSq1sw0pLD3Pg-Vj7w";

// ── Category helpers ──────────────────────────────────────────────────────────
type Category = "All" | "Sermons" | "Teaching" | "Lives" | "Shorts";
const CATEGORIES: Category[] = ["All", "Sermons", "Teaching", "Lives", "Shorts"];

function getCategory(v: VideoItem): string {
  if (v.isLive) return "live";
  if (v.isShort) return "short";
  const t = v.title.toLowerCase();
  if (
    t.includes("sermon") || t.includes("message") || t.includes("gospel") ||
    t.includes("preach") || t.includes("prophecy") || t.includes("word of god") ||
    t.includes("holy spirit") || t.includes("worship")
  ) return "sermon";
  if (v.duration) {
    const p = v.duration.split(":");
    if (p.length === 2 && parseInt(p[0]) === 0 && parseInt(p[1]) <= 65) return "short";
    if (p.length >= 2) {
      const totalMins = p.length === 3
        ? parseInt(p[0]) * 60 + parseInt(p[1])
        : parseInt(p[0]);
      if (totalMins < 10) return "short";
    }
  }
  return "teaching";
}

function filterByCategory(videos: VideoItem[], cat: Category): VideoItem[] {
  if (cat === "All") return videos;
  const map: Record<Category, string> = {
    All: "", Sermons: "sermon", Teaching: "teaching", Lives: "live", Shorts: "short",
  };
  return videos.filter((v) => getCategory(v) === map[cat]);
}

// ── Formatters ────────────────────────────────────────────────────────────────
function safeDate(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const now = Date.now();
  const diff = now - d.getTime();
  const hrs = diff / 3_600_000;
  if (hrs < 1) return "Just now";
  if (hrs < 24) return `${Math.floor(hrs)}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function formatViews(v?: string | null): string {
  if (!v) return "";
  const n = parseInt(v);
  if (isNaN(n)) return "";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M views`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K views`;
  return `${n} views`;
}

function isNew(iso?: string | null): boolean {
  if (!iso) return false;
  return Date.now() - new Date(iso).getTime() < 48 * 3_600_000;
}

// ── Video Card Components ─────────────────────────────────────────────────────
function VideoBadges({ v }: { v: VideoItem }) {
  return (
    <>
      {v.isLive && (
        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 bg-red-600 rounded text-white text-[10px] font-bold uppercase tracking-wide">
          <Radio size={8} className="animate-pulse" /> LIVE
        </div>
      )}
      {v.isShort && !v.isLive && (
        <div className="absolute top-2 left-2 px-2 py-0.5 bg-purple-600/90 rounded text-white text-[10px] font-bold">#Short</div>
      )}
      {!v.isLive && !v.isShort && isNew(v.publishedAt) && (
        <div className="absolute top-2 left-2 px-2 py-0.5 bg-green-500/90 rounded text-white text-[10px] font-bold">NEW</div>
      )}
      {v.duration && !v.isLive && (
        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 rounded text-white text-[10px] font-medium">
          {v.duration}
        </div>
      )}
    </>
  );
}

// Full-width featured card (used for live + latest hero)
function FeaturedVideoCard({ v, badge }: { v: VideoItem; badge?: string }) {
  return (
    <a
      href={`https://www.youtube.com/watch?v=${v.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-2xl overflow-hidden bg-card border border-border group relative"
      data-testid={`video-featured-${v.id}`}
    >
      <div className="relative aspect-video">
        <img src={v.thumbnailUrl} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        <div className="absolute bottom-3 left-3 right-10">
          {badge && (
            <span className="inline-block mb-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-primary text-white uppercase tracking-wide">{badge}</span>
          )}
          <p className="text-white font-bold text-sm leading-snug line-clamp-2">{v.title}</p>
          <div className="flex items-center gap-3 mt-1 text-white/60 text-xs">
            <span className="flex items-center gap-1"><Clock size={9} />{safeDate(v.publishedAt)}</span>
            {v.viewCount && <span className="flex items-center gap-1"><Eye size={9} />{formatViews(v.viewCount)}</span>}
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
          <PlayCircle size={22} className="text-white ml-0.5" />
        </div>
        <VideoBadges v={v} />
      </div>
    </a>
  );
}

// Compact row card (thumbnail left, text right)
function RowVideoCard({ v }: { v: VideoItem }) {
  return (
    <a
      href={`https://www.youtube.com/watch?v=${v.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex gap-3 p-2.5 rounded-2xl group items-center transition-colors ${
        v.isLive ? "bg-red-50 border border-red-200" : "bg-card border border-border hover:border-primary/30"
      }`}
      data-testid={`video-row-${v.id}`}
    >
      <div className="relative w-28 aspect-video rounded-xl overflow-hidden shrink-0 bg-muted">
        <img src={v.thumbnailUrl} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <VideoBadges v={v} />
      </div>
      <div className="flex-1 min-w-0 py-0.5">
        <p className={`text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors ${
          v.isLive ? "text-red-700" : "text-foreground"
        }`}>{v.title}</p>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-xs text-muted-foreground">
          <span>{safeDate(v.publishedAt)}</span>
          {v.viewCount && <span>· {formatViews(v.viewCount)}</span>}
          {v.duration && !v.isLive && <span className="flex items-center gap-0.5"><Clock size={9} />{v.duration}</span>}
        </div>
      </div>
    </a>
  );
}

// Horizontal scroll card (for Latest Drops section)
function ScrollCard({ v }: { v: VideoItem }) {
  return (
    <a
      href={`https://www.youtube.com/watch?v=${v.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-52 shrink-0 group"
      data-testid={`video-scroll-${v.id}`}
    >
      <div className="relative aspect-video rounded-xl overflow-hidden bg-muted mb-2">
        <img src={v.thumbnailUrl} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-primary/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <PlayCircle size={16} className="text-white ml-0.5" />
        </div>
        <VideoBadges v={v} />
      </div>
      <p className="text-foreground text-xs font-semibold leading-snug line-clamp-2">{v.title}</p>
      <p className="text-muted-foreground text-[11px] mt-0.5">{safeDate(v.publishedAt)}</p>
    </a>
  );
}

// ── Main Media Page ───────────────────────────────────────────────────────────
export default function Media() {
  const [page, setPage] = useState(1);
  const [allVideos, setAllVideos] = useState<VideoItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  // Live status — poll every 30 seconds
  const { data: liveStatus, refetch: refetchLive } = useGetLiveStream(
    { channelId: CHANNEL_ID },
    {
      query: {
        refetchInterval: 30_000,
        staleTime: 0,
        queryKey: getGetLiveStreamQueryKey({ channelId: CHANNEL_ID }),
      },
    }
  );

  // Videos — poll every 90 seconds for freshness
  const { data, isLoading, isFetching, refetch: refetchVideos } = useGetVideos(
    { channelId: CHANNEL_ID, page },
    {
      query: {
        keepPreviousData: true,
        refetchInterval: page === 1 ? 90_000 : undefined,
        staleTime: 0,
      } as any,
    }
  );

  useEffect(() => {
    if (!data?.videos?.length) return;
    if (page === 1) {
      setAllVideos(data.videos);
    } else {
      setAllVideos((prev) => {
        const newOnes = data.videos.filter((v) => !prev.some((p) => p.id === v.id));
        return [...prev, ...newOnes];
      });
    }
  }, [data, page]);

  const handleRefresh = useCallback(() => {
    setPage(1);
    setAllVideos([]);
    setLastRefresh(Date.now());
    refetchLive();
    refetchVideos();
  }, [refetchLive, refetchVideos]);

  // Deduplicate and sort: live first, then by date
  const sortedVideos = useMemo(() => {
    const seen = new Set<string>();
    const unique = allVideos.filter((v) => { if (seen.has(v.id)) return false; seen.add(v.id); return true; });
    return unique.sort((a, b) => {
      if (a.isLive && !b.isLive) return -1;
      if (!a.isLive && b.isLive) return 1;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
  }, [allVideos]);

  const filtered = useMemo(() => filterByCategory(sortedVideos, activeCategory), [sortedVideos, activeCategory]);

  // Latest = newest 6 non-live non-short videos (for horizontal scroll)
  const latestDrop = useMemo(
    () => sortedVideos.filter((v) => !v.isLive && !v.isShort).slice(0, 6),
    [sortedVideos]
  );

  // Live videos
  const liveVideos = useMemo(() => sortedVideos.filter((v) => v.isLive), [sortedVideos]);

  const hasMore = data?.hasMore ?? false;
  const videoCount = filtered.length;

  return (
    <AppShell subtitle="Media">
      {/* ── Live Hero ── */}
      {liveStatus?.isLive ? (
        <div className="mx-4 mt-3">
          <a
            href={liveStatus.videoId
              ? `https://www.youtube.com/watch?v=${liveStatus.videoId}`
              : `${MINISTRY.youtubeChannelUrl}/live`}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-2xl overflow-hidden relative group"
            style={{ background: "linear-gradient(135deg,#DC2626,#7F1D1D)" }}
            data-testid="media-live-hero"
          >
            {liveStatus.thumbnailUrl && (
              <img
                src={liveStatus.thumbnailUrl}
                alt="Live"
                className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity"
              />
            )}
            <div className="relative p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600 border border-white/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span className="text-white text-[10px] font-bold tracking-widest">LIVE NOW</span>
                </div>
                <span className="text-white/60 text-xs">Dahinchu Agni Ministries</span>
              </div>
              <p className="text-white font-black text-lg leading-tight">
                {liveStatus.title ?? "Live Service"}
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white font-bold text-red-700 text-sm justify-center">
                  <PlayCircle size={16} />
                  Watch Live Now
                </div>
                <div className="flex items-center gap-1 px-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white/80 text-xs">
                  <Radio size={12} className="animate-pulse text-red-300" />
                  <span className="font-medium">On Air</span>
                </div>
              </div>
            </div>
          </a>
        </div>
      ) : (
        <a
          href={`${MINISTRY.youtubeChannelUrl}/live`}
          target="_blank"
          rel="noopener noreferrer"
          className="mx-4 mt-3 flex items-center gap-3 px-4 py-3 rounded-2xl bg-card border border-border"
          data-testid="media-no-live"
        >
          <div className="w-2 h-2 rounded-full bg-muted-foreground/30 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-foreground text-sm font-semibold">Not Live Right Now</p>
            <p className="text-muted-foreground text-xs">Tap to check YouTube · checks every 30s</p>
          </div>
          <ExternalLink size={14} className="text-muted-foreground/40 shrink-0" />
        </a>
      )}

      {/* ── Live videos in current list (from video feed) ── */}
      {!liveStatus?.isLive && liveVideos.length > 0 && (
        <div className="mx-4 mt-3 flex flex-col gap-2">
          {liveVideos.map((v) => (
            <a
              key={v.id}
              href={`https://www.youtube.com/watch?v=${v.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-2xl bg-red-50 border border-red-200 group"
            >
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-600 shrink-0">
                <Radio size={10} className="text-white animate-pulse" />
                <span className="text-white text-[10px] font-bold">LIVE</span>
              </div>
              <p className="flex-1 text-red-800 text-sm font-semibold truncate">{v.title}</p>
              <PlayCircle size={16} className="text-red-500 shrink-0" />
            </a>
          ))}
        </div>
      )}

      {/* ── Refresh bar ── */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <p className="text-muted-foreground text-xs">
          {isLoading ? "Loading…" : `${sortedVideos.length} videos`}
          {isFetching && !isLoading && <span className="ml-1 opacity-60">· refreshing</span>}
        </p>
        <button
          onClick={handleRefresh}
          disabled={isFetching}
          className="flex items-center gap-1.5 text-xs text-primary font-medium py-1 px-2 rounded-lg hover:bg-primary/10 transition-colors"
          data-testid="btn-refresh"
        >
          <RefreshCw size={12} className={isFetching ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ── Latest Drops horizontal scroll ── */}
      {latestDrop.length > 0 && activeCategory === "All" && (
        <div className="mt-1">
          <div className="flex items-center justify-between px-4 mb-2">
            <h2 className="text-foreground font-black text-base">✨ Latest Drops</h2>
            <span className="text-muted-foreground text-xs">{latestDrop.length} newest</span>
          </div>
          <div className="flex gap-3 px-4 pb-2 overflow-x-auto no-scrollbar">
            {latestDrop.map((v) => <ScrollCard key={v.id} v={v} />)}
          </div>
        </div>
      )}

      {/* ── Category filter tabs ── */}
      <div className="flex gap-2 px-4 pt-2 pb-2 overflow-x-auto no-scrollbar">
        {CATEGORIES.map((cat) => {
          const count = filterByCategory(sortedVideos, cat).length;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "bg-primary text-white shadow-sm"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
              }`}
              data-testid={`tab-${cat.toLowerCase()}`}
            >
              {cat}
              {count > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeCategory === cat ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Video list ── */}
      <div className="px-4 flex flex-col gap-2 pb-4">
        {isLoading ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <Loader2 size={28} className="text-primary animate-spin" />
            <p className="text-muted-foreground text-sm">Loading videos from YouTube…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 rounded-2xl bg-card border border-border border-dashed">
            <PlayCircle size={32} className="text-muted-foreground/40" />
            <p className="text-foreground text-sm font-semibold">No {activeCategory} videos yet</p>
            <p className="text-muted-foreground text-xs text-center px-8 leading-relaxed">
              {activeCategory === "Lives"
                ? "Live streams will appear here. The page checks every 30 seconds."
                : "Try a different category or refresh."}
            </p>
          </div>
        ) : (
          <>
            {/* Featured first video (full width) */}
            <FeaturedVideoCard
              v={filtered[0]}
              badge={filtered[0].isLive ? "🔴 Live" : activeCategory === "All" ? "Latest" : activeCategory}
            />

            {/* Rest as compact rows */}
            {filtered.slice(1).map((v) => <RowVideoCard key={v.id} v={v} />)}

            {/* Load more */}
            {hasMore && (
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={isFetching}
                className="mt-2 py-3.5 rounded-2xl border border-border text-primary text-sm font-semibold flex items-center justify-center gap-2 bg-card hover:bg-muted transition-colors"
                data-testid="btn-load-more"
              >
                {isFetching ? (
                  <><Loader2 size={16} className="animate-spin" /> Loading more…</>
                ) : (
                  "Load older videos"
                )}
              </button>
            )}

            {/* YouTube channel link */}
            <a
              href={MINISTRY.youtubeChannelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 rounded-2xl text-muted-foreground text-sm hover:text-primary transition-colors"
            >
              <ExternalLink size={14} />
              View full channel on YouTube
            </a>
          </>
        )}
      </div>
    </AppShell>
  );
}
