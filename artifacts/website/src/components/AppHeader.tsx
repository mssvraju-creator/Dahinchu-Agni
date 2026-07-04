import { useGetLiveStream, getGetLiveStreamQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Radio } from "lucide-react";

const CHANNEL_ID = "UChxz3kSq1sw0pLD3Pg-Vj7w";

interface AppHeaderProps {
  subtitle?: string;
}

export function AppHeader({ subtitle }: AppHeaderProps) {
  const { data: liveStatus } = useGetLiveStream(
    { channelId: CHANNEL_ID },
    { query: { refetchInterval: 60000, queryKey: getGetLiveStreamQueryKey({ channelId: CHANNEL_ID }) } }
  );

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-4 h-14 bg-background/95 backdrop-blur-md border-b border-white/8">
      <Link href="/" className="flex items-center gap-2.5">
        <img src="/da-logo-dark.png" alt="DA Logo" className="h-8 w-auto" />
        <div>
          <p className="text-white font-bold text-sm leading-tight tracking-tight">DAHINCHU AGNI</p>
          {subtitle && <p className="text-white/40 text-xs leading-none">{subtitle}</p>}
        </div>
      </Link>

      <div className="flex items-center gap-2">
        {liveStatus?.isLive && (
          <a
            href={`https://www.youtube.com/watch?v=${liveStatus.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 animate-pulse"
          >
            <Radio size={11} className="text-white" />
            <span className="text-white text-xs font-bold tracking-widest">LIVE</span>
          </a>
        )}
      </div>
    </header>
  );
}
