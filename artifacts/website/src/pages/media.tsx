import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useGetVideos } from "@workspace/api-client-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlayCircle, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { VideoItem } from "@workspace/api-client-react/src/generated/api.schemas";

const CHANNEL_ID = "UChxz3kSq1sw0pLD3Pg-Vj7w";

export default function Media() {
  const [page, setPage] = useState(1);
  const [allVideos, setAllVideos] = useState<VideoItem[]>([]);
  
  const { data, isLoading, isFetching } = useGetVideos(
    { channelId: CHANNEL_ID, page },
    { query: { keepPreviousData: true } as any }
  );

  useEffect(() => {
    if (data?.videos) {
      setAllVideos(prev => {
        // Prevent duplicates
        const newVideos = data.videos.filter(v => !prev.some(p => p.id === v.id));
        return [...prev, ...newVideos];
      });
    }
  }, [data]);

  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <Navbar />

      <section className="pt-24 pb-12 bg-secondary/20 border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-black mb-4"><span className="text-white">Watch</span> <span className="fire-gradient-text">Sermons</span></h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Experience the power of God through our latest teachings, worship sessions, and prophetic messages.
          </p>
        </div>
      </section>

      <section className="py-16 flex-1">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allVideos.map((video) => (
              <a 
                key={video.id}
                href={`https://www.youtube.com/watch?v=${video.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col relative rounded-xl overflow-hidden bg-card border border-white/10 transition-all hover:border-primary/50 hover:shadow-[0_0_20px_rgba(232,76,30,0.15)] h-full"
                data-testid={`media-video-${video.id}`}
              >
                <div className="aspect-video relative shrink-0">
                  <img src={video.thumbnailUrl} alt={video.title} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                      <PlayCircle size={24} className="ml-1" />
                    </div>
                  </div>
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white text-xs rounded font-medium">
                      {video.duration}
                    </div>
                  )}
                  {video.isLive && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-red-600 text-white text-xs rounded font-bold uppercase tracking-wider">
                      Live Now
                    </div>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-white line-clamp-2 mb-2 group-hover:text-primary transition-colors flex-1">{video.title}</h3>
                  <div className="flex items-center text-xs text-white/50 mt-auto pt-2 border-t border-white/5">
                    <span>{new Date(video.publishedAt).toLocaleDateString()}</span>
                    {video.viewCount && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{Number(video.viewCount).toLocaleString()} views</span>
                      </>
                    )}
                  </div>
                </div>
              </a>
            ))}
            
            {isLoading && allVideos.length === 0 && (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <Skeleton className="aspect-video w-full rounded-xl bg-white/5" />
                  <Skeleton className="h-6 w-full bg-white/5" />
                  <Skeleton className="h-4 w-2/3 bg-white/5" />
                </div>
              ))
            )}
          </div>

          {data?.hasMore && (
            <div className="mt-16 flex justify-center">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary hover:text-white px-12 h-14 text-lg w-full md:w-auto"
                onClick={() => setPage(p => p + 1)}
                disabled={isFetching}
                data-testid="btn-load-more"
              >
                {isFetching ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More Sermons"
                )}
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
