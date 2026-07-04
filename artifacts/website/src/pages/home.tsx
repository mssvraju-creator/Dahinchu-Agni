import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useGetLiveStream, useGetVideos, useGetNotificationStats, getGetLiveStreamQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Flame, PlayCircle, ArrowRight, Video, Radio, Users, Calendar, Heart, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BIBLE_VERSES } from "@/constants/ministry";

const CHANNEL_ID = "UChxz3kSq1sw0pLD3Pg-Vj7w";

export default function Home() {
  const { data: liveStatus, isLoading: isLiveLoading } = useGetLiveStream(
    { channelId: CHANNEL_ID },
    { query: { refetchInterval: 60000, queryKey: getGetLiveStreamQueryKey({ channelId: CHANNEL_ID }) } }
  );

  const { data: videosData, isLoading: isVideosLoading } = useGetVideos({ channelId: CHANNEL_ID, page: 1 });
  const { data: statsData } = useGetNotificationStats();

  const recentVideos = videosData?.videos.slice(0, 3) || [];

  const dailyVerse = BIBLE_VERSES[Math.floor(Date.now() / 86400000) % BIBLE_VERSES.length];

  return (
    <div className="min-h-screen flex flex-col w-full bg-background overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-20 pb-32">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background/50 to-background" />
        </div>

        <div className="container mx-auto px-4 relative z-20 flex flex-col items-center text-center">
          {isLiveLoading ? (
            <Skeleton className="h-8 w-48 mb-8 rounded-full bg-white/10" />
          ) : liveStatus?.isLive ? (
            <a 
              href={`https://www.youtube.com/watch?v=${liveStatus.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 text-red-500 border border-red-500/50 mb-8 animate-pulse"
              data-testid="banner-live-now"
            >
              <Radio size={18} />
              <span className="font-bold text-sm tracking-widest uppercase">Live Now</span>
              {liveStatus.title && <span className="text-white/80 hidden md:inline ml-2 truncate max-w-xs">- {liveStatus.title}</span>}
            </a>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 text-white/70">
              <Flame size={18} className="text-primary" />
              <span className="font-medium text-sm tracking-widest uppercase">Spirit-Filled Ministry</span>
            </div>
          )}

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-none mb-6">
            <span className="block text-white">CONSUMING FIRE</span>
            <span className="block fire-gradient-text">IGNITING NATIONS</span>
          </h1>

          <p className="text-lg md:text-xl text-white/70 max-w-2xl mb-12 font-medium">
            Welcome to Dahinchu Agni Ministries. A global movement of passionate worship, prophetic preaching, and radical encounter with the Holy Spirit.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/media">
              <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 bg-primary text-white hover:bg-primary/90 fire-glow" data-testid="btn-hero-watch">
                <PlayCircle className="mr-2 h-5 w-5" />
                Watch Latest Sermons
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8 border-white/20 hover:bg-white/10" data-testid="btn-hero-about">
                Our Story
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Daily Verse */}
      <section className="py-10 border-b border-white/10 bg-secondary/10">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Verse of the Day</p>
          <blockquote className="text-lg md:text-xl text-white/85 font-medium italic leading-relaxed mb-3">
            "{dailyVerse.text}"
          </blockquote>
          <p className="text-primary font-bold">— {dailyVerse.ref}</p>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-14 border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { href: "/events", icon: Calendar, label: "Events", desc: "Services & gatherings" },
              { href: "/prayer", icon: Heart, label: "Prayer Wall", desc: "Submit a prayer request" },
              { href: "/resources", icon: BookOpen, label: "Resources", desc: "Free study materials" },
              { href: "/give", icon: Flame, label: "Give", desc: "Partner with this ministry" },
            ].map(({ href, icon: Icon, label, desc }) => (
              <Link key={href} href={href}>
                <div className="group flex flex-col items-center gap-2 p-5 rounded-2xl bg-card border border-white/10 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer text-center h-full" data-testid={`quick-link-${label.toLowerCase().replace(" ", "-")}`}>
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-1 group-hover:bg-primary/30 transition-colors">
                    <Icon size={22} className="text-primary" />
                  </div>
                  <p className="font-bold text-white text-sm group-hover:text-primary transition-colors">{label}</p>
                  <p className="text-xs text-white/50">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Mission / About Snippet */}
      <section className="py-24 bg-secondary/10 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">More Than a Church.<br/>A <span className="fire-gradient-text">Movement.</span></h2>
              <p className="text-white/70 text-lg mb-6 leading-relaxed">
                Dahinchu Agni means "Consuming Fire." We believe in the undeniable power of God to transform lives, heal the sick, and ignite hearts with a passion for His presence.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-white/80">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <Flame size={18} />
                  </div>
                  Passionate Worship
                </li>
                <li className="flex items-center gap-3 text-white/80">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <Video size={18} />
                  </div>
                  Global Live Streams
                </li>
                <li className="flex items-center gap-3 text-white/80">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <Users size={18} />
                  </div>
                  Community of Believers
                </li>
              </ul>
              <Link href="/about">
                <Button variant="link" className="text-primary hover:text-primary/80 p-0 h-auto font-bold text-lg group" data-testid="btn-read-more">
                  Read Our Vision <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent mix-blend-overlay" />
                <img src="/da-logo.png" alt="Ministry Logo" className="w-1/2 opacity-50" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Sermons */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Latest <span className="fire-gradient-text">Messages</span></h2>
              <p className="text-white/60 text-lg">Catch up on recent teachings and powerful moments.</p>
            </div>
            <Link href="/media" className="hidden md:flex">
              <Button variant="outline" className="border-white/20 hover:bg-white/10" data-testid="btn-view-all-sermons">
                View All Sermons
              </Button>
            </Link>
          </div>

          {isVideosLoading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="aspect-video w-full rounded-xl bg-white/5" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {recentVideos.map((video) => (
                <a 
                  key={video.id}
                  href={`https://www.youtube.com/watch?v=${video.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block relative rounded-xl overflow-hidden bg-card border border-white/10 transition-all hover:border-primary/50 hover:shadow-[0_0_20px_rgba(232,76,30,0.15)]"
                  data-testid={`video-card-${video.id}`}
                >
                  <div className="aspect-video relative">
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
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-white line-clamp-2 mb-2 group-hover:text-primary transition-colors">{video.title}</h3>
                    <div className="flex items-center text-sm text-white/50">
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
            </div>
          )}
          
          <div className="mt-8 text-center md:hidden">
            <Link href="/media">
              <Button variant="outline" className="w-full border-white/20" data-testid="btn-view-all-sermons-mobile">
                View All Sermons
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <Flame size={48} className="text-primary mx-auto mb-6" />
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">Partner With The Vision</h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10">
            Your generosity fuels this ministry and helps us take the fire of God to the nations. 
            {statsData && ` Join ${statsData.subscribers.toLocaleString()} others in our community.`}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/give">
              <Button size="lg" className="h-14 px-8 text-lg bg-primary text-white hover:bg-primary/90 fire-glow" data-testid="btn-cta-give">
                Give Online
              </Button>
            </Link>
            <a href="https://www.youtube.com/@Dahinchuagni?sub_confirmation=1" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-white/20 hover:bg-white/10" data-testid="btn-cta-subscribe">
                Subscribe on YouTube
              </Button>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
