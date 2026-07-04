import { useMemo, useState, useEffect } from "react";
import { useGetVideos, useGetLiveStream, getGetLiveStreamQueryKey } from "@workspace/api-client-react";
import { AppShell } from "@/components/AppShell";
import { MINISTRY } from "@/constants/ministry";
import { PlayCircle, ExternalLink, Loader2 } from "lucide-react";
import type { VideoItem } from "@workspace/api-client-react/src/generated/api.schemas";

const CHANNEL_ID = "UChxz3kSq1sw0pLD3Pg-Vj7w";

const TABS = ["All", "Sermons", "Teaching", "Lives", "Shorts"] as const;
type Tab = typeof TABS[number];

function parseDurationSeconds(dur?: string | null): number {
  if (!dur) return Infinity;
  const m = dur.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return Infinity;
  return (parseInt(m[1] || "0") * 3600) + (parseInt(m[2] || "0") * 60) + parseInt(m[3] || "0");
}

function getVideoCategory(v: VideoItem): string {
  const title = (v.title || "").toLowerCase();
  const secs = parseDurationSeconds(v.duration);
  if (secs > 0 && secs <= 65) return "short";
  if (title.includes("live") || title.includes("stream") || title.includes("broadcast")) return "live";
  if (title.includes("sermon") || title.includes("message") || title.includes("gospel") || title.includes("preach")) return "sermon";
  return "teaching";
}

function filterByTab(videos: VideoItem[], tab: Tab): VideoItem[] {
  if (tab === "All") return videos;
  const map: Record<Tab, string> = { All: "", Sermons: "sermon", Teaching: "teaching", Lives: "live", Shorts: "short" };
  return videos.filter((v) => getVideoCategory(v) === map[tab]);
}

export default function Media() {
  const [page, setPage] = useState(1);
  const [allVideos, setAllVideos] = useState<VideoItem[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("All");

  const { data: liveStatus } = useGetLiveStream(
    { channelId: CHANNEL_ID },
    { query: { refetchInterval: 60000, queryKey: getGetLiveStreamQueryKey({ channelId: CHANNEL_ID }) } }
  );

  const { data, isLoading, isFetching } = useGetVideos(
    { channelId: CHANNEL_ID, page },
    { query: { keepPreviousData: true } as any }
  );

  useEffect(() => {
    if (data?.videos) {
      setAllVideos((prev) => {
        const newVids = data.videos.filter((v) => !prev.some((p) => p.id === v.id));
        return [...prev, ...newVids];
      });
    }
  }, [data]);

  const filtered = useMemo(() => filterByTab(allVideos, activeTab), [allVideos, activeTab]);
  const hasMore = data?.hasMore ?? false;

  return (
    <AppShell subtitle="Media Center">
      {/* Live / No-live banner */}
      {isLoading ? (
        <div className="mx-4 mt-3 flex items-center gap-3 px-4 py-3 rounded-2xl bg-card border border-white/10">
          <Loader2 size={14} className="text-primary animate-spin shrink-0" />
          <p className="text-white/50 text-sm">Checking for live stream…</p>
        </div>
      ) : liveStatus?.isLive ? (
        <a
          href={`https://www.youtube.com/watch?v=${liveStatus.videoId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mx-4 mt-3 flex items-center gap-3 p-3.5 rounded-2xl overflow-hidden"
          style={{ background: "linear-gradient(90deg,#DC2626,#B91C1C)" }}
          data-testid="media-live-banner"
        >
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-bold tracking-widest uppercase">LIVE NOW</p>
            <p className="text-white/85 text-xs mt-0.5 truncate">{liveStatus.title}</p>
          </div>
          <div className="flex items-center gap-1 bg-white/20 rounded-lg px-2.5 py-1.5 shrink-0">
            <PlayCircle size={11} className="text-white" />
            <span className="text-white text-[10px] font-bold">Watch In App</span>
          </div>
        </a>
      ) : (
        <a
          href={`${MINISTRY.youtubeChannelUrl}/live`}
          target="_blank"
          rel="noopener noreferrer"
          className="mx-4 mt-3 flex items-center gap-3 px-4 py-3 rounded-2xl bg-card border border-white/10"
          data-testid="media-no-live"
        >
          <div className="w-2 h-2 rounded-full bg-white/30 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold">No Live Stream Right Now</p>
            <p className="text-white/50 text-xs mt-0.5">Tap to check our YouTube channel for upcoming streams</p>
          </div>
          <ExternalLink size={15} className="text-white/30 shrink-0" />
        </a>
      )}

      {/* Category Tabs */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeTab === tab
                ? "bg-primary text-white"
                : "bg-card border border-white/10 text-white/60"
            }`}
            data-testid={`tab-${tab.toLowerCase()}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Count */}
      {!isLoading && filtered.length > 0 && (
        <p className="px-4 text-white/40 text-xs mb-1">
          {filtered.length} video{filtered.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Video List */}
      <div className="px-4 flex flex-col gap-2.5 pb-4">
        {isLoading ? (
          <div className="flex flex-col items-center gap-3 py-12">
            <Loader2 size={28} className="text-primary animate-spin" />
            <p className="text-white/50 text-sm">Loading videos…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 rounded-2xl bg-card border border-white/10 border-dashed">
            <PlayCircle size={32} className="text-white/30" />
            <p className="text-white text-sm font-semibold">No {activeTab} videos yet</p>
            <p className="text-white/40 text-xs text-center px-8">
              {activeTab === "Lives" ? "Live streams will appear here when the channel goes live." : "More content coming soon."}
            </p>
          </div>
        ) : (
          <>
            {/* Featured */}
            {filtered[0] && (
              <a
                href={`https://www.youtube.com/watch?v=${filtered[0].id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-2xl overflow-hidden bg-card border border-white/10 group"
                data-testid={`media-featured-${filtered[0].id}`}
              >
                <div className="relative aspect-video">
                  <img src={filtered[0].thumbnailUrl} alt={filtered[0].title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-white font-bold text-sm leading-snug line-clamp-2">{filtered[0].title}</p>
                    <div className="flex items-center gap-3 mt-1 text-white/60 text-xs">
                      <span>{filtered[0].published ? new Date(filtered[0].published).toLocaleDateString() : ""}</span>
                      {filtered[0].viewCount && <span>{Number(filtered[0].viewCount).toLocaleString()} views</span>}
                    </div>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-0.5 rounded bg-primary text-white text-[10px] font-bold uppercase tracking-wide">Latest</span>
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayCircle size={22} className="text-white ml-0.5" />
                  </div>
                  {filtered[0].duration && (
                    <div className="absolute top-3 right-3 px-1.5 py-0.5 bg-black/70 rounded text-white text-[10px] font-medium">
                      {filtered[0].duration}
                    </div>
                  )}
                </div>
              </a>
            )}

            {/* Compact cards */}
            {filtered.slice(1).map((v) => (
              <a
                key={v.id}
                href={`https://www.youtube.com/watch?v=${v.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-3 p-2.5 rounded-2xl bg-card border border-white/10 group items-center"
                data-testid={`media-video-${v.id}`}
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
                  <div className="flex items-center gap-2 mt-1 text-white/40 text-xs">
                    <span>{v.published ? new Date(v.published).toLocaleDateString() : ""}</span>
                    {v.viewCount && <span>· {Number(v.viewCount).toLocaleString()} views</span>}
                  </div>
                </div>
              </a>
            ))}

            {/* Load More */}
            {hasMore && (
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={isFetching}
                className="py-3.5 rounded-2xl border border-white/10 text-primary text-sm font-semibold flex items-center justify-center gap-2"
                data-testid="btn-load-more"
              >
                {isFetching ? <Loader2 size={16} className="animate-spin" /> : "Load more videos"}
              </button>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
